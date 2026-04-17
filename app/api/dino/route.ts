// app/api/dino/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import decompress from 'decompress';

const NVIDIA_API_KEY = process.env.NVIDIA_PERSONAL_API_KEY;

if (!NVIDIA_API_KEY) {
  throw new Error('NVIDIA_PERSONAL_API_KEY is not set in environment variables.');
}

const nvai_url = 'https://ai.api.nvidia.com/v1/cv/nvidia/nv-grounding-dino';
const nvai_polling_url = 'https://api.nvcf.nvidia.com/v2/nvcf/pexec/status/';
const header_auth = `Bearer ${NVIDIA_API_KEY}`;

// Constants for polling
const MAX_RETRIES = 5;
const DELAY_BTW_RETRIES = 1000; // in milliseconds

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let imageTempPath: string | null = null;
  try {
    // Parse the form data
    const formData = await req.formData();
    const prompt = formData.get('prompt') as string;
    const imageFile = formData.get('image') as File;

    if (!prompt || !imageFile) {
      return NextResponse.json({ error: 'Prompt and image are required.' }, { status: 400 });
    }

    const mimeType = imageFile.type || 'image/jpeg';
    if (!mimeType.startsWith('image/')) {
      return NextResponse.json({ error: `Unsupported file type: ${mimeType}` }, { status: 400 });
    }

    // Save the uploaded image to a temporary file
    imageTempPath = await saveFileToTemp(imageFile);

    // Upload the image to NVIDIA API
    const asset_id = await uploadAsset(imageTempPath, 'Input Image', mimeType);

    // Prepare the inputs for NVIDIA API
    const inputs = {
      model: 'Grounding-Dino',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'media_url',
              media_url: {
                url: `data:${mimeType};asset_id,${asset_id}`,
              },
            },
          ],
        },
      ],
      threshold: 0.3,
    };

    const asset_list = asset_id;
    const headers = {
      'Content-Type': 'application/json',
      'NVCF-INPUT-ASSET-REFERENCES': asset_list,
      'NVCF-FUNCTION-ASSET-IDS': asset_list,
      Authorization: header_auth,
    };

    // Make the request to NVIDIA API
    const response = await fetch(nvai_url, {
      method: 'POST',
      headers,
      body: JSON.stringify(inputs),
    });

    // console.log('NVIDIA API response status:', response);

    let jsonData: any = null;

    if (response.status === 200) {
      // Evaluation complete, output ready
      ({ jsonData } = await handleResponse(response));
    } else if (response.status === 202) {
      // Pending evaluation
      const nvcf_reqid = response.headers.get('NVCF-REQID');
      if (!nvcf_reqid) {
        throw new Error('NVCF-REQID not found in the response headers.');
      }
      ({ jsonData } = await pollForResult(nvcf_reqid));
    } else {
      const errorText = await response.text();
      // console.error(`Unexpected response from NVIDIA API: ${response.status}, ${errorText}`);
      throw new Error(`Unexpected response status: ${response.status}, ${errorText}`);
    }

    if (jsonData) {
      return NextResponse.json({
        jsonData,
      });
    } else {
      throw new Error('No JSON data found in the response.');
    }
  } catch (error: any) {
    // console.error('Error in API handler:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    // Always clean up uploaded temp image directory.
    if (imageTempPath) {
      const tempDir = path.dirname(imageTempPath);
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  }
}

async function saveFileToTemp(file: File): Promise<string> {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'myapp-'));
  const filePath = path.join(tempDir, uuidv4() + '-' + file.name);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  fs.writeFileSync(filePath, buffer);

  return filePath;
}

async function uploadAsset(filePath: string, description: string, mimeType: string): Promise<string> {
  const assets_url = 'https://api.nvcf.nvidia.com/v2/nvcf/assets';

  const headers = {
    Authorization: header_auth,
    'Content-Type': 'application/json',
    accept: 'application/json',
  };

  const s3_headers = {
    'x-amz-meta-nvcf-asset-description': description,
    'content-type': mimeType,
  };

  const payload = { contentType: mimeType, description };

  const response = await fetch(assets_url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Asset upload initiation failed: ${response.status}, ${errorText}`);
  }

  const data = await response.json();

  const asset_url = data['uploadUrl'];
  const asset_id = data['assetId'];

  const fileData = fs.readFileSync(filePath);

  const uploadResponse = await fetch(asset_url, {
    method: 'PUT',
    headers: s3_headers,
    body: fileData,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(`Asset upload failed: ${uploadResponse.status}, ${errorText}`);
  }

  return asset_id;
}

async function handleResponse(response: Response): Promise<{ jsonData: any; }> {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const payload = await response.json();
    const parsedJsonData = extractDinoData(payload);
    return { jsonData: parsedJsonData };
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Create a temporary directory for processing
  const tempDir = os.tmpdir();
  const outputDir = path.join(tempDir, uuidv4());
  fs.mkdirSync(outputDir);

  const zipPath = path.join(outputDir, 'response.zip');
  fs.writeFileSync(zipPath, buffer);

  // Unzip the contents
  await decompress(zipPath, outputDir);

  // List files in outputDir
  const files = fs.readdirSync(outputDir);

  // Find the JSON file
  const jsonFile = files.find((f) => f.endsWith('.json') || f.endsWith('.response'));

  if (!jsonFile) {
    throw new Error('Result JSON not found in the unzipped contents.');
  }

  const jsonFilePath = path.join(outputDir, jsonFile);
  const jsonContent = fs.readFileSync(jsonFilePath, 'utf-8');
  const payload = JSON.parse(jsonContent);
  const parsedJsonData = extractDinoData(payload);

  // Clean up temporary files
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }

  return { jsonData: parsedJsonData };
}

async function pollForResult(nvcf_reqid: string): Promise<{ jsonData: any; }> {
  let retries = MAX_RETRIES;

  while (retries > 0) {
    await new Promise((resolve) => setTimeout(resolve, DELAY_BTW_RETRIES));

    const pollingResponse = await fetch(`${nvai_polling_url}${nvcf_reqid}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: header_auth,
      },
    });

    if (pollingResponse.status === 202) {
      // Evaluation still pending
      retries -= 1;
      continue;
    } else if (pollingResponse.status === 200) {
      // Evaluation complete, output ready
      return await handleResponse(pollingResponse);
    } else {
      const errorText = await pollingResponse.text();
      throw new Error(`Unexpected polling response: ${pollingResponse.status}, ${errorText}`);
    }
  }

  throw new Error('Max retries reached. Evaluation not completed.');
}

function extractDinoData(payload: any): { frameWidth: number; frameHeight: number; boundingBoxes: any[] } {
  const candidates: any[] = [];

  if (payload && typeof payload === 'object') {
    candidates.push(payload);

    const content = payload.choices?.[0]?.message?.content;
    if (typeof content === 'string') {
      try {
        candidates.push(JSON.parse(content));
      } catch {
        // Ignore invalid JSON in content string.
      }
    } else if (Array.isArray(content)) {
      for (const item of content) {
        if (item?.type === 'text' && typeof item?.text === 'string') {
          try {
            candidates.push(JSON.parse(item.text));
          } catch {
            // Ignore invalid JSON in text item.
          }
        } else if (item && typeof item === 'object') {
          candidates.push(item);
        }
      }
    } else if (content && typeof content === 'object') {
      candidates.push(content);
    }
  }

  const getBoxes = (obj: any) =>
    Array.isArray(obj?.boundingBoxes)
      ? obj.boundingBoxes
      : Array.isArray(obj?.boxes)
        ? obj.boxes
        : null;

  const getWidth = (obj: any) => obj?.frameWidth ?? obj?.frame_width;
  const getHeight = (obj: any) => obj?.frameHeight ?? obj?.frame_height;

  for (const candidate of candidates) {
    const boxes = getBoxes(candidate);
    if (boxes) {
      return {
        frameWidth: Number(getWidth(candidate) ?? 0),
        frameHeight: Number(getHeight(candidate) ?? 0),
        boundingBoxes: boxes,
      };
    }
  }

  throw new Error('Unable to extract bounding boxes and frame dimensions from DINO response.');
}