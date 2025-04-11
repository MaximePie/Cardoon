// routes/api/books.js
import express from "express";
const router = express.Router();
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import authMiddleware from "../middleware/auth.js";
router.get("/me", authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json(user);
});
router.post("/login", async (req, res) => {
    const { email, password, rememberMe } = req.body;
    const jwtSecret = process.env.JWT_SECRET;
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
        res.json({ token, user });
    }
    else {
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
// Route to verify token
router.get("/verify-token", authMiddleware, (req, res) => {
    res.json({ valid: true });
});
export default router;
