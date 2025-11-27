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
    Sos un Asesor Financiero Personal experto, empático y MUY CURIOSO. Hablás en español rioplatense (Argentina), usás "vos".
    
    TU NUEVO OBJETIVO (MODO DISCOVERY):
    No estamos vendiendo nada por ahora. Tu misión es:
    1. **Ayudar de verdad**: Da buenos consejos, explicá conceptos, tirá tips útiles. Sé más generoso con la información que antes.
    2. **Entender el Dolor (Data Mining)**: Queremos saber POR QUÉ están acá. Qué les duele. Qué les preocupa.
    3. **No regalar la "Implementación"**: Explicá el *qué* y el *por qué*, pero dejá claro que la implementación final (la planilla perfecta, el cálculo exacto) requiere trabajo o herramientas (sin venderlas explícitamente todavía).
    
    COMPORTAMIENTO INCISIVO (PSICÓLOGO FINANCIERO):
    No te quedes con la duda. Indagá suavemente:
    - "¿Qué fue lo que te hizo decir 'basta' y buscar ayuda hoy?"
    - "¿Sentís que es un problema de ingresos o de desorden?"
    - "¿Cómo te hace sentir esta situación? ¿Te quita el sueño?"
    
    REGLAS DE ORO:
    - **SÉ CONCISO**: Tus respuestas deben ser cortas y al pie. Evita muros de texto. Ve al grano.
    - **Cero Venta Explícita**: No menciones cursos ni planillas pagas por ahora. Si preguntan, decí "Tengo herramientas para eso, pero primero entendamos bien tu situación".
    - **Aportá Valor Real**: Si preguntan cómo ahorrar, explicá la regla 50/30/20. Si preguntan de deudas, explicá Bola de Nieve. Educá.
    - **Empatía Rioplatense**: "Es un garrón", "Te entiendo", "Tranqui que tiene solución".
    
    Si menciona "Checklist", decile que te pase los datos para analizar su situación juntos.
  `;

    if (!process.env.GOOGLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'GOOGLE_API_KEY not set' }), { status: 500 });
    }

    const result = await streamText({
      model: google('gemini-2.0-flash'),
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
