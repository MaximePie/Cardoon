// routes/api/books.js
import express from "express";
const router = express.Router();
import { clearDBAndSeed } from "../../controllers/database.js";
import User from "../../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import authMiddleware from "../../middleware/auth.js";

// @route   GET api/users/seed
// @desc    Seed the database
// @access  Public
router.get("/seed", clearDBAndSeed);

router.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user);
});

router.post("/login", async (req, res) => {
  const { email, password, rememberMe } = req.body;
  const jwtSecret = process.env.JWT_SECRET;

  if (!email || !password) {
    return res
      .status(400)
      .json({ errorMessage: "Please provide email and password" });
  }

  // Replace this with your actual user authentication logic
  const user = await User.getUserByEmail(email.trim().toLowerCase());

  if (!user) {
    return res
      .status(401)
      .json({ error: "Invalid credentials", email, password });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (isMatch) {
    // Generate a JWT token
    const token = jwt.sign({ id: user.id }, jwtSecret, {
      expiresIn: rememberMe ? "90d" : "1d",
    });
    res.json({ token, user });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

router.post("/register", async (req, res) => {
  const { email, password, username } = req.body;

  const user = await User.getUserByEmail(email);

  if (user) {
    return res.status(400).json({ error: "User already exists" });
  }

  const newUser = await User.createUser(email, password, username);

  res.json(newUser);
});
// Route to verify token
router.get("/verify-token", authMiddleware, (req, res) => {
  res.json({ valid: true });
});

export default router;
