"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const adventureSeeds_js_1 = require("./adventureSeeds.js");
async function runSeeds() {
    try {
        console.log("🚀 Starting seed process...");
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/cardoon";
        await mongoose_1.default.connect(mongoUri);
        console.log("✅ Connected to MongoDB");
        // Run adventure seeds
        await (0, adventureSeeds_js_1.seedAdventure)();
        console.log("🎉 All seeds completed successfully!");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Seed process failed:", error);
        process.exit(1);
    }
}
runSeeds();
