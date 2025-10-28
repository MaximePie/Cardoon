import bcrypt from "bcrypt";
import mongoose, { Document, Model, ObjectId } from "mongoose";
import type { DailyGoal as DailyGoalType } from "./DailyGoal.js";
import DailyGoal from "./DailyGoal.js";
import { Item } from "./Item.js";
import UserCard from "./UserCard.js";

interface PopulatedUserItem {
  base: Item;
  level: number;
  currentCost: number;
}
// Define an interface for the User document
export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  answersRatio: number;
  gold: number;
  items: Item[]; // Array of items owned by the user
  role: "admin" | "user"; // User role
  dailyGoal: number;
  streak: number; // Streak of daily goals completed
  currentDailyGoal: mongoose.Types.ObjectId | DailyGoalType; // Current daily goal (ObjectId until populated)
  currentGoldMultiplier: number; // Depending on the items, updated when the user buys or upgrades an item
  image?: string; // Profile image URL (optional)

  attachCard(cardId: ObjectId): Promise<typeof UserCard>;
  getCards(): Promise<any[]>;
  getOutdatedCards(): Promise<any[]>;
  addScore(interval: number): Promise<void>;
  getCategories(): Promise<string[]>;
  updateAnswerRatio(isCorrectAnswer: boolean): Promise<number>;
  spendGold(gold: number): Promise<void>;
  earnGold(gold: number): Promise<void>;
  buyItem(itemId: ObjectId): Promise<void>;
  removeItem(itemId: ObjectId): Promise<void>;
  upgradeItem(itemId: ObjectId): Promise<Item>;
  getGoldMultiplier(): Promise<number>;
  createDailyGoal(target: number, date: Date): Promise<DailyGoalType>;
  increaseDailyGoalProgress(increment: number): Promise<boolean>;
  updateDailyGoal(target: number): Promise<number>;
}

// Define an interface for the User model (static methods)
interface IUserModel extends Model<IUser> {
  createUser(email: string, password: string, username: string): Promise<IUser>;
  getUserByUsername(username: string): Promise<IUser | null>;
  getUserByEmail(email: string): Promise<IUser | null>;
  onItemRemoved(itemId: ObjectId): Promise<void>;
}

const UserSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  correctAnswers: {
    type: Number,
    default: 0,
  },
  wrongAnswers: {
    type: Number,
    default: 0,
  },
  answersRatio: {
    type: Number,
    default: 0,
  },
  gold: {
    // Possession of gold coins
    type: Number,
    default: 0,
  },
  dailyGoal: {
    type: Number,
    default: 0,
    min: [0, "Daily goal must be a positive number"],
  },
  currentGoldMultiplier: {
    type: Number,
    default: 1,
  },
  currentDailyGoal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DailyGoal",
  },
  streak: {
    type: Number,
    default: 0,
  },
  items: [
    {
      base: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true,
      },
      level: {
        type: Number,
        default: 1,
      },
      currentCost: {
        type: Number,
        default: 0,
      },
    },
  ],
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  image: {
    type: String,
    required: false, // Profile image is optional
  },
});

UserSchema.methods = {
  updateDailyGoal: async function (target: number) {
    if (
      target === undefined ||
      target === null ||
      target < 0 ||
      isNaN(target)
    ) {
      throw new Error("Target is required");
    }
    this.dailyGoal = target;
    await this.save();
    return this.dailyGoal;
  },
  getGoldMultiplier: async function () {
    await this.populate("items.base");
    return this.items.reduce((acc: number, item: PopulatedUserItem) => {
      if (item.base.effect.type === "gold") {
        return acc + item.base.effect.value * item.level || 0;
      }
      return acc;
    }, 1);
  },

  upgradeItem: async function (itemId: ObjectId) {
    const userItem = this.items.find(
      (item: { base: ObjectId }) => item.base.toString() === itemId.toString()
    );
    if (!userItem) {
      throw new Error("Item not found in user's items");
    }

    if (this.gold < userItem.currentCost) {
      throw new Error("Not enough gold to upgrade item");
    }
    const item = await mongoose.model<Item>("Item").findById(userItem.base);
    if (!item) {
      throw new Error("Item not found");
    }
    userItem.level += 1;
    this.gold -= userItem.currentCost;
    userItem.currentCost *= item.upgradeCostMultiplier || 2;
    this.currentGoldMultiplier = await this.getGoldMultiplier();
    await this.save();
    return userItem;
  },

  buyItem: async function (itemId: ObjectId) {
    try {
      const item = await mongoose.model<Item>("Item").findById(itemId);
      if (!item) {
        throw new Error("Item not found");
      }
      if (this.gold < item.price) {
        throw new Error("Not enough gold");
      }
      this.items.push({
        base: itemId,
        level: 1,
        currentCost: item.price * (item.upgradeCostMultiplier || 2),
      });
      this.gold -= item.price;
      this.currentGoldMultiplier = await this.getGoldMultiplier();
      await this.save();
    } catch (error) {
      console.error("Error buying item:", error);
      throw error;
    }
  },

  // If daily goal does not exist, create it
  createDailyGoal: async function (target: number, date: Date) {
    if (!target || !date) {
      console.error("Target and date are required");
      return null;
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Upsert (find or create) a daily goal for the given date and user
    const dailyGoal = await DailyGoal.findOneAndUpdate(
      {
        userId: this._id,
        date: { $gte: startOfDay, $lte: endOfDay },
      },
      {
        $setOnInsert: {
          userId: this._id,
          target,
          date,
          progress: 0,
          status: "PENDING",
          closedAt: null,
        },
      },
      { new: true, upsert: true }
    );

    this.currentDailyGoal = dailyGoal._id;
    await this.save();
    return dailyGoal;
  },

  // Return true if the daily goal is completed
  increaseDailyGoalProgress: async function (increment: number) {
    if (!this.currentDailyGoal) {
      throw new Error("No current daily goal found");
    }
    const dailyGoal = await DailyGoal.findById(this.currentDailyGoal);
    if (!dailyGoal) {
      throw new Error("Daily goal not found");
    }
    dailyGoal.progress += increment;
    if (
      dailyGoal.progress >= dailyGoal.target &&
      dailyGoal.status !== "COMPLETED"
    ) {
      dailyGoal.status = "COMPLETED";
      dailyGoal.closedAt = new Date();

      const currentGoldMultiplier = await this.getGoldMultiplier();
      this.streak += 1;
      const goldReward =
        10 * currentGoldMultiplier * this.streak * dailyGoal.target;
      this.gold += goldReward;

      await this.save();
    }
    await dailyGoal.save();
  },
};

UserSchema.methods.attachCard = async function (cardId: ObjectId) {
  const now = new Date();
  const userCard = new UserCard({
    user: this._id,
    card: cardId,
    interval: 5,
    lastReviewed: now,
    nextReview: now.getTime() + 5 * 1000,
  });
  await userCard.save();
  console.log("Attached card to user:", userCard);
  return userCard;
};

UserSchema.methods.getCards = async function () {
  return UserCard.find({ user: this._id }).populate("card");
};

UserSchema.methods.getOutdatedCards = async function () {
  const now = new Date();
  return UserCard.find({
    user: this._id,
    nextReview: { $lt: now },
  }).populate("card");
};

UserSchema.statics.createUser = async function (
  email: string,
  password: string,
  username: string
) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return this.create({ username, password: hashedPassword, email });
};

UserSchema.statics.getUserByUsername = async function (username: string) {
  return this.findOne({ username });
};

UserSchema.statics.getUserByEmail = async function (email: string) {
  return this.findOne({ email });
};

UserSchema.methods.addScore = async function (interval: number) {
  const newScore = this.score + interval;
  this.score = newScore;
  await this.save();
};
UserSchema.methods.updateAnswerRatio = async function (
  isCorrectAnswer: boolean
) {
  if (this.correctAnswers === undefined) {
    this.correctAnswers = 0;
  }
  if (this.wrongAnswers === undefined) {
    this.wrongAnswers = 0;
  }
  if (this.answersRatio === undefined) {
    this.answersRatio = 0.5;
  }

  if (isCorrectAnswer) {
    this.correctAnswers++;
  } else {
    this.wrongAnswers++;
  }
  this.answersRatio =
    this.correctAnswers / (this.correctAnswers + this.wrongAnswers);
  await this.save();

  return this.answersRatio;
};

UserSchema.methods.spendGold = async function (gold: number) {
  this.gold -= gold;
  await this.save();
};

UserSchema.methods.earnGold = async function (gold: number) {
  await this.populate("items.base");
  this.gold += await this.currentGoldMultiplier;
  await this.save();
};

UserSchema.methods.removeItem = async function (itemId: ObjectId) {
  const itemIndex = this.items.findIndex(
    (item: { base: ObjectId; level: number }) =>
      item.base.toString() === itemId.toString()
  );
  if (itemIndex > -1) {
    this.items.splice(itemIndex, 1);
    await this.save();
  } else {
    throw new Error("Item not found in user's items");
  }
};

UserSchema.statics.onItemRemoved = async function (itemId: ObjectId) {
  await this.updateMany({ items: itemId }, { $pull: { items: itemId } });
};

const User = mongoose.model<IUser, IUserModel>("User", UserSchema);

export default User;
