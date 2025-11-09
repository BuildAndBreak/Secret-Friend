import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    inviteToken: { type: String, index: true },
    inviteSentAt: Date,
  },
  { _id: false }
);

const PairIdSchema = new mongoose.Schema(
  {
    fromId: { type: String, required: true, trim: true },
    toId: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const ExclusionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    excludedMemberIds: { type: [String], default: [] },
  },
  { _id: false }
);

// Optional embedded wishlist: per member (ownerId)
const WishItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const WishlistSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true, trim: true },
    items: { type: [WishItemSchema], default: [] },
  },
  { _id: false }
);

// Optional group poll for gift value
const PollVoteSchema = new mongoose.Schema(
  {
    memberId: { type: String, required: true, trim: true },
    option: { type: Number, required: true },
  },
  { _id: false }
);

const GiftPollSchema = new mongoose.Schema(
  {
    options: { type: [Number], default: [10, 15, 20, 25, 30] },
    votes: { type: [PollVoteSchema], default: [] },
  },
  { _id: false }
);

const DrawSchema = new mongoose.Schema(
  {
    groupCode: { type: String, required: true, unique: true, index: true }, // single family link
    organizer: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },
    includeOrganizer: { type: Boolean, default: false },
    members: { type: [MemberSchema], default: [] },
    pairs: { type: [PairIdSchema], default: [] }, // { fromId, toId }
    exclusions: { type: [ExclusionSchema], default: [] },
    wishes: { type: [WishlistSchema], default: [] }, // [{ ownerId, items[] }]
    giftPoll: { type: GiftPollSchema, default: () => ({}) }, // poll options + votes
    requireInvites: { type: Boolean, default: false }, // toggles email-invite mode
    organizerVerifyToken: { type: String, index: true },
    organizerVerifiedAt: Date,
    status: {
      type: String,
      enum: ["draft", "awaiting_organizer_verify", "active"],
      default: "draft",
    },
    messages: [
      {
        memberId: String,
        text: String,
        createdAt: { type: Date, default: Date.now }, // group chat (MVP)
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Draw", DrawSchema);
