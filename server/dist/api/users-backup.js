// routes/api/users.js
import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/auth.js";
import { createSuccessResponse } from "../middleware/simpleValidation.js";
import User from "../models/User.js";
import { dailyGoalSchema, itemPurchaseSchema, userLoginSchema, userRegistrationSchema, } from "../validation/schemas.js";
const router = express.Router();
router.get("/me", authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    await user.createDailyGoal(user.dailyGoal, new Date());
    await user.populate("items.base"); // Assuming "items.base" is a reference field in the User schema
    await user.populate("currentDailyGoal");
    res.json(user);
});
router.post("/login", validation.body(userLoginSchema), async (req, res) => {
    try {
        const { email, password, rememberMe } = req.validatedBody;
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            res
                .status(500)
                .json(createValidationError("JWT_SECRET is not defined in the environment variables"));
            return;
        }
        // Get user by email or username
        const user = email
            ? await User.getUserByEmail(email.trim().toLowerCase())
            : await User.getUserByUsername(req.validatedBody.username.trim());
        if (!user) {
            res.status(401).json(createValidationError("Invalid credentials"));
            return;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json(createValidationError("Invalid credentials"));
            return;
        }
        // Generate JWT token
        const token = jwt.sign({ id: user.id }, jwtSecret, {
            expiresIn: rememberMe ? "90d" : "1d",
        });
        await user.populate("items.base");
        await user.populate("currentDailyGoal");
        res
            .status(200)
            .setHeader("Authorization", `Bearer ${token}`)
            .json(createSuccessResponse({ token, user }, "Login successful"));
    }
    catch (error) {
        console.error("Login error:", error);
        res
            .status(500)
            .json(createValidationError("An error occurred during login"));
    }
});
router.post("/register", validation.body(userRegistrationSchema), async (req, res) => {
    try {
        const { email, password, username } = req.validatedBody;
        // Check if user already exists
        const existingUser = await User.getUserByEmail(email);
        if (existingUser) {
            res
                .status(400)
                .json(createValidationError("User already exists with this email"));
            return;
        }
        // Check if username is taken
        const existingUsername = await User.getUserByUsername(username);
        if (existingUsername) {
            res
                .status(400)
                .json(createValidationError("Username is already taken"));
            return;
        }
        const newUser = await User.createUser(email, password, username);
        res
            .status(201)
            .json(createSuccessResponse(newUser, "User registered successfully"));
    }
    catch (error) {
        console.error("Registration error:", error);
        res
            .status(500)
            .json(createValidationError("An error occurred during registration"));
    }
});
// Update desired daily goal for user
router.put("/daily-goal", authMiddleware, validation.body(dailyGoalSchema), async (req, res) => {
    try {
        const { target } = req.validatedBody;
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json(createValidationError("User not found"));
            return;
        }
        await user.updateDailyGoal(target);
        await user.populate("currentDailyGoal");
        res
            .status(200)
            .json(createSuccessResponse(user, "Daily goal updated successfully"));
    }
    catch (error) {
        console.error("Error updating daily goal:", error);
        res
            .status(500)
            .json(createValidationError("An error occurred while updating the daily goal"));
    }
});
router.post("/buyItem", authMiddleware, validation.body(itemPurchaseSchema), async (req, res) => {
    try {
        const { itemId } = req.validatedBody;
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json(createValidationError("User not found"));
            return;
        }
        await user.buyItem(itemId);
        res
            .status(200)
            .json(createSuccessResponse(null, "Item purchased successfully"));
    }
    catch (error) {
        console.error("Error purchasing item:", error);
        const errorMessage = error instanceof Error
            ? error.message
            : "An error occurred while processing the purchase";
        res.status(500).json(createValidationError(errorMessage));
    }
});
router.post("/removeItem", authMiddleware, async (req, res) => {
    const { itemId } = req.body;
    const userId = req.user.id;
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
    }
    catch (error) {
        res
            .status(500)
            .json({ error: "An error occurred while processing the removal" });
        return;
    }
});
router.post("/upgradeItem", authMiddleware, async (req, res) => {
    const { itemId } = req.body;
    const userId = req.user.id;
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
    }
    catch (error) {
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
