import mongoose, { Document, Model, ObjectId } from "mongoose";
import UserCard from "./UserCard.js";
import bcrypt from "bcrypt";
import { Item } from "./Item.js";
import { DailyGoal } from "./DailyGoal.js";

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
  streak: number; // Streak of daily goals completed
  dailyGoalSize: number; // Number of good answers required to complete the daily goal
  currentDailyGoal: DailyGoal; // Current daily goal
  currentGoldMultiplier: number; // Depending on the items, updated when the user buys or upgrades an item

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
  getGoldMultiplier(): number;
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
  currentGoldMultiplier: {
    type: Number,
    default: 1,
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
});

UserSchema.methods = {
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
  const goldEffect = this.items.reduce(
    (acc: number, item: PopulatedUserItem) => {
      return (
        acc +
        (item.base.effect?.type === "gold"
          ? item.base.effect?.value * item.level || 0
          : 0)
      );
    },
    0
  );
  this.gold += gold + goldEffect;
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
