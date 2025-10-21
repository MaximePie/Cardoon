// app.js
import express from "express";
import cardsRoutes from "./api/cards.js";
import connectDB from "./config/db.js";
import { helmetConfig, securityConfig } from "./config/security.js";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import itemsRoutes from "./api/items.js";
import mistralRoutes from "./api/mistral.js";
import userCardsRoutes from "./api/userCards.js";
import usersRoutes from "./api/users.js";
dotenv.config();
const app = express();
// Security middleware with Helmet
app.use(helmet(helmetConfig));
// Rate limiting
const limiter = rateLimit({
    windowMs: securityConfig.rateLimit.windowMs,
    max: securityConfig.rateLimit.max,
    message: securityConfig.rateLimit.message,
    standardHeaders: securityConfig.rateLimit.standardHeaders,
    legacyHeaders: securityConfig.rateLimit.legacyHeaders,
});
app.use("/api/", limiter);
// Additional security headers for Permissions Policy
app.use((req, res, next) => {
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), accelerometer=(), gyroscope=(), magnetometer=()");
    next();
});
// CORS configuration
app.use(cors(securityConfig.cors));
// Body parser with size limits
app.use(bodyParser.json(securityConfig.bodyParser.json));
app.use(bodyParser.urlencoded(securityConfig.bodyParser.urlencoded));
app.use((req, res, next) => {
    next();
});
app.use("/api/cards", cardsRoutes);
app.use("/api/userCards", userCardsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/mistral", mistralRoutes);
app.use("/api/items", itemsRoutes);
export const errorHandler = (err, req, res, next) => {
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
