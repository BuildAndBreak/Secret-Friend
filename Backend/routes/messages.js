import express from "express";
import Draw from "../models/Draw.js";
import { sendMail } from "../utils/mailer.js";
import { chatEmail } from "../utils/template.js";

const router = express.Router();

router.post("/:code", async (req, res) => {
  const { code } = req.params;
  const { memberId, text } = req.body ?? {};

  const draw = await Draw.findOne({ groupCode: code });

  if (!draw) return res.status(404).json({ message: "Group not found" });

  if (!memberId)
    return res.status(400).json({ message: "member data not found" });

  if (!text.trim()) return res.status(400).json({ message: "Empty message" });

  const sender = draw.members.find((m) => m.id === memberId);
  if (!sender) return res.status(403).json({ message: "Invalid member id" });

  try {
    draw.messages.push({
      memberId: memberId,
      text: text,
      nickname: sender.nickname,
      createdAt: new Date(),
    });

    await draw.save();

    const mailTo = draw.members.filter((m) => m.id !== memberId).map((m) => m);

    for (const m of mailTo) {
      if (!m.email || !m.inviteToken) continue;
      const url = `${process.env.FRONTEND_URL}/i/${m.inviteToken}`;

      await sendMail({
        to: m.email,
        subject: `New message in Secret Santa chat`,
        html: chatEmail({
          m,
          nickname: sender.nickname,
          url,
        }),
      });
    }

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
