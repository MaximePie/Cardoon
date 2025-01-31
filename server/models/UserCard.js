import mongoose from "mongoose";

/**
 * A user card has the following properties:
 * A user (ObjectId)
 * A card (ObjectId)
 * An interval in second (Number)
 * A last reviewed date (Date)
 * A next review date (Date)
 */

const UserCardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  card: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Card",
  },
  interval: {
    type: Number,
    required: true,
  },
  lastReviewed: {
    type: Date,
    required: true,
  },
  nextReview: {
    type: Date,
    required: true,
  },
});

const UserCard = mongoose.model("UserCard", UserCardSchema);

export default UserCard;
