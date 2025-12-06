import express from "express";
import Draw from "../models/Draw.js";

const router = express.Router();

function namesById(draw) {
  const map = Object.fromEntries(draw.members.map((m) => [m.id, m.name]));
  return map;
}

async function findByToken(token) {
  return Draw.findOne({ "members.inviteToken": token });
}

// Individual member page
router.get("/:token", async (req, res) => {
  const { token } = req.params;
  const draw = await findByToken(token);

  if (!draw) return res.status(404).json({ message: "Invite not found" });

  if (draw.status !== "active") {
    return res.status(403).json({ message: "Group not active yet" });
  }

  const member = draw.members.find((m) => m.inviteToken === token);
  const map = namesById(draw);

  // find this member's pair
  const pair = draw.pairs.find((p) => p.fromId === member.id);
  const toId = pair?.toId || null;
  const toName = toId ? map[toId] : null;

  // member's poll vote
  const votes = draw.giftPoll?.votes;
  const memberVote = votes?.find((v) => v.memberId === member.id) || null;
  const allVoted = draw.members.every((m) =>
    votes?.some((v) => v.memberId === m.id)
  );
  const finalPrice = draw.giftPoll.finalPrice || null;

  const canReveal = allVoted;

  res.json({
    groupCode: draw.groupCode,
    participants: draw.members.map((m) => ({ name: m.name })),
    member,
    poll: {
      options: draw.giftPoll?.options || [],
      selected: memberVote ? memberVote.option : null,
      memberVote,
      allVoted,
      finalPrice,
    },
    toId: canReveal && toId ? toId : null,
    toName: canReveal && toName ? toName : null,
    messages: draw.messages?.slice(-50) || [], // last 50 msgs
  });
});

export default router;
