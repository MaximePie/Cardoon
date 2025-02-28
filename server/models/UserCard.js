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
  answerStreak: {
    // Number of consecutive correct answers
    // Resets to 0 if the user gets an answer wrong
    type: Number,
    default: 0,
  },
});

UserCardSchema.methods.updateInterval = async function (newInterval) {
  this.interval = newInterval;
  this.lastReviewed = new Date();
  this.nextReview = new Date(Date.now() + newInterval * 1000);
  await this.save();
};

const UserCard = mongoose.model("UserCard", UserCardSchema);

export default UserCard;
