import { capitalizeFirstLetter } from "./capitalize.js";

const year = new Date().getFullYear();

export function verifyEmail({ draw, verifyUrl }) {
  return `
      <div style="background:#f7f7f7;padding:30px;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;padding:25px;box-shadow:0 2px 6px rgba(0,0,0,0.1);">
    
    <h2 style="text-align:center;color:#c0392b;">Welcome to Secret Santa! 🎅</h2>

    <p style="font-size:16px;color:#333;margin-top:20px;">
      Hi <strong>${capitalizeFirstLetter(draw.organizer)}</strong>,
    </p>

    <p style="font-size:16px;color:#333;">
      Your Secret Santa group has been created successfully! <br/>
      To activate your group and allow members to join, please confirm your email address by clicking the button below:
    </p>

    <div style="text-align:center;margin:30px 0;">
      <a href="${verifyUrl}" 
         style="background:#c0392b;color:#fff;padding:14px 22px;border-radius:6px;
                text-decoration:none;font-size:16px;font-weight:bold;">
        Verify My Secret Santa Group
      </a>
    </div>

    <p style="color:#555;font-size:15px;">
      If you didn’t create this group, you can safely ignore this email.
    </p>

    <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">

    <p style="font-size:13px;color:#888;text-align:center;">
      Secret Santa App © ${year} — Bring joy to your family & friends 🎄
    </p>

  </div>
</div>
    `;
}

export function organizerEmail({ draw, url }) {
  return `
            <div style="background:#fafafa;padding:30px;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;padding:25px;box-shadow:0 2px 6px rgba(0,0,0,0.08);">
        
        <h2 style="text-align:center;color:#27ae60;">Welcome to Secret Santa! 🎁</h2>
    
        <p style="color:#333;font-size:16px;margin-top:20px;">
          Hello <strong>${capitalizeFirstLetter(draw.organizer)}</strong>,
        </p>
    
        <p style="color:#333;font-size:16px;">
            Your Secret Santa group has been created successfully.<br/>
          Click the button below to access your Secret Santa page:
        </p>
    
        <div style="text-align:center;margin:30px 0;">
          <a href="${url}" 
             style="background:#27ae60;color:white;padding:14px 22px;border-radius:6px;
                    text-decoration:none;font-size:16px;font-weight:bold;">
            Join Secret Santa 🎄
          </a>
        </div>
    
        <p style="color:#555;font-size:15px;">
          You will see:
          <ul>
            <li>Your assigned Secret Santa 🎁</li>
            <li>Wishlist options</li>
            <li>The group gift value poll</li>
          </ul>
        </p>
    
        <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
    
        <p style="font-size:13px;color:#999;text-align:center;">
          Enjoy the holiday spirit!  
          Secret Santa App © ${year}
        </p>
    
      </div>
    </div>
          `;
}

export function membersEmail({ m, draw, url }) {
  return `
            <div style="background:#fafafa;padding:30px;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;padding:25px;box-shadow:0 2px 6px rgba(0,0,0,0.08);">
        
        <h2 style="text-align:center;color:#27ae60;">You've been invited to Secret Santa! 🎁</h2>
    
        <p style="color:#333;font-size:16px;margin-top:20px;">
          Hello <strong>${capitalizeFirstLetter(m.name)}</strong>,
        </p>
    
        <p style="color:#333;font-size:16px;">
          <strong>${capitalizeFirstLetter(
            draw.organizer
          )}</strong> has added you to their Secret Santa group.<br/>
          Click the button below to access your Secret Santa page:
        </p>
    
        <div style="text-align:center;margin:30px 0;">
          <a href="${url}" 
             style="background:#27ae60;color:white;padding:14px 22px;border-radius:6px;
                    text-decoration:none;font-size:16px;font-weight:bold;">
            Join Secret Santa 🎄
          </a>
        </div>
    
        <p style="color:#555;font-size:15px;">
          You will see:
          <ul>
            <li>Your assigned Secret Santa 🎁</li>
            <li>Wishlist options</li>
            <li>The group gift value poll</li>
          </ul>
        </p>
    
        <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
    
        <p style="font-size:13px;color:#999;text-align:center;">
          Enjoy the holiday spirit!  
          Secret Santa App © ${year}
        </p>
    
      </div>
    </div>
          `;
}
