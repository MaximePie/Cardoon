import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError, NotFoundError, ValidationError } from "../errors/index.js";
import User from "../models/User.js";
import { uploadImage } from "../utils/imagesManager.js";
export class UserService {
    static getJwtSecret() {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new AppError("JWT_SECRET is not configured", 500);
        }
        return jwtSecret;
    }
    static async authenticate(credentials) {
        const { email, username, password, rememberMe } = credentials;
        if ((!email && !username) || !password) {
            throw new ValidationError("Email/Username and password are required");
        }
        // Get user by email or username
        const user = email
            ? await User.getUserByEmail(email.trim().toLowerCase())
            : await User.getUserByUsername(username.trim());
        if (!user) {
            throw new ValidationError("Invalid credentials");
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new ValidationError("Invalid credentials");
        }
        // Generate JWT token
        const token = jwt.sign({ id: user.id }, this.getJwtSecret(), {
            expiresIn: rememberMe
                ? this.JWT_CONFIG.DEFAULT_EXPIRY
                : this.JWT_CONFIG.SHORT_EXPIRY,
        });
        await user.populate(["items.base", "currentDailyGoal"]);
        const safeUser = { ...user.toObject() };
        delete safeUser.password;
        return { token, user: safeUser };
    }
    static async getUserProfile(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundError("User not found");
        }
        await user.createDailyGoal(user.dailyGoal, new Date());
        await user.populate(["items.base", "currentDailyGoal"]);
        return user;
    }
    static async createUser(email, password, username) {
        // Check if user already exists
        const existingUser = await User.getUserByEmail(email);
        if (existingUser) {
            throw new ValidationError("User already exists with this email");
        }
        // Check if username is taken
        const existingUsername = await User.getUserByUsername(username);
        if (existingUsername) {
            throw new ValidationError("Username is already taken");
        }
        const newUser = await User.createUser(email, password, username);
        // Remove password from response
        const userResponse = { ...newUser.toObject() };
        delete userResponse.password;
        return userResponse;
    }
    static async updateDailyGoal(userId, target) {
        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundError("User not found");
        }
        await user.updateDailyGoal(target);
        await user.populate("currentDailyGoal");
        return user;
    }
    static async updateUserImage(userId, imageFile) {
        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundError("User not found");
        }
        const imageUrl = await uploadImage({
            filepath: imageFile.filepath,
            originalFilename: imageFile.originalFilename || "avatar.jpg",
            contentType: imageFile.mimetype,
        });
        user.image = imageUrl;
        await user.save();
        return { imageUrl };
    }
    static async purchaseItem(userId, itemId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundError("User not found");
        }
        await user.buyItem(itemId);
        await user.populate("items.base");
        return user;
    }
    static async removeItem(userId, itemId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundError("User not found");
        }
        await user.removeItem(itemId);
        return null;
    }
    static async upgradeItem(userId, itemId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundError("User not found");
        }
        const upgradedItem = await user.upgradeItem(itemId);
        return upgradedItem;
    }
}
UserService.JWT_CONFIG = {
    DEFAULT_EXPIRY: "1d",
    SHORT_EXPIRY: "15m",
};
