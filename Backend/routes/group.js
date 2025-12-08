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

// Group Status for the verify Page
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

// Route to get the organizer invite token
router.get("/:code/organizer-invite-token", async (req, res) => {
  try {
    const { code } = req.params;
    const draw = await Draw.findOne({ groupCode: code });

    if (!draw) return res.status(404).json({ message: "Group not found" });
    if (!draw.includeOrganizer) return res.json({ organizerInviteToken: null });

    const organizer = draw.members.find((m) => m.email === draw.email);

    res.json({ organizerInviteToken: organizer?.inviteToken || null });
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

// Receive wishlist item
router.post("/:code/wishlist/:memberId", async (req, res) => {
  try {
    const { code, memberId } = req.params;
    const { text } = req.body ?? {};
    const t = String(text || "").trim();

    if (!t) return res.status(400).json({ message: "text required" });

    const draw = await Draw.findOne({ groupCode: code });
    if (!draw) return res.status(404).json({ message: "Group not found" });

    const member = draw.members.find((m) => m.id === memberId);
    if (!member) return res.status(404).json({ message: "Member not found" });

    if (member.wishlist.length >= 3) {
      return res.status(400).json({
        message: "You can only add up to 3 wishlist items",
      });
    }

    member.wishlist.push({
      id: nanoid(8),
      text: t,
      createdAt: new Date(),
    });

    await draw.save();

    res.status(201).json({ items: member.wishlist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Receive the member vote { memberId, option }
router.post("/:code/poll/vote", async (req, res) => {
  const { code } = req.params;
  const { memberId, option } = req.body ?? {};

  const draw = await Draw.findOne({ groupCode: code });
  if (!draw) return res.status(404).json({ message: "Group not found" });

  // option may be String from the input (other)
  const numOption = Number(option);

  if (!memberId || Number.isNaN(numOption))
    return res
      .status(400)
      .json({ message: "memberId and numeric option required" });

  try {
    // upsert vote
    const existing = draw.giftPoll.votes.find((v) => v.memberId === memberId);

    if (existing) {
      return res.status(400).json({ message: "Votação já efetuada." });
    }

    draw.giftPoll.votes.push({ memberId, option: numOption });

    await draw.save();

    const allVoted = draw.members.every((m) =>
      draw.giftPoll.votes.some((v) => v.memberId === m.id)
    );

    if (!allVoted) {
      return res.json({ ok: true, allVoted: false });
    }

    // All voted - calculate final price
    const votes = draw.giftPoll.votes.map((v) => v.option);

    const freq = {};
    for (const val of votes) {
      freq[val] = (freq[val] || 0) + 1;
    }

    const maxFreq = Math.max(...Object.values(freq));

    const tiedOptions = Object.keys(freq)
      .filter((key) => freq[key] === maxFreq)
      .map(Number);

    let finalPrice;

    if (tiedOptions.length === 1) {
      finalPrice = tiedOptions[0];
    } else {
      const avg = tiedOptions.reduce((a, b) => a + b, 0) / tiedOptions.length;
      finalPrice = Math.round(avg / 5) * 5; //round to nearest multiple of 5
    }

    draw.giftPoll.finalPrice = finalPrice;
    draw.giftPoll.lockedAt = new Date();

    await draw.save();

    res.json({ ok: true, allVoted: true, finalPrice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
