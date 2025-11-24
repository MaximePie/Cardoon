import mongoose from "mongoose";
import { seedAdventure } from "./adventureSeeds.js";

async function runSeeds() {
  try {
    console.log("🚀 Starting seed process...");

    // Connect to MongoDB
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/cardoon";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Run adventure seeds
    await seedAdventure();

    console.log("🎉 All seeds completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed process failed:", error);
    process.exit(1);
  }
}

runSeeds();
