import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMail({ to, subject, html }) {
  try {
    await resend.emails.send({
      from: "Secret Santa 🎅 <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    return { ok: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { ok: false, error };
  }
}
