// app.js
import express from "express";
import connectDB from "./config/db.js";
import cardsRoutes from "./api/cards.js";

import { Request, Response } from "express";

import usersRoutes from "./api/users.js";
import userCardsRoutes from "./api/userCards.js";
import itemsRoutes from "./api/items.js";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { Mistral } from "@mistralai/mistralai";

const apiKey = process.env.MISTRAL_API_KEY || "";
const client = new Mistral({ apiKey: apiKey });

dotenv.config();
const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.1.137:5173",
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
app.use("/api/items", itemsRoutes);
app.post("/api/mistral", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    res.status(400).json({ error: "Prompt is required" });
    return;
  }

  try {
    const chatResponse = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
    });

    let response =
      chatResponse.choices?.[0]?.message?.content ?? "No content available";

    res.json({ content: response });
    return;
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
});

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: any
) => {
  console.error(err.stack);
  res
    .status(err.name === "ValidationError" ? 400 : 500)
    .json({ message: "An error occurred", error: err.message });
  return;
};
app.use(errorHandler);
connectDB();

const port = process.env.PORT || 8082;

app.listen(port, () => console.log(`Server running on port ${port}`));
