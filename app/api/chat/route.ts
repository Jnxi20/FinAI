import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Hack to support GOOGLE_API_KEY if GOOGLE_GENERATIVE_AI_API_KEY is not set
if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.GOOGLE_API_KEY) {
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GOOGLE_API_KEY;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const session = await getServerSession(authOptions);

    console.log('--- Chat API Request Received ---');
    console.log('User:', session?.user?.email || 'Anonymous');

    // Identify the new user message (last one)
    const lastMessage = messages[messages.length - 1];
    let sessionId: string | null = null;

    // Persistence Logic
    if (session?.user?.email && lastMessage.role === 'user') {
      try {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });

        if (user) {
          // Find the most recent active session or create a new one
          // For simplicity in this iteration, we'll try to find a session from today or create new
          // Ideally, the frontend should pass a sessionId, but we'll infer it for now
          let chatSession = await prisma.chatSession.findFirst({
            where: { userId: user.id },
            orderBy: { updatedAt: 'desc' }
          });

          // If no session or session is old (e.g., > 1 hour), create new? 
          // Let's just always use the latest one for continuity, or create if none.
          if (!chatSession) {
            chatSession = await prisma.chatSession.create({
              data: { userId: user.id, title: 'Nueva Conversación' }
            });
          }

          sessionId = chatSession.id;

          // Save User Message
          await prisma.message.create({
            data: {
              sessionId: chatSession.id,
              role: 'user',
              content: lastMessage.content
            }
          });
        }
      } catch (dbError) {
        console.error('Error saving user message:', dbError);
      }
    }

    const systemPrompt = `
    Eres un Asesor Financiero útil y amable. Ayuda al usuario con sus dudas de finanzas personales.
    Responde de manera concisa y clara.
    `;

    if (!process.env.GOOGLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'GOOGLE_API_KEY not set' }), { status: 500 });
    }

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      messages,
      onFinish: async ({ text }) => {
        console.log('--- AI GENERATION FINISHED ---');
        console.log('Generated text length:', text.length);
        if (text.length === 0) {
          console.error('WARNING: AI generated empty text!');
        }

        // Save AI Response if we have a session
        if (sessionId && text.length > 0) {
          try {
            await prisma.message.create({
              data: {
                sessionId: sessionId,
                role: 'assistant',
                content: text
              }
            });
            console.log('AI response saved to DB');
          } catch (dbError) {
            console.error('Error saving AI response:', dbError);
          }
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('--- ERROR IN CHAT API ---');
    console.error(error);
    return new Response(JSON.stringify({ error: 'Error processing chat request', details: error }), { status: 500 });
  }
}
