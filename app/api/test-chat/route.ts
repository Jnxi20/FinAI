import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

// Hack to support GOOGLE_API_KEY if GOOGLE_GENERATIVE_AI_API_KEY is not set
if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.GOOGLE_API_KEY) {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GOOGLE_API_KEY;
}

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = await streamText({
        model: google('gemini-2.5-flash'),
        messages,
    });

    return result.toTextStreamResponse();
}
