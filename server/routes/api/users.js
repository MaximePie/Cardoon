// routes/api/books.js
import express from "express";
const router = express.Router();
import { clearDBAndSeed } from "../../controllers/database.js";
import User from "../../models/User.js";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../../config/config.js";
import bcrypt from "bcrypt";
import authMiddleware from "../../middleware/auth.js";

// @route   GET api/users/seed
// @desc    Seed the database
// @access  Public
router.get("/seed", clearDBAndSeed);

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Replace this with your actual user authentication logic
  const user = await User.getUserByUsername(username);

  if (!user) {
    return res
      .status(401)
      .json({ error: "Invalid credentials", username, password });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (isMatch) {
    // Generate a JWT token
    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: "1h" });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Route to verify token
router.get("/verify-token", authMiddleware, (req, res) => {
  res.json({ valid: true });
});

export default router;
