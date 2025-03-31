import mongoose from "mongoose";
import UserCard from "./UserCard.js";
import bcrypt from "bcrypt";

// The model user has the following properties:
// A username (String)
// A password (String)
// A user has many user cards

const UserSchema = new mongoose.Schema({
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
});

UserSchema.methods.attachCard = async function (cardId) {
  const now = new Date();
  const userCard = new UserCard({
    user: this._id,
    card: cardId,
    interval: 5,
    lastReviewed: now,
    nextReview: now + 5 * 1000,
  });
  await userCard.save();
  return userCard;
};

UserSchema.methods.getCards = async function () {
  return UserCard.find({ user: this._id }).populate("card");
};

// Get all the UserCards with nextReview less than now
UserSchema.methods.getOutdatedCards = async function () {
  const now = new Date();
  return UserCard.find({
    user: this._id,
    nextReview: { $lt: now },
  }).populate("card");
};

UserSchema.statics.createUser = async function (email, password, username) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return this.create({ username, password: hashedPassword, email });
};

UserSchema.statics.getUserByUsername = async function (username) {
  return this.findOne({ username });
};

UserSchema.statics.getUserByEmail = async function (email) {
  return this.findOne({ email });
};

UserSchema.methods.addScore = async function (interval) {
  const newScore = this.score + interval;
  this.score = newScore;
  await this.save();
};

UserSchema.methods.getCategories = async function () {
  const cards = await this.getCards();
  const categories = cards.map((card) => card.card.category);
  return [...new Set(categories)];
};

UserSchema.methods.updateAnswerRatio = async function (isCorrectAnswer) {
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

const User = mongoose.model("User", UserSchema);

export default User;
