import mongoose from "mongoose";

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

const WishItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
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

const PollVoteSchema = new mongoose.Schema(
  {
    memberId: { type: String, required: true, trim: true },
    option: { type: Number, required: true },
  },
  { _id: false }
);

const GiftPollSchema = new mongoose.Schema(
  {
    options: {
      type: [Number],
      default: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
    },
    votes: { type: [PollVoteSchema], default: [] },
    finalPrice: { type: Number, default: null },
  },
  { _id: false }
);

const MemberSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    nickname: { type: String, required: true },
    inviteToken: { type: String, index: true },

    wishlist: {
      type: [WishItemSchema],
      default: [],
    },
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
    giftPoll: { type: GiftPollSchema, default: () => ({}) }, // poll options + votes
    organizerVerifyToken: { type: String, index: true },
    organizerVerifiedAt: Date,
    status: {
      type: String,
      enum: ["awaiting_organizer_verify", "active"],
      default: "awaiting_organizer_verify",
    },
    messages: [
      {
        memberId: String,
        text: String,
        nickname: String,
        createdAt: { type: Date, default: Date.now }, // group chat (MVP)
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Draw", DrawSchema);
