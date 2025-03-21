// app.js
import express from "express";
import connectDB from "./config/db.js";
import cardsRoutes from "./routes/api/cards.js";
import usersRoutes from "./routes/api/users.js";
import userCardsRoutes from "./routes/api/userCards.js";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "https://cardoon-front.onrender.com",
];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  next();
});
app.use("/api/cards", cardsRoutes);
app.use("/api/userCards", userCardsRoutes);
app.use("/api/users", usersRoutes);
connectDB();

const port = process.env.PORT || 8082;

app.listen(port, () => console.log(`Server running on port ${port}`));
