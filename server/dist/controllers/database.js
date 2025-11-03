"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearDBAndSeed = void 0;
const Card_1 = __importDefault(require("../models/Card"));
const User_1 = __importDefault(require("../models/User"));
const UserCard_1 = __importDefault(require("../models/UserCard"));
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
const clearDBAndSeed = async (req, res) => {
    await Card_1.default.deleteMany({});
    const cards = await Card_1.default.insertMany([
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
    await User_1.default.deleteMany({});
    const user = await User_1.default.createUser("john", "doe", "Superbanane");
    await UserCard_1.default.deleteMany({});
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
exports.clearDBAndSeed = clearDBAndSeed;
