import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const db = process.env.DATABASE_URL || "";
console.log(db);

mongoose.set("strictQuery", true);

const connectDB = async () => {
  try {
    await mongoose.connect(db);
    console.log("MongoDB is Connected...");
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;
