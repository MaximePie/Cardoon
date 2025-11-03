"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/api/books.js
const express_1 = __importDefault(require("express"));
const auth_js_1 = __importDefault(require("../middleware/auth.js"));
const Card_js_1 = __importDefault(require("../models/Card.js"));
const User_js_1 = __importDefault(require("../models/User.js"));
const UserCard_js_1 = __importDefault(require("../models/UserCard.js"));
const router = express_1.default.Router();
// Return every user card without filtering by due date
// @route   GET api/userCards/all
// @desc    Get all user cards
// @access  Private
router.get("/all", auth_js_1.default, async (req, res) => {
    const user = await User_js_1.default.findById(req.user.id);
    if (!user) {
        res.status(404).json({ msg: "User not found" });
        return;
    }
    const userCards = await UserCard_js_1.default.find({ user: user.id }).populate("card");
    res.json({ userCards });
});
// @route   GET api/books
// @desc    Get all books
// @access  Public
router.get("/", auth_js_1.default, async (req, res) => {
    const user = await User_js_1.default.findById(req.user.id);
    if (!user) {
        res.status(404).json({ msg: "User not found" });
        return;
    }
    const cards = await user.getOutdatedCards();
    const categories = await Card_js_1.default.getCategories();
    res.json({
        cards,
        categories,
    });
});
router.put("/updateInterval/:id", async (req, res) => {
    const userCard = await UserCard_js_1.default.findById(req.params.id);
    if (!userCard) {
        res.status(404).json({ msg: "User card not found" });
        return;
    }
    const user = await User_js_1.default.findById(userCard.user);
    if (!user) {
        res.status(404).json({ msg: "User not found" });
        return;
    }
    const newRatio = await user.updateAnswerRatio(req.body.isCorrectAnswer);
    const ratioMultiplier = 0.5 + newRatio;
    if (req.body.isCorrectAnswer) {
        if (!userCard.answerStreak) {
            userCard.answerStreak = 0;
        }
        userCard.answerStreak++;
        await user.addScore(userCard.interval);
        await user.earnGold(1);
        await user.increaseDailyGoalProgress(1);
        const newInterval = Math.floor(userCard.interval * ratioMultiplier * (1.618 + userCard.answerStreak)) + 1;
        await userCard.updateInterval(newInterval);
        await userCard.save();
    }
    else {
        userCard.answerStreak = 0;
        await userCard.save();
        const newInterval = Math.floor((userCard.interval / 2) * ratioMultiplier) + 1;
        await userCard.updateInterval(newInterval);
    }
    await user.populate("currentDailyGoal");
    res.json({ user, userCard });
});
// @route   DELETE api/userCards/:id
// @desc    Delete a user card
// @access  Private
router.delete("/:id", auth_js_1.default, async (req, res) => {
    try {
        const userCard = await UserCard_js_1.default.findById(req.params.id);
        if (!userCard) {
            res.status(404).json({ msg: "User card not found" });
            return;
        }
        // Vérifier que l'utilisateur authentifié est propriétaire de cette carte
        const authenticatedUserId = req.user.id;
        if (userCard.user.toString() !== authenticatedUserId) {
            res.status(403).json({ msg: "Not authorized to delete this card" });
            return;
        }
        // Supprimer la carte utilisateur
        await UserCard_js_1.default.findByIdAndDelete(req.params.id);
        res.json({ msg: "User card deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting user card:", error);
        res.status(500).json({ msg: "Server error" });
    }
});
exports.default = router;
