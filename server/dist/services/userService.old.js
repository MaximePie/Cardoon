"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_js_1 = require("../errors/index.js");
const User_js_1 = __importDefault(require("../models/User.js"));
const imagesManager_js_1 = require("../utils/imagesManager.js");
class UserService {
    static getJwtSecret() {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new index_js_1.AppError("JWT_SECRET is not configured", 500);
        }
        return jwtSecret;
    }
    static async authenticate(credentials) {
        const { email, username, password, rememberMe } = credentials;
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new index_js_1.AppError("JWT_SECRET is not configured", 500);
        }
        if ((!email && !username) || !password) {
            throw new index_js_1.ValidationError("Email/Username and password are required");
        }
        // Get user by email or username
        const user = email
            ? await User_js_1.default.getUserByEmail(email.trim().toLowerCase())
            : await User_js_1.default.getUserByUsername(username.trim());
        if (!user) {
            throw new index_js_1.ValidationError("Invalid credentials");
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            throw new index_js_1.ValidationError("Invalid credentials");
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user.id }, jwtSecret, {
            expiresIn: rememberMe
                ? this.JWT_CONFIG.DEFAULT_EXPIRY
                : this.JWT_CONFIG.SHORT_EXPIRY,
        });
        await user.populate(["items.base", "currentDailyGoal"]);
        return { token, user };
    }
    static async getUserProfile(userId) {
        const user = await User_js_1.default.findById(userId);
        if (!user) {
            throw new index_js_1.NotFoundError("User not found");
        }
        await user.createDailyGoal(user.dailyGoal, new Date());
        await user.populate(["items.base", "currentDailyGoal"]);
        return user;
    }
    static async createUser(email, password, username) {
        // Check if user already exists
        const existingUser = await User_js_1.default.getUserByEmail(email);
        if (existingUser) {
            throw new index_js_1.ValidationError("User already exists with this email");
        }
        // Check if username is taken
        const existingUsername = await User_js_1.default.getUserByUsername(username);
        if (existingUsername) {
            throw new index_js_1.ValidationError("Username is already taken");
        }
        const newUser = await User_js_1.default.createUser(email, password, username);
        // Remove password from response
        const userResponse = { ...newUser.toObject() };
        delete userResponse.password;
        return userResponse;
    }
    static async updateDailyGoal(userId, target) {
        const user = await User_js_1.default.findById(userId);
        if (!user) {
            throw new index_js_1.NotFoundError("User not found");
        }
        await user.updateDailyGoal(target);
        await user.populate("currentDailyGoal");
        return user;
    }
    static async updateUserImage(userId, imageFile) {
        const user = await User_js_1.default.findById(userId);
        if (!user) {
            throw new index_js_1.NotFoundError("User not found");
        }
        const imageUrl = await (0, imagesManager_js_1.uploadImage)({
            filepath: imageFile.filepath,
            originalFilename: imageFile.originalFilename || "avatar.jpg",
            contentType: imageFile.mimetype,
        });
        user.image = imageUrl;
        await user.save();
        return { imageUrl };
    }
    static async purchaseItem(userId, itemId) {
        const user = await User_js_1.default.findById(userId);
        if (!user) {
            throw new index_js_1.NotFoundError("User not found");
        }
        await user.buyItem(itemId);
        await user.populate("items.base");
        return user;
    }
    static async removeItem(userId, itemId) {
        const user = await User_js_1.default.findById(userId);
        if (!user) {
            throw new index_js_1.NotFoundError("User not found");
        }
        await user.removeItem(itemId);
        return null;
    }
    static async upgradeItem(userId, itemId) {
        const user = await User_js_1.default.findById(userId);
        if (!user) {
            throw new index_js_1.NotFoundError("User not found");
        }
        const upgradedItem = await user.upgradeItem(itemId);
        return upgradedItem;
    }
}
exports.UserService = UserService;
_a = UserService;
UserService.JWT_CONFIG = {
    SECRET: _a.getJwtSecret(),
    DEFAULT_EXPIRY: "1d",
    SHORT_EXPIRY: "15m",
};
