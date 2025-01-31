// routes/api/books.js
import express from "express";
const router = express.Router();
import User from "../../models/User.js";
import authMiddleware from "../../middleware/auth.js";

// @route   GET api/books
// @desc    Get all books
// @access  Public
router.get("/", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  const cards = await user.getOutdatedCards();
  res.json(cards);
});

export default router;
