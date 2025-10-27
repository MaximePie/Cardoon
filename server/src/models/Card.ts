import mongoose, { Document, Model, ObjectId } from "mongoose";
import User, { IUser } from "./User.js";
import UserCard from "./UserCard.js";

/**
 * Interface for the Card document
 */
export interface ICard extends Document {
  question: string;
  answer: string;
  ownedBy: ObjectId; // User ID who owns this card
  imageLink?: string;
  category?: string;
  parentId?: string;
  expectedAnswers?: string[]; // Elements of answer that are expected
  isInverted: boolean; // True if the card is inverted (question and answer are swapped)
  hasInvertedChild: boolean; // True if the card has an inverted child
  originalCardId?: mongoose.Types.ObjectId; // If the card is inverted, this field contains the id of the original card
  invert(): Promise<ICard>;
}

/**
 * Interface for the Card model with static methods
 */
export interface ICardModel extends Model<ICard> {
  getCategories(): CountedCategory[];
}

const CardSchema = new mongoose.Schema<ICard>(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    imageLink: {
      type: String,
    },
    category: {
      type: String,
    },
    parentId: {
      type: String,
    },
    expectedAnswers: {
      type: [String],
    },
    ownedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isInverted: {
      type: Boolean,
      default: false,
    },
    hasInvertedChild: {
      type: Boolean,
      default: false,
    },
    originalCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      default: null,
    },
  },
  { timestamps: true }
);

type CountedCategory = {
  category: string;
  count: number;
};
CardSchema.statics.getCategories = async function (): Promise<
  CountedCategory[]
> {
  const categories = await this.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $project: { _id: 0, category: "$_id", count: 1 } },
  ]);
  return categories;
};

CardSchema.methods.getChildren = async function (): Promise<ICard[]> {
  const children = await this.model("Card").find({ parentId: this._id });
  return children;
};

CardSchema.methods.invert = async function (): Promise<ICard> {
  let owner: IUser | null = await User.findById(this.ownedBy);
  if (!owner) {
    const userCard = await UserCard.findOne({ card: this._id });
    if (userCard) {
      const user = await User.findById(userCard.user);
      console.log("Found user by searching UserCards:", user);
      if (user) {
        owner = user;
      }
    } else {
      console.error("No UserCard found for card:", this._id);
    }
  }
  if (!owner) {
    throw new Error("No owner found for the original card");
  }
  const invertedCard = new Card({
    ...this.toObject(),
    question: this.answer,
    answer: this.question,
    isInverted: true,
    originalCardId: this._id,
    ownedBy: owner._id,
    _id: new mongoose.Types.ObjectId(), // Create a new ID for the inverted card
  });
  const card = await invertedCard.save();
  // this.hasInvertedChild = true;
  // await this.save();
  if (!card) {
    throw new Error("Error creating inverted card");
  }

  if (owner) {
    owner.attachCard(card._id as ObjectId);
  } else {
    console.warn(
      "No owner found for the original card:",
      this._id,
      "Trying to find user by searching UserCards having this card"
    );
    const userCard = await UserCard.findOne({ card: this._id });
    if (userCard) {
      const user = await User.findById(userCard.user);
      if (user) {
        user.attachCard(card._id as ObjectId);
      }
    } else {
      console.error("No UserCard found for card:", this._id);
    }
  }
  return card;
};

const Card: ICardModel = mongoose.model<ICard, ICardModel>("Card", CardSchema);

export default Card;
