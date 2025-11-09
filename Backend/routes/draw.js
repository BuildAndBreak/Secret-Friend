import express from "express";
import mongoose from "mongoose";
import { customAlphabet } from "nanoid";
import Draw from "../models/Draw.js";

const router = express.Router();
const nano = customAlphabet(
  "0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
  8
);
const ORGANIZER = "organizer";

// ---- helpers - Fisher-Yates shuffle algorithm
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildParticipants(members, includeOrganizer, organizerName) {
  const ids = members.map((m) => m.id);
  return includeOrganizer && organizerName ? [ORGANIZER, ...ids] : ids;
}

function normalizeExclusions(exclusions, participantIds) {
  const map = new Map(),
    valid = new Set(participantIds);
  for (const id of participantIds) map.set(id, new Set());
  for (const e of Array.isArray(exclusions) ? exclusions : []) {
    const owner = String(e?.id ?? "").trim();
    if (!valid.has(owner)) continue;
    for (const raw of e?.excludedMemberIds ?? []) {
      const t = String(raw ?? "").trim();
      if (valid.has(t) && t !== owner) {
        map.get(owner).add(t);
        map.get(t).add(owner);
      }
    }
  }
  for (const id of participantIds) map.get(id).delete(id);
  return map;
}

function isFeasible(ids, bans) {
  for (const p of ids) {
    const banned = bans.get(p) ?? new Set();
    let ok = false;
    for (const q of ids) {
      if (q !== p && !banned.has(q)) {
        ok = true;
        break;
      }
    }
    if (!ok) return false;
  }
  return true;
}

function drawWithExclusions(ids, bans) {
  const N = ids.length,
    used = new Set(),
    match = new Map();
  const opts = new Map();
  for (const o of ids) {
    const b = bans.get(o) ?? new Set();
    opts.set(
      o,
      ids.filter((t) => t !== o && !b.has(t))
    );
    if (!opts.get(o).length) return null;
  }
  const owners = ids
    .slice()
    .sort((a, b) => opts.get(a).length - opts.get(b).length);

  function dfs(i) {
    if (i === N) return true;
    const o = owners[i];
    for (const t of shuffle(opts.get(o))) {
      if (used.has(t)) continue;
      used.add(t);
      match.set(o, t);
      if (dfs(i + 1)) return true;
      used.delete(t);
      match.delete(o);
    }
    return false;
  }
  return dfs(0) ? match : null;
}

// Health (router)
router.get("/health", (_req, res) => res.json({ ok: true }));

// Create draw: returns { id, groupCode, pairs }
router.post("/", async (req, res) => {
  try {
    const { organizer, email, includeOrganizer, members, exclusions } =
      req.body ?? {};
    if (
      typeof organizer !== "string" ||
      typeof email !== "string" ||
      typeof includeOrganizer !== "boolean" ||
      !Array.isArray(members)
    ) {
      return res.status(400).json({ message: "Invalid payload" });
    }
    const organizerName = organizer.trim();
    const organizerEmail = email.trim().toLowerCase();
    const cleanMembers = members
      .map((m) => ({
        id: String(m?.id || "").trim(),
        name: String(m?.name || "").trim(),
        email: String(m?.email || "").trim(),
      }))
      .filter((m) => m.id && m.name && m.email);

    // unique IDs
    const idSet = new Set(cleanMembers.map((m) => m.id));
    if (idSet.size !== cleanMembers.length)
      return res.status(400).json({ message: "Member IDs must be unique" });

    const participantIds = buildParticipants(
      cleanMembers,
      includeOrganizer,
      organizerName
    );
    const MIN = 4;
    if (participantIds.length < MIN)
      return res.status(400).json({ message: `At least ${MIN} participants` });

    // names unique (defensive)
    const names = [
      ...cleanMembers.map((m) => m.name),
      ...(includeOrganizer && organizerName ? [organizerName] : []),
    ];
    if (new Set(names).size !== names.length)
      return res.status(400).json({ message: "Names must be unique" });

    // exclusions (ID-based)
    const bans = normalizeExclusions(exclusions, participantIds);
    if (!isFeasible(participantIds, bans))
      return res
        .status(400)
        .json({ message: "Impossible with current exclusions" });

    const assignment = drawWithExclusions(participantIds, bans);
    if (!assignment)
      return res.status(400).json({ message: "No valid pairing found" });

    const pairs = participantIds.map((ownerId) => ({
      fromId: ownerId,
      toId: assignment.get(ownerId),
    }));
    const groupCode = nano(32);

    const emailSet = new Set();
    for (const m of cleanMembers) {
      const e = (m.email || "").trim().toLowerCase();
      if (!e)
        return res
          .status(400)
          .json({ message: `Member ${m.name} needs an email.` });
      if (emailSet.has(e))
        return res
          .status(400)
          .json({ message: `Duplicate member email: ${e}` });
      emailSet.add(e);
    }

    // Prepare members with tokens
    const membersToSave = cleanMembers.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email.trim().toLowerCase(),
      inviteToken: nano(32),
    }));

    // Set verification state
    const draw = await Draw.create({
      groupCode,
      organizer: organizerName,
      email: organizerEmail,
      includeOrganizer,
      members: membersToSave,
      exclusions: Array.isArray(exclusions) ? exclusions : [],
      pairs,
      giftPoll: { options: [10, 15, 20, 25, 30], votes: [] },
      wishes: [],
      requireInvites: true, // invites always
      status: "awaiting_organizer_verify", // locked until organizer verifies
      organizerVerifyToken: nano(32),
    });

    return res.status(201).json({ id: draw._id.toString(), groupCode, pairs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});

// Get full by id (unchanged)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });
    const draw = await Draw.findById(id);
    if (!draw) return res.status(404).json({ message: "Not found" });
    res.json(draw);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
