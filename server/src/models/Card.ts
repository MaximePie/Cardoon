import mongoose, { Document, Model } from "mongoose";

/**
 * Interface for the Card document
 */
export interface ICard extends Document {
  question: string;
  answer: string;
  imageLink?: string;
  category?: string;
}

/**
 * Interface for the Card model with static methods
 */
export interface ICardModel extends Model<ICard> {
  getCategories(): CountedCategory[];
}

/**
 * A card has the following properties:
 * A question (String)
 * An answer (String)
 */
const CardSchema = new mongoose.Schema<ICard>({
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
});

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

const Card: ICardModel = mongoose.model<ICard, ICardModel>("Card", CardSchema);

export default Card;
