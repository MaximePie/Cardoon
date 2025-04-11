import mongoose, { Document, Model, ObjectId } from "mongoose";
import UserCard from "./UserCard.js";
import bcrypt from "bcrypt";

// Define an interface for the User document
interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  answersRatio: number;
  gold: number;

  attachCard(cardId: ObjectId): Promise<typeof UserCard>;
  getCards(): Promise<any[]>;
  getOutdatedCards(): Promise<any[]>;
  addScore(interval: number): Promise<void>;
  getCategories(): Promise<string[]>;
  updateAnswerRatio(isCorrectAnswer: boolean): Promise<number>;
  spendGold(gold: number): Promise<void>;
  earnGold(gold: number): Promise<void>;
}

// Define an interface for the User model (static methods)
interface IUserModel extends Model<IUser> {
  createUser(email: string, password: string, username: string): Promise<IUser>;
  getUserByUsername(username: string): Promise<IUser | null>;
  getUserByEmail(email: string): Promise<IUser | null>;
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
});

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
  this.gold += gold;
  console.log("Gold earned:", this.gold);
  await this.save();
};

const User = mongoose.model<IUser, IUserModel>("User", UserSchema);

export default User;
