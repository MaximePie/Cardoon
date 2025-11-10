"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: "Authorization header missing" });
        return;
    }
    const token = authHeader?.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Token missing" });
        return;
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        res.status(500).json({ message: "JWT secret not configured" });
        return;
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.user = decodedToken;
        next();
        return;
    }
    catch (err) {
        res.status(401).json({ message: "Invalid token" });
        return;
    }
};
const router = (0, express_1.Router)();
exports.default = authMiddleware;
