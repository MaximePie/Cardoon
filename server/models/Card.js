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
});

const Card = mongoose.model("Card", CardSchema);

export default Card;
