import express from "express";
import Draw from "../models/Draw.js";
import { nanoid } from "nanoid";

const router = express.Router();
const ORGANIZER = "organizer";

function namesById(draw) {
  const map = Object.fromEntries(draw.members.map((m) => [m.id, m.name]));
  if (draw.includeOrganizer && draw.organizer) map[ORGANIZER] = draw.organizer;
  return map;
}

async function findByToken(token) {
  return Draw.findOne({ "members.inviteToken": token });
}

router.get("/:token", async (req, res) => {
  const { token } = req.params;
  const draw = await findByToken(token);
  if (!draw) return res.status(404).json({ message: "Invite not found" });
  if (draw.requireInvites && draw.status !== "active") {
    return res.status(403).json({ message: "Group not active yet" });
  }

  const member = draw.members.find((m) => m.inviteToken === token);
  const map = namesById(draw);

  // find this member's pair
  const pair = draw.pairs.find((p) => p.fromId === member.id);
  const toId = pair?.toId || null;
  const toName = toId ? map[toId] : null;

  // wishlist bucket for this owner
  const bucket = (draw.wishes || []).find((w) => w.ownerId === member.id);
  const items = bucket?.items || [];

  // member's poll vote
  const vote =
    (draw.giftPoll?.votes || []).find((v) => v.memberId === member.id)
      ?.option ?? null;

  res.json({
    groupCode: draw.groupCode,
    memberId: member.id,
    name: member.name,
    toId,
    toName,
    wishlist: items,
    poll: { options: draw.giftPoll?.options || [], myVote: vote },
    messages: draw.messages?.slice(-50) || [], // last 50 msgs
  });
});

router.post("/:token/wishlist", async (req, res) => {
  const { token } = req.params;
  const { text } = req.body ?? {};
  const t = String(text || "").trim();
  if (!t) return res.status(400).json({ message: "text required" });

  const draw = await findByToken(token);
  if (!draw) return res.status(404).json({ message: "Invite not found" });
  const member = draw.members.find((m) => m.inviteToken === token);

  let wl = (draw.wishes || []).find((w) => w.ownerId === member.id);
  if (!wl) {
    wl = { ownerId: member.id, items: [] };
    draw.wishes.push(wl);
  }
  wl.items.push({ id: nanoid(10), text: t, createdAt: new Date() });
  await draw.save();

  res.status(201).json({ ownerId: member.id, items: wl.items });
});

router.post("/:token/message", async (req, res) => {
  const { token } = req.params;
  const { text } = req.body ?? {};
  const t = String(text || "").trim();
  if (!t) return res.status(400).json({ message: "text required" });

  const draw = await findByToken(token);
  if (!draw) return res.status(404).json({ message: "Invite not found" });
  const member = draw.members.find((m) => m.inviteToken === token);

  draw.messages.push({ memberId: member.id, text: t, createdAt: new Date() });
  await draw.save();
  res.status(201).json({ ok: true });
});

export default router;
