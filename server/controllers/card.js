import Card from "../models/Card.js";

/**
 * const CardSchema = new mongoose.Schema({
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
 */
/**
 * Remove all cards from the database and seed it with new cards
 *
 * Questions and answers are here :
 * "Mad en avancé ?" => "Out of mind"
 * "Not sure" => "On the fence"
 * "Very happy" => "Over the moon"
 * "Get Married" => "Tie the knot"
 * "Lazy" => "Couch-potato"
 */
export const clearDBAndSeed = async () => {
  await Card.deleteMany({});
  const cards = await Card.insertMany([
    {
      question: "Mad en avancé ?",
      answer: "Out of mind",
      interval: 1,
    },
    {
      question: "Not sure",
      answer: "On the fence",
      interval: 1,
    },
    {
      question: "Very happy",
      answer: "Over the moon",
      interval: 1,
    },
    {
      question: "Get Married",
      answer: "Tie the knot",
      interval: 1,
    },
    {
      question: "Lazy",
      answer: "Couch-potato",
      interval: 1,
    },
  ]);

  console.log("Database cleared and seeded with new cards");
  console.log(cards);
};
