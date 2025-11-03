"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const DailyGoal_js_1 = __importDefault(require("../models/DailyGoal.js"));
const auth_js_1 = __importDefault(require("../middleware/auth.js"));
const router = express_1.default.Router();
router.post("/daily-goal", auth_js_1.default, async (req, res) => {
    const { target, date } = req.body;
    const userId = req.user.id;
    if (!target || !date) {
        res.status(400).json({ error: "Target and date are required" });
        return;
    }
    try {
        // Check if a daily goal already exists for the given date and user
        const existingGoal = await DailyGoal_js_1.default.findOne({
            userId,
            date: { $eq: new Date(date) },
        });
        if (existingGoal) {
            res.status(400).json({ error: "Daily goal already exists" });
            return;
        }
        const dailyGoal = await DailyGoal_js_1.default.create({
            userId,
            target,
            date,
            progress: 0,
            status: "PENDING",
            closedAt: null,
        });
        res.status(201).json(dailyGoal);
    }
    catch (error) {
        console.error("Error creating daily goal:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
