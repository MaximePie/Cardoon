// routes/api/books.js
import express from "express";
const router = express.Router();
import User from "../../models/User.js";
import Card from "../../models/Card.js";
import UserCard from "../../models/UserCard.js";
import authMiddleware from "../../middleware/auth.js";

// @route   GET api/books
// @desc    Get all books
// @access  Public
router.get("/", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  const cards = await user.getOutdatedCards();
  const categories = await Card.getCategories();
  res.json({
    cards,
    categories,
  });
});

router.put("/updateInterval/:id", async (req, res) => {
  const userCard = await UserCard.findById(req.params.id);
  const user = await User.findById(userCard.user);
  if (req.body.isCorrectAnswer) {
    if (!userCard.answerStreak) {
      userCard.answerStreak = 0;
    }
    userCard.answerStreak++;

    await user.addScore(userCard.interval);
    await userCard.updateInterval(
      parseInt(userCard.interval * (1.618 + userCard.answerStreak)) + 1
    );
    await userCard.save();
  } else {
    userCard.answerStreak = 0;
    await userCard.save();
    await userCard.updateInterval(parseInt(userCard.interval / 2));
  }

  res.json({ user, userCard });
});

export default router;
