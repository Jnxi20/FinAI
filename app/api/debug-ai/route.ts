import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        const genAiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

        console.log('--- DEBUG AI ROUTE ---');
        console.log('GOOGLE_API_KEY present:', !!apiKey);
        console.log('GOOGLE_GENERATIVE_AI_API_KEY present:', !!genAiKey);

        if (!apiKey && !genAiKey) {
            return Response.json({
                status: 'error',
                message: 'No API keys found in environment variables.'
            }, { status: 500 });
        }

        // Try a simple generation
        console.log('Attempting generateText with gemini-pro...');
        const result = await generateText({
            model: google('gemini-pro'),
            prompt: 'Responde solo con la palabra: FUNCIONA',
        });

        console.log('Generation success:', result.text);

        return Response.json({
            status: 'success',
            model: 'gemini-1.5-flash',
            response: result.text,
            keys_configured: {
                GOOGLE_API_KEY: !!apiKey,
                GOOGLE_GENERATIVE_AI_API_KEY: !!genAiKey
            }
        });

    } catch (error: any) {
        console.error('Debug generation failed:', error);
        return Response.json({
            status: 'failure',
            error: error.message,
            stack: error.stack,
            details: error
        }, { status: 500 });
    }
}
