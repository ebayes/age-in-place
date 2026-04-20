import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_DETECTION_MODEL || 'gemini-2.5-flash';
const SUPPORTED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png']);
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables.');
    }

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
    if (!SUPPORTED_IMAGE_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: `Unsupported image type "${mimeType}". Please upload JPG or PNG.` },
        { status: 400 }
      );
    }

    const phrases = parsePromptPhrases(prompt);
    if (phrases.length === 0) {
      return NextResponse.json({ error: 'No valid location phrases provided.' }, { status: 400 });
    }

    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const imageBase64 = imageBuffer.toString('base64');
    const { width, height } = getImageDimensions(imageBuffer, mimeType);

    const geminiResponse = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildGeminiRequestBody(phrases, mimeType, imageBase64)),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      throw new Error(`Unexpected response status: ${geminiResponse.status}, ${errorText}`);
    }

    const geminiPayload = await geminiResponse.json();
    const detections = parseGeminiDetections(geminiPayload);
    const boundingBoxes = convertDetectionsToBoundingBoxes(detections, phrases, width, height);

    return NextResponse.json({
      jsonData: {
        frameWidth: width,
        frameHeight: height,
        boundingBoxes,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to run Gemini detection.' }, { status: 500 });
  }
}

function parsePromptPhrases(prompt: string): string[] {
  return prompt
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildGeminiRequestBody(phrases: string[], mimeType: string, imageBase64: string) {
  const phraseList = phrases.map((phrase, index) => `${index + 1}. ${phrase}`).join('\n');

  return {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: [
              'Detect bounding boxes for the requested room locations.',
              'Return JSON only with this exact shape:',
              '{"detections":[{"requested_phrase":"<one of requested phrases>","box_2d":[ymin,xmin,ymax,xmax],"confidence":0.0}]}',
              'Rules:',
              '- requested_phrase must be exactly one phrase from the provided list.',
              '- box_2d values must be normalized integers from 0 to 1000.',
              '- Include at most one best bounding box per requested phrase.',
              '- Omit phrases that are not visible in the image.',
              `Requested phrases:\n${phraseList}`,
            ].join('\n'),
          },
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0,
      responseMimeType: 'application/json',
    },
  };
}

function parseGeminiDetections(payload: any): Array<{ requested_phrase: string; box_2d: number[]; confidence?: number }> {
  const textPart = payload?.candidates?.[0]?.content?.parts?.find((part: any) => typeof part?.text === 'string')?.text;
  if (!textPart) {
    return [];
  }

  const parsed = parseJsonPayload(textPart);
  const detections = Array.isArray(parsed?.detections) ? parsed.detections : [];

  return detections
    .map((item: any) => ({
      requested_phrase: String(item?.requested_phrase || '').trim(),
      box_2d: Array.isArray(item?.box_2d) ? item.box_2d.map((value: any) => Number(value)) : [],
      confidence: Number(item?.confidence ?? 0),
    }))
    .filter((item: any) => item.requested_phrase && item.box_2d.length === 4);
}

function parseJsonPayload(raw: string): any {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```json\s*([\s\S]*?)\s*```/i) || trimmed.match(/```\s*([\s\S]*?)\s*```/i);
    if (fenced?.[1]) {
      return JSON.parse(fenced[1]);
    }
    throw new Error(`Unable to parse Gemini JSON payload: ${trimmed.slice(0, 180)}`);
  }
}

function convertDetectionsToBoundingBoxes(
  detections: Array<{ requested_phrase: string; box_2d: number[]; confidence?: number }>,
  phrases: string[],
  imageWidth: number,
  imageHeight: number
) {
  const lowerToOriginal = new Map(phrases.map((phrase) => [phrase.toLowerCase(), phrase]));
  const matched = new Map<string, any>();

  for (const detection of detections) {
    const key = detection.requested_phrase.toLowerCase();
    const originalPhrase = lowerToOriginal.get(key);
    if (!originalPhrase || matched.has(originalPhrase)) {
      continue;
    }

    const [yminRaw, xminRaw, ymaxRaw, xmaxRaw] = detection.box_2d;
    const ymin = clamp(Number(yminRaw), 0, 1000);
    const xmin = clamp(Number(xminRaw), 0, 1000);
    const ymax = clamp(Number(ymaxRaw), 0, 1000);
    const xmax = clamp(Number(xmaxRaw), 0, 1000);

    const x = Math.round((xmin / 1000) * imageWidth);
    const y = Math.round((ymin / 1000) * imageHeight);
    const width = Math.max(1, Math.round(((xmax - xmin) / 1000) * imageWidth));
    const height = Math.max(1, Math.round(((ymax - ymin) / 1000) * imageHeight));

    matched.set(originalPhrase, {
      phrase: originalPhrase,
      bboxes: [[x, y, width, height]],
      confidence: [clamp(Number(detection.confidence ?? 0), 0, 1)],
    });
  }

  return phrases
    .filter((phrase) => matched.has(phrase))
    .map((phrase) => matched.get(phrase));
}

function getImageDimensions(buffer: Buffer, mimeType: string): { width: number; height: number } {
  if (mimeType === 'image/png') {
    if (buffer.length < 24) {
      throw new Error('Invalid PNG image.');
    }
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  }

  if (mimeType === 'image/jpeg') {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }

      const marker = buffer[offset + 1];
      const markerLength = buffer.readUInt16BE(offset + 2);
      const isSOFMarker =
        marker === 0xc0 ||
        marker === 0xc1 ||
        marker === 0xc2 ||
        marker === 0xc3 ||
        marker === 0xc5 ||
        marker === 0xc6 ||
        marker === 0xc7 ||
        marker === 0xc9 ||
        marker === 0xca ||
        marker === 0xcb ||
        marker === 0xcd ||
        marker === 0xce ||
        marker === 0xcf;

      if (isSOFMarker) {
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        return { width, height };
      }

      if (markerLength < 2) {
        break;
      }
      offset += markerLength + 2;
    }
  }

  throw new Error('Unsupported or invalid image format.');
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.max(min, Math.min(value, max));
}