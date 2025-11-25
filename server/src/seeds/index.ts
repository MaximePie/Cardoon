import dotenv from "dotenv";
import mongoose from "mongoose";
import Enemy from "../models/Enemy.js";
import User from "../models/User.js";
import { seedAdventure } from "./adventureSeeds.js";

dotenv.config();

async function runSeeds() {
  try {
    console.log("🚀 Starting seed process...");

    // Connect to MongoDB using the same variable as the app
    const mongoUri =
      process.env.DATABASE_URL || "mongodb://localhost:27017/cardoon";
    console.log(`📡 Connecting to: ${mongoUri.substring(0, 30)}...`);
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");
    const users = await User.find({});
    console.log(`ℹ️ Found ${users.length} users in the database`);
    // Run adventure seeds
    await seedAdventure();
    const Ennemies = await Enemy.countDocuments();
    console.log(`✅ Created ${Ennemies} enemies`);

    console.log("🎉 All seeds completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed process failed:", error);
    process.exit(1);
  }
}

runSeeds();
