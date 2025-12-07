import nodemailer from "nodemailer";

let transporter = null;

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

if (transporter) {
  transporter.verify((err) => {
    if (err) {
      console.error("SMTP error:", err);
    } else {
      console.log("SMTP ready to send emails");
    }
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
    from: process.env.SENDER_EMAIL,
    to,
    subject,
    html,
  });
}
