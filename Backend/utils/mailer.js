import fetch from "node-fetch";

export async function sendMail({ to, subject, html }) {
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: process.env.SENDER_NAME,
          email: process.env.SENDER_EMAIL,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("BREVO API ERROR:", data);
      return { ok: false, error: data };
    }

    console.log("EMAIL SENT:", data.messageId || data);
    return { ok: true, data };
  } catch (err) {
    console.error("BREVO API ERROR:", err);
    return { ok: false, error: err };
  }
}
