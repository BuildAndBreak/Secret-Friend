import { capitalizeFirstLetter } from "./capitalize.js";

const year = new Date().getFullYear();

export function verifyEmail({ draw, verifyUrl }) {
  const year = new Date().getFullYear();

  return `
<table width="100%" style="background:#f7f7f7;padding:30px 0;font-family:Arial,sans-serif;">
<tr><td align="center">
<table width="600" style="background:#fff;border-radius:8px;padding:25px;">
<tr><td align="center" style="padding-bottom:10px;">
  <h2 style="color:#c0392b;margin:0;font-size:22px;">Welcome to Secret Santa 🎅</h2>
</td></tr>

<tr><td style="font-size:15px;color:#333;padding-top:10px;">
  Hi <strong>${capitalizeFirstLetter(draw.organizer)}</strong>,
</td></tr>

<tr><td style="font-size:15px;color:#333;padding:10px 0;">
  Please verify your email to activate your Secret Santa group:
</td></tr>

<tr><td align="center" style="padding:20px 0;">
  <a href="${verifyUrl}" 
     style="background:#c0392b;color:#fff;padding:12px 22px;text-decoration:none;
     border-radius:6px;font-size:15px;font-weight:bold;display:inline-block;">
     Verify Email
  </a>
</td></tr>

<tr><td style="font-size:14px;color:#555;">
  If this wasn’t you, just ignore this email.
</td></tr>

<tr><td align="center" style="padding-top:25px;font-size:12px;color:#999;">
  Secret Santa App © ${year}
</td></tr>

</table>
</td></tr>
</table>
`;
}

export function organizerEmail({ draw, url }) {
  const year = new Date().getFullYear();

  return `
<table width="100%" style="background:#fafafa;padding:30px 0;font-family:Arial,sans-serif;">
<tr><td align="center">
<table width="600" style="background:#fff;border-radius:8px;padding:25px;">

<tr><td align="center" style="padding-bottom:10px;">
  <h2 style="color:#27ae60;margin:0;font-size:22px;">Your Secret Santa Is Ready 🎄</h2>
</td></tr>

<tr><td style="font-size:15px;color:#333;padding-top:10px;">
  Hello <strong>${capitalizeFirstLetter(draw.organizer)}</strong>,
</td></tr>

<tr><td style="font-size:15px;color:#333;padding:10px 0;">
  Your Secret Santa group is active. Access your organizer page below:
</td></tr>

<tr><td align="center" style="padding:20px 0;">
  <a href="${url}" 
     style="background:#27ae60;color:#fff;padding:12px 22px;text-decoration:none;
     border-radius:6px;font-size:15px;font-weight:bold;display:inline-block;">
     Open Organizer Panel
  </a>
</td></tr>

<tr><td style="font-size:14px;color:#555;padding-bottom:10px;">
  You’ll be able to:
</td></tr>

<tr><td style="font-size:14px;color:#555;">
  <ul style="margin:0;padding-left:18px;">
    <li>View participants</li>
    <li>Monitor gift value poll</li>
    <li>Browse wishlists & chat</li>
  </ul>
</td></tr>

<tr><td align="center" style="padding-top:25px;font-size:12px;color:#999;">
  Secret Santa App © ${year}
</td></tr>

</table>
</td></tr>
</table>
`;
}

export function membersEmail({ m, draw, url }) {
  const year = new Date().getFullYear();

  return `
<table width="100%" style="background:#fafafa;padding:30px 0;font-family:Arial,sans-serif;">
<tr><td align="center">
<table width="600" style="background:#fff;border-radius:8px;padding:25px;">

<tr><td align="center" style="padding-bottom:10px;">
  <h2 style="color:#27ae60;margin:0;font-size:22px;">You've Been Invited 🎁</h2>
</td></tr>

<tr><td style="font-size:15px;color:#333;padding-top:10px;">
  Hello <strong>${capitalizeFirstLetter(m.name)}</strong>,
</td></tr>

<tr><td style="font-size:15px;color:#333;padding:10px 0;">
  <strong>${capitalizeFirstLetter(
    draw.organizer
  )}</strong> added you to their Secret Santa group.
</td></tr>

<tr><td align="center" style="padding:20px 0;">
  <a href="${url}" 
     style="background:#27ae60;color:#fff;padding:12px 22px;text-decoration:none;
     border-radius:6px;font-size:15px;font-weight:bold;display:inline-block;">
     Enter Secret Santa
  </a>
</td></tr>

<tr><td style="font-size:14px;color:#555;padding-bottom:10px;">
  Inside your page you'll find:
</td></tr>

<tr><td style="font-size:14px;color:#555;">
  <ul style="margin:0;padding-left:18px;">
    <li>Your assigned person</li>
    <li>Your wishlist</li>
    <li>The gift value poll</li>
    <li>The group chat</li>
  </ul>
</td></tr>

<tr><td align="center" style="padding-top:25px;font-size:12px;color:#999;">
  Secret Santa App © ${year}
</td></tr>

</table>
</td></tr>
</table>
`;
}
