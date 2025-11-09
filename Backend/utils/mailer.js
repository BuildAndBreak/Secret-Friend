import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

// Helper that logs when SMTP is not configured (useful in dev)
export async function sendMail({ to, subject, html }) {
  if (!process.env.SMTP_HOST) {
    console.log("[DEV MAIL]", { to, subject, html });
    return;
  }
  return transporter.sendMail({
    from: process.env.MAIL_FROM || "Secret Santa <no-reply@secretsanta.local>",
    to,
    subject,
    html,
  });
}
