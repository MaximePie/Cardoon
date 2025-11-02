import mongoose, { Schema } from "mongoose";
const dailyGoalSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    target: {
        type: Number,
        required: true,
    },
    progress: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["PENDING", "COMPLETED", "FAIL"],
        default: "PENDING",
    },
    closedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true });
const DailyGoalModel = mongoose.model("DailyGoal", dailyGoalSchema);
export default DailyGoalModel;
