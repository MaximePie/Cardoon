// routes/api/books.js
import express from "express";
const router = express.Router();
import User, { IUser } from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import authMiddleware from "../middleware/auth.js";

router.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findById((req as any).user.id);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  await user.createDailyGoal(user.dailyGoal, new Date());

  await user.populate("items.base"); // Assuming "items.base" is a reference field in the User schema
  await user.populate("currentDailyGoal");

  res.json(user);
});

router.post("/login", async (req, res) => {
  const { email, password, rememberMe } = req.body;
  const jwtSecret = process.env.JWT_SECRET as string;

  if (!jwtSecret) {
    res.status(500).json({
      error: "JWT_SECRET is not defined in the environment variables",
    });
    return;
  }

  if (!email || !password) {
    res.status(400).json({ errorMessage: "Please provide email and password" });
  }

  // Replace this with your actual user authentication logic
  const user = await User.getUserByEmail(email.trim().toLowerCase());

  if (!user) {
    res.status(401).json({ error: "Invalid credentials", email, password });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (isMatch) {
    // Generate a JWT token
    const token = jwt.sign({ id: user.id }, jwtSecret, {
      expiresIn: rememberMe ? "90d" : "1d",
    });
    await user.populate("items.base");
    await user.populate("currentDailyGoal");
    res.json({ token, user });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

router.post("/register", async (req, res) => {
  const { email, password, username } = req.body;

  const user = await User.getUserByEmail(email);

  if (user) {
    res.status(400).json({ error: "User already exists" });
  }

  const newUser = await User.createUser(email, password, username);

  res.json(newUser);
});

// Update desired daily goal for user
router.put("/daily-goal/:id", authMiddleware, async (req, res) => {
  const { target } = req.body;
  const userId = (req as any).user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    await user.updateDailyGoal(target);
    await user.populate("currentDailyGoal");
    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating daily goal: (users.daily-goal)", error);
    res.status(500).json({
      error: "An error occurred while updating the daily goal",
    });
  }
});

router.post("/buyItem", authMiddleware, async (req, res) => {
  const { itemId } = req.body;
  const userId = (req as any).user.id;

  // Assuming you have a method to handle the purchase logic
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    await user.buyItem(itemId);
    res.status(200).json({ message: "Item purchased successfully" });
    return;
  } catch (error) {
    console.error("Error purchasing item: (users.buyItem)", error);
    res.status(500).json({
      error: "An error occurred while processing the purchase",
    });
    return;
  }
});

router.post("/removeItem", authMiddleware, async (req, res) => {
  const { itemId } = req.body;
  const userId = (req as any).user.id;

  // Assuming you have a method to handle the removal logic
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    user.removeItem(itemId); // Assuming this method handles the removal logic
    res.status(200).json({ message: "Item removed successfully" });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while processing the removal" });
    return;
  }
});

router.post("/upgradeItem", authMiddleware, async (req, res) => {
  const { itemId } = req.body;
  const userId = (req as any).user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const upgradedItem = await user.upgradeItem(itemId);
    res
      .status(200)
      .json({ message: "Item upgraded successfully", upgradedItem });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while upgrading the item " + error });
    return;
  }
});

// Route to verify token
router.get("/verify-token", authMiddleware, (req, res) => {
  res.json({ valid: true });
});

export default router;
