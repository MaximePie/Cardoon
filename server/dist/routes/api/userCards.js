// routes/api/books.js
import express from "express";
const router = express.Router();
import User from "../../models/User";
import Card from "../../models/Card";
import UserCard from "../../models/UserCard";
import authMiddleware from "../../middleware/auth";
// @route   GET api/books
// @desc    Get all books
// @access  Public
router.get("/", authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        res.status(404).json({ msg: "User not found" });
        return;
    }
    const cards = await user.getOutdatedCards();
    const categories = await Card.getCategories();
    res.json({
        cards,
        categories,
    });
});
router.put("/updateInterval/:id", async (req, res) => {
    const userCard = await UserCard.findById(req.params.id);
    if (!userCard) {
        res.status(404).json({ msg: "User card not found" });
        return;
    }
    const user = await User.findById(userCard.user);
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
    res.json({ user, userCard });
});
export default router;
