import express from "express";
import DailyGoal from "../models/DailyGoal.js";

import authMiddleware from "../middleware/auth.js";

import { ObjectId } from "mongoose";
const router = express.Router();
router.post("/daily-goal", authMiddleware, async (req, res) => {
  const { target, date } = req.body as { target: number; date: Date };
  const userId = (req as any).user.id as ObjectId;

  if (!target || !date) {
    res.status(400).json({ error: "Target and date are required" });
    return;
  }

  try {
    // Check if a daily goal already exists for the given date and user
    const existingGoal = await DailyGoal.findOne({
      userId,
      date: { $eq: new Date(date) },
    });
    if (existingGoal) {
      res.status(400).json({ error: "Daily goal already exists" });
      return;
    }
    const dailyGoal = await DailyGoal.create({
      userId,
      target,
      date,
      progress: 0,
      status: "PENDING",
      closedAt: null,
    });

    res.status(201).json(dailyGoal);
  } catch (error) {
    console.error("Error creating daily goal:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
