import express from "express";
import Draw from "../models/Draw.js";
import { sendMail } from "../utils/mailer.js";
import { nanoid } from "nanoid";
import {
  verifyEmail,
  membersEmail,
  organizerEmail,
} from "../utils/template.js";

const router = express.Router();

// Build { id -> name } (includes organizer)
function namesById(draw) {
  const map = Object.fromEntries(draw.members.map((m) => [m.id, m.name]));
  return map;
}

// Start verification (emails the organizer with a verify link).
router.post("/:code/initiate-verification", async (req, res) => {
  const { code } = req.params;
  const draw = await Draw.findOne({ groupCode: code });

  if (!draw) return res.status(404).json({ message: "Group not found" });

  if (draw.status !== "awaiting_organizer_verify") {
    return res.status(400).json({
      message: `Group is ${draw.status}, cannot initiate verification.`,
    });
  }

  if (!draw.organizerVerifyToken) {
    draw.organizerVerifyToken = nanoid(32);
    await draw.save();
  }

  const verifyUrl = `${
    process.env.FRONTEND_URL
  }/verify?code=${encodeURIComponent(draw.groupCode)}&t=${encodeURIComponent(
    draw.organizerVerifyToken
  )}`;

  await sendMail({
    to: draw.email,
    subject: "Confirm Secret Santa Group",
    html: verifyEmail({ draw, verifyUrl }),
  });

  res.json({ ok: true });
});

router.get("/:code/status", async (req, res) => {
  try {
    const { code } = req.params;
    const draw = await Draw.findOne({ groupCode: code });

    if (!draw) return res.status(404).json({ message: "Group not found" });

    res.json({ status: draw.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Verify organizer (activates the group, then sends member invites).
router.get("/:code/verify", async (req, res) => {
  const { code } = req.params;
  const { t } = req.query;
  const draw = await Draw.findOne({ groupCode: code });

  if (!draw) return res.status(404).json({ message: "Group not found" });

  if (draw.status !== "awaiting_organizer_verify") {
    return res
      .status(400)
      .json({ message: `Group is ${draw.status}, nothing to verify.` });
  }

  if (!t || t !== draw.organizerVerifyToken) {
    return res.status(400).json({ message: "Invalid or missing token" });
  }

  draw.status = "active";
  draw.organizerVerifiedAt = new Date();

  // send member invites
  const base = process.env.FRONTEND_URL?.replace(/\/$/, "");
  for (const m of draw.members) {
    if (!m.email || !m.inviteToken) continue;
    const url = `${base}/i/${m.inviteToken}`;
    const emailToOrganizer =
      m.email === draw.email && m.name === draw.organizer;

    await sendMail({
      to: m.email,
      subject: "You're in Secret Santa!",
      html: emailToOrganizer
        ? organizerEmail({ draw, url })
        : membersEmail({ m, draw, url }),
    });
    m.inviteSentAt = new Date();
  }

  await draw.save();
  res.json({ ok: true });
});

// POST /api/groups/:code/reveal  { memberId } -> only this person’s match
router.post("/:code/reveal", async (req, res) => {
  try {
    const { code } = req.params;
    const { memberId } = req.body ?? {};
    if (!memberId)
      return res.status(400).json({ message: "memberId required" });

    const draw = await Draw.findOne({ groupCode: code });
    if (!draw) return res.status(404).json({ message: "Group not found" });

    const pair = draw.pairs.find((p) => p.fromId === memberId);
    if (!pair) return res.status(404).json({ message: "Pair not found" });

    const map = namesById(draw);
    res.json({
      fromId: memberId,
      toId: pair.toId,
      toName: map[pair.toId],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/groups/:code/wishlist/:ownerId
router.get("/:code/wishlist/:ownerId", async (req, res) => {
  try {
    const { code, ownerId } = req.params;
    const draw = await Draw.findOne({ groupCode: code });
    if (!draw) return res.status(404).json({ message: "Group not found" });

    const wl = draw.wishes.find((w) => w.ownerId === ownerId);
    res.json({ ownerId, items: wl?.items ?? [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/groups/:code/wishlist/:ownerId   { text }
router.post("/:code/wishlist/:ownerId", async (req, res) => {
  try {
    const { code, ownerId } = req.params;
    const { text } = req.body ?? {};
    const t = String(text || "").trim();
    if (!t) return res.status(400).json({ message: "text required" });

    const draw = await Draw.findOne({ groupCode: code });
    if (!draw) return res.status(404).json({ message: "Group not found" });

    let wl = draw.wishes.find((w) => w.ownerId === ownerId);
    if (!wl) {
      wl = { ownerId, items: [] };
      draw.wishes.push(wl);
    }
    wl.items.push({
      id: Math.random().toString(36).slice(2, 10),
      text: t,
      createdAt: new Date(),
    });
    await draw.save();

    res.status(201).json({ ownerId, items: wl.items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/groups/:code/poll
router.get("/:code/poll", async (req, res) => {
  try {
    const { code } = req.params;
    const draw = await Draw.findOne({ groupCode: code });
    if (!draw) return res.status(404).json({ message: "Group not found" });

    const tally = Object.fromEntries(
      (draw.giftPoll?.options ?? []).map((o) => [o, 0])
    );
    for (const v of draw.giftPoll?.votes ?? [])
      tally[v.option] = (tally[v.option] || 0) + 1;

    res.json({
      options: draw.giftPoll?.options ?? [],
      votes: draw.giftPoll?.votes ?? [],
      tally,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/groups/:code/poll/vote   { memberId, option }
router.post("/:code/poll/vote", async (req, res) => {
  try {
    const { code } = req.params;
    const { memberId, option } = req.body ?? {};
    if (!memberId || typeof option !== "number")
      return res
        .status(400)
        .json({ message: "memberId and numeric option required" });

    const draw = await Draw.findOne({ groupCode: code });
    if (!draw) return res.status(404).json({ message: "Group not found" });

    if (!draw.giftPoll.options.includes(option))
      return res.status(400).json({ message: "Invalid option" });

    // upsert vote for this memberId
    const existing = draw.giftPoll.votes.find((v) => v.memberId === memberId);
    if (existing) existing.option = option;
    else draw.giftPoll.votes.push({ memberId, option });

    await draw.save();

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
