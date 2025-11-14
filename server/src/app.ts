// app.js
import express from "express";
import cardsRoutes from "./api/cards.js";
import connectDB from "./config/db.js";
import { helmetConfig, securityConfig } from "./config/security.js";

import { Request, Response } from "express";

import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import itemsRoutes from "./api/items.js";
import mistralRoutes from "./api/mistral.js";
import userCardsRoutes from "./api/userCards.js";
import usersValidatedRoutes from "./api/users.js";
// import usersRoutes from "./api/users"; // Temporarily disabled due to validation errors

dotenv.config();
const app = express();

// CORS configuration - MUST be before other middlewares
// The cors middleware automatically handles OPTIONS preflight requests
app.use(
  cors({
    ...securityConfig.cors,
    preflightContinue: false,
    optionsSuccessStatus: 200,
  })
);

// Security middleware with Helmet
app.use(helmet(helmetConfig));

// Rate limiting
const limiter = rateLimit({
  windowMs: securityConfig.rateLimit.windowMs,
  max: securityConfig.rateLimit.max,
  message: securityConfig.rateLimit.message,
  standardHeaders: securityConfig.rateLimit.standardHeaders,
  legacyHeaders: securityConfig.rateLimit.legacyHeaders,
  skip: securityConfig.rateLimit.skip, // Ajouter la fonction skip pour bypasser en dev
});

console.log("Rate limiter config:", {
  max: securityConfig.rateLimit.max,
  skip: !!securityConfig.rateLimit.skip,
  isDev: process.env.NODE_ENV === "development",
});

// Only apply rate limiting in production
if (process.env.NODE_ENV === "production") {
  app.use("/api/", limiter);
  console.log("Rate limiting ENABLED");
} else {
  console.log("Rate limiting DISABLED (development mode)");
}

// Additional security headers for Permissions Policy
app.use((req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), accelerometer=(), gyroscope=(), magnetometer=()"
  );
  next();
});

// Body parser with size limits
app.use(bodyParser.json(securityConfig.bodyParser.json));
app.use(bodyParser.urlencoded(securityConfig.bodyParser.urlencoded));
app.use((req, res, next) => {
  next();
});
app.use("/api/cards", cardsRoutes);
app.use("/api/userCards", userCardsRoutes);
app.use("/api/users", usersValidatedRoutes);
app.use("/api/mistral", mistralRoutes);
app.use("/api/items", itemsRoutes);
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

const port = parseInt(process.env.PORT || "8082");

const server = app.listen(port, "0.0.0.0", () =>
  console.log(`Server running on port ${port}`)
);

server.on("error", (err) => {
  console.error("Server error:", err);
});
