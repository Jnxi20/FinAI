import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string, name: string) {
    if (!process.env.RESEND_API_KEY) {
        console.log('RESEND_API_KEY not set, skipping email.');
        return;
    }

    try {
        const data = await resend.emails.send({
            from: 'FinAI <onboarding@resend.dev>', // Use resend.dev for testing without domain
            to: [email],
            subject: '¡Bienvenido a FinAI! 🚀',
            html: `
        <div style="font-family: sans-serif; color: #333;">
          <h1>¡Hola ${name}! 👋</h1>
          <p>Bienvenido a <strong>FinAI</strong>, tu nuevo asesor financiero personal con acento argentino.</p>
          <p>Estoy acá para ayudarte a ordenar tus números, planificar tu retiro y salir de deudas, todo sin vueltas.</p>
          <p>Para empezar:</p>
          <ul>
            <li>Entrá al chat y contame tu situación.</li>
            <li>Usá el <strong>Checklist</strong> para darme un panorama rápido.</li>
            <li>Subí tus documentos si tenés dudas puntuales.</li>
          </ul>
          <p>¡Hablemos pronto!</p>
          <p><em>El equipo de FinAI</em></p>
        </div>
      `,
        });

        console.log('Welcome email sent:', data);
        return data;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return null;
    }
}
