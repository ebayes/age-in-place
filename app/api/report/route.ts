import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { clerkClient, currentUser } from '@clerk/nextjs';
import { z } from 'zod';
import { OnboardingAnswers } from '@/types/report';

export const maxDuration = 120;
export const runtime = 'nodejs';

const REPORT_SECTIONS = [
  'Executive Summary',
  'Health Assessment',
  'Home Environment',
  'Care Requirements',
  'Safety Analysis',
  'Budget Considerations',
] as const;

const ReportSection = z.object({
  title: z.enum(REPORT_SECTIONS),
  content: z.string().min(50)
});

const ReportResponse = z.object({
  sections: z.array(ReportSection)
    .length(REPORT_SECTIONS.length)
    .refine(
      (sections) => 
        REPORT_SECTIONS.every(
          (title, index) => sections[index].title === title
        ),
      "Sections must be in the correct order"
    )
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return new NextResponse('Missing OpenAI API Key.', { status: 400 });
    }

    const user = await currentUser();
    if (!user) {
      return new NextResponse('You need to sign in first.', { status: 401 });
    }

    const credits = user.publicMetadata?.credits;
    const hasUnlimitedCredits = credits === 'unlimited';
    const numericCredits = Number(credits || 0);

    if (!hasUnlimitedCredits && !numericCredits) {
      return new NextResponse('You have no credits left.', { status: 402 });
    }

    const { answers }: { answers: OnboardingAnswers } = await req.json();

    const openAiPromise = openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert in aging-in-place and home modifications. Generate a detailed report based on the assessment data provided. The report must be returned as a JSON object with exactly these sections in this order:

{
  "sections": [
    {
      "title": "Executive Summary",
      "content": "Brief overview of the person and their main needs..."
    },
    {
      "title": "Health Assessment",
      "content": "Analysis of health conditions and their impact..."
    },
    {
      "title": "Home Environment",
      "content": "Detailed analysis of their current living space..."
    },
    {
      "title": "Care Requirements",
      "content": "Breakdown of personal care and assistance needs..."
    },
    {
      "title": "Safety Analysis",
      "content": "Assessment of current safety measures..."
    },
    {
      "title": "Budget Considerations",
      "content": "Analysis of budget constraints and priorities..."
    }
  ]
}

Each section's content must:
1. Use markdown formatting such as headers, lists, and bold text. Make it rich and readable.
2. Be detailed and specific to the person's situation
3. Provide actionable recommendations
4. Reference specific details from the assessment data
5. Be at least a few paragraphs long`
        },
        {
          role: 'user',
          content: JSON.stringify(answers)
        }
      ],
      response_format: { type: "json_object" },
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI request timeout')), 50000);
    });

    try {
      const response = await Promise.race([openAiPromise, timeoutPromise]);
      const rawResponse = JSON.parse(response.choices[0].message.content || '{}');
      const validatedResponse = ReportResponse.parse(rawResponse);

      if (!hasUnlimitedCredits) {
        await clerkClient.users.updateUserMetadata(user.id, {
          publicMetadata: {
            credits: numericCredits - 1
          }
        });
      }

      return NextResponse.json(validatedResponse);
    } catch (error: any) {
      if (error.message === 'OpenAI request timeout') {
        return new NextResponse('Request timed out', { status: 504 });
      }
      throw error;
    }
  } catch (error: any) {
    return new NextResponse(
      `Something went wrong: ${error.message}`, 
      { status: 500 }
    );
  }
};