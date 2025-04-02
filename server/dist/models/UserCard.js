import mongoose, { Schema } from "mongoose";
const UserCardSchema = new Schema({
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
UserCardSchema.methods.updateInterval = async function (newInterval) {
    this.interval = newInterval;
    this.lastReviewed = new Date();
    this.nextReview = new Date(Date.now() + newInterval * 1000);
    await this.save();
};
const UserCard = mongoose.model("UserCard", UserCardSchema);
export default UserCard;
