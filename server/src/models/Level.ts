import mongoose, { Document, Schema } from "mongoose";

export interface ILevel extends Document {
  name: string;
  order: number;
  description: string;
  backgroundImage: string;
  minHeroLevel: number;
  isUnlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LevelSchema = new Schema<ILevel>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    backgroundImage: {
      type: String,
      required: true,
    },
    minHeroLevel: {
      type: Number,
      default: 1,
      min: 1,
    },
    isUnlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for sorting by order
LevelSchema.index({ order: 1 });

const Level = mongoose.model<ILevel>("Level", LevelSchema);

export default Level;
