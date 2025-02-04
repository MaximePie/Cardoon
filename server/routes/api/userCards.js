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
  if (req.body.isCorrectAnswer) {
    await userCard.updateInterval(parseInt(userCard.interval * 1.618) + 1);
  } else {
    await userCard.updateInterval(parseInt(userCard.interval / 2));
  }

  res.json([]);
});

export default router;
