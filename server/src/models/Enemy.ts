import mongoose, { Document, Schema } from "mongoose";

export type EnemyType = "NightBorne" | "Skeleton" | "Goblin" | "Dragon";
export type BonusType = "hp" | "attack" | "regeneration" | "defense";

export interface IEnemy extends Document {
  id: EnemyType;
  name: string;
  level: mongoose.Types.ObjectId;
  maxHealth: number;
  attackDamage: number;
  defense: number;
  experience: number;
  bonus: {
    type: BonusType;
    amount: number;
  };
  sprites: {
    idle: string;
    attack: string;
    hurt: string;
    defeated: string;
  };
  spawnWeight: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EnemySchema = new Schema<IEnemy>(
  {
    id: {
      type: String,
      required: true,
      enum: ["NightBorne", "Skeleton", "Goblin", "Dragon"],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: Schema.Types.ObjectId,
      ref: "Level",
      required: true,
      index: true,
    },
    maxHealth: {
      type: Number,
      required: true,
      min: 1,
    },
    attackDamage: {
      type: Number,
      required: true,
      min: 0,
    },
    defense: {
      type: Number,
      required: true,
      min: 0,
    },
    experience: {
      type: Number,
      required: true,
      min: 0,
    },
    bonus: {
      type: {
        type: String,
        enum: ["hp", "attack", "regeneration", "defense"],
        required: true,
      },
      amount: {
        type: Number,
        required: true,
        min: 0.1,
      },
    },
    sprites: {
      idle: { type: String, required: true },
      attack: { type: String, required: true },
      hurt: { type: String, required: true },
      defeated: { type: String, required: true },
    },
    spawnWeight: {
      type: Number,
      default: 50,
      min: 1,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for optimized queries
EnemySchema.index({ level: 1, isActive: 1, spawnWeight: -1 });

const Enemy = mongoose.model<IEnemy>("Enemy", EnemySchema);

export default Enemy;
