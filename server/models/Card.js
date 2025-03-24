import mongoose from "mongoose";

/**
 * A card has the following properties:
 * A question (String)
 * An answer (String)
 */
const CardSchema = new mongoose.Schema({
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

CardSchema.statics.getCategories = async function () {
  const categories = await Card.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $project: { _id: 0, category: "$_id", count: 1 } },
  ]);
  return categories;
};

const Card = mongoose.model("Card", CardSchema);

export default Card;
