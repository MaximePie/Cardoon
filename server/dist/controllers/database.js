import Card from "../models/Card";
import User from "../models/User";
import UserCard from "../models/UserCard";
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
export const clearDBAndSeed = async (req, res) => {
    await Card.deleteMany({});
    const cards = await Card.insertMany([
        {
            question: "Mad en avancé ?",
            answer: "Out of mind",
        },
        {
            question: "Not sure",
            answer: "On the fence",
        },
        {
            question: "Very happy",
            answer: "Over the moon",
        },
        {
            question: "Get Married",
            answer: "Tie the knot",
        },
        {
            question: "Lazy",
            answer: "Couch-potato",
        },
    ]);
    await User.deleteMany({});
    const user = await User.createUser("john", "doe", "Superbanane");
    await UserCard.deleteMany({});
    cards.forEach(async (card) => {
        await user.attachCard(card._id);
    });
    const userCards = await user.getCards();
    res.json({
        message: "Database cleared and seeded",
        cards,
        user,
        userCards,
    });
};
