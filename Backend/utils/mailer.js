import nodemailer from "nodemailer";

let transporter = null;

// Só cria o transporter se o SMTP estiver configurado
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

export async function sendMail({ to, subject, html }) {
  // dev
  if (!transporter) {
    console.log("[DEV MAIL]", { to, subject, html });
    return;
  }

  // produção
  return transporter.sendMail({
    from: process.env.MAIL_FROM || "Secret Santa <no-reply@secretsanta.local>",
    to,
    subject,
    html,
  });
}
