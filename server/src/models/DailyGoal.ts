import mongoose, { Document, Schema } from "mongoose";

export interface DailyGoal {
  _id: string;
  userId: string;
  date: Date;
  target: number;
  progress: number;
  status: "PENDING" | "COMPLETED" | "FAIL";
  closedAt: Date | null;
}

const dailyGoalSchema = new Schema<DailyGoal>(
  {
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
  },
  { timestamps: true }
);

const DailyGoalModel = mongoose.model<DailyGoal>("DailyGoal", dailyGoalSchema);

export default DailyGoalModel;
