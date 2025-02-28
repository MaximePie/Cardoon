// routes/api/books.js
import express from "express";
const router = express.Router();
import User from "../../models/User.js";
import UserCard from "../../models/UserCard.js";
import authMiddleware from "../../middleware/auth.js";

// @route   GET api/books
// @desc    Get all books
// @access  Public
router.get("/", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  const cards = await user.getOutdatedCards();
  res.json(cards);
});

router.put("/updateInterval/:id", async (req, res) => {
  const userCard = await UserCard.findById(req.params.id);
  const user = await User.findById(userCard.user);
  if (req.body.isCorrectAnswer) {
    user.addScore(userCard.interval);
    await userCard.updateInterval(
      parseInt(userCard.interval * 1.618) + Math.max(1, user.answerStreak)
    );
    userCard.answerStreak++;
    await userCard.save();
  } else {
    userCard.answerStreak = 0;
    await userCard.save();
    await userCard.updateInterval(parseInt(userCard.interval / 2));
  }

  res.json({ user });
});

export default router;
