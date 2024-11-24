import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { clerkClient, currentUser } from '@clerk/nextjs'
import { z } from 'zod'

export const runtime = 'edge'

const ModificationRecommendation = z.object({
    location: z.string(),
    modification: z.string(),
    product_id: z.string()
  })
  
  const RecommendationsResponse = z.object({
    modifications: z.array(ModificationRecommendation)
  })

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
        return new NextResponse('Missing OpenAI API Key.', { status: 400 })
      }
  
    const user = await currentUser()

    if (!user) {
      return new NextResponse('You need to sign in first.', { status: 401 })
    }

    const credits = user.publicMetadata?.credits
    const hasUnlimitedCredits = credits === 'unlimited'
    const numericCredits = Number(credits || 0)

    // Check if user has either unlimited credits or positive numeric credits
    if (!hasUnlimitedCredits && !numericCredits) {
      return new NextResponse('You have no credits left.', { status: 402 })
    }


    const { image, product_ids } = await req.json();

    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an assistant that analyzes images to recommend modifications that could accommodate aging in place more effectively for elderly people. You will output the response in JSON format.
          
Be as specific as possible in describing the parts of the image that require modifications. Include detailed visual characteristics such as color, size, shape, material, and exact locations within the image (e.g., "the grey office chair on the right side near the window"). Provide these details to help precisely identify each part in the image.

For each modification, select the single most appropriate accommodation from this list of product_ids: ${product_ids}
            {
              "modifications": [
                {
                  "location": "detailed visual description of the precise location in the image where the modification is needed",
                  "modification": "recommended improvement or change",
                  "product_id": "single most appropriate accommodation from the list of product_ids"
                }
              ]
            }`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this image and recommend modifications for elderly accommodation. Be specific and detailed." },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${image}`,
                  detail: "auto",
                },
              },
            ],
          },
        ],
        max_tokens: 500,
        response_format: { type: "json_object" }
      })

      const rawResponse = JSON.parse(response.choices[0].message.content || '{}')
      const validatedResponse = RecommendationsResponse.parse(rawResponse)
  

        // Only deduct credits if not unlimited
    if (!hasUnlimitedCredits) {
      await clerkClient.users.updateUserMetadata(user.id, {
        publicMetadata: {
          credits: numericCredits - 1
        }
      })
    }

    return NextResponse.json(validatedResponse)
  } catch (error: any) {
    return new NextResponse(error.message || 'Something went wrong!', { status: 500 })
  }
}