import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"Secret Santa 🎅" <${process.env.SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("EMAIL SENT:", info.messageId);
    return { ok: true };
  } catch (err) {
    console.error("EMAIL ERROR:", err);
    return { ok: false, error: err };
  }
}
