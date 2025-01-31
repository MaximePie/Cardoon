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

UserSchema.statics.createUser = async function (username, password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return this.create({ username, password: hashedPassword });
};

UserSchema.statics.getUserByUsername = async function (username) {
  return this.findOne({ username });
};

const User = mongoose.model("User", UserSchema);

export default User;
