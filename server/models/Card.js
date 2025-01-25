import mongoose from "mongoose";

/**
 * A card has the following properties:
 * A question (String)
 * An answer (String)
 * An interval in second (Number)
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
  interval: {
    type: Number,
    required: true,
  },
});

const Card = mongoose.model("Card", CardSchema);

export default Card;
