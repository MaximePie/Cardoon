import mongoose, { Document, Schema } from "mongoose";

/**
 * A user card has the following properties:
 * A user (ObjectId)
 * A card (ObjectId)
 * An interval in second (Number)
 * A last reviewed date (Date)
 * A next review date (Date)
 * An answer streak (Number)
 */

export interface IUserCard extends Document {
  user: mongoose.Types.ObjectId;
  card: mongoose.Types.ObjectId;
  interval: number;
  lastReviewed: Date;
  nextReview: Date;
  answerStreak: number;
  updateInterval(newInterval: number): Promise<void>;
}

const UserCardSchema = new Schema<IUserCard>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  card: {
    type: Schema.Types.ObjectId,
    ref: "Card",
    required: true,
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
    type: Number,
    default: 0,
  },
});

UserCardSchema.methods.updateInterval = async function (newInterval: number) {
  this.interval = newInterval;
  this.lastReviewed = new Date();
  this.nextReview = new Date(Date.now() + newInterval * 1000);
  await this.save();
};

const UserCard = mongoose.model<IUserCard>("UserCard", UserCardSchema);

export default UserCard;
