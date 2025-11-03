"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db = process.env.DATABASE_URL || "";
mongoose_1.default.set("strictQuery", true);
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(db);
        console.log("MongoDB is Connected...");
    }
    catch (err) {
        console.error(`Error with database connection: ${err.message}`);
        process.exit(1);
    }
};
exports.default = connectDB;
