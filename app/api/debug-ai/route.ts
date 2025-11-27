import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: 'No API Key found' }, { status: 500 });
    }

    try {
        console.log('--- DEBUG AI: LISTING MODELS ---');
        // Direct fetch to list models to see what this key can actually access
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        return NextResponse.json({
            status: response.ok ? 'success' : 'failure',
            statusCode: response.status,
            key_prefix: apiKey.substring(0, 4) + '...',
            available_models: data.models ? data.models.map((m: any) => m.name) : 'No models found',
            full_response: data
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
