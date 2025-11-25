"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const Enemy_js_1 = __importDefault(require("../models/Enemy.js"));
const User_js_1 = __importDefault(require("../models/User.js"));
const adventureSeeds_js_1 = require("./adventureSeeds.js");
dotenv_1.default.config();
async function runSeeds() {
    try {
        console.log("🚀 Starting seed process...");
        // Connect to MongoDB using the same variable as the app
        const mongoUri = process.env.DATABASE_URL || "mongodb://localhost:27017/cardoon";
        console.log(`📡 Connecting to: ${mongoUri.substring(0, 30)}...`);
        await mongoose_1.default.connect(mongoUri);
        console.log("✅ Connected to MongoDB");
        const users = await User_js_1.default.find({});
        console.log(`ℹ️ Found ${users.length} users in the database`);
        // Run adventure seeds
        await (0, adventureSeeds_js_1.seedAdventure)();
        const Ennemies = await Enemy_js_1.default.countDocuments();
        console.log(`✅ Created ${Ennemies} enemies`);
        console.log("🎉 All seeds completed successfully!");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Seed process failed:", error);
        process.exit(1);
    }
}
runSeeds();
