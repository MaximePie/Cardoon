"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multipleIdsSchema = exports.paramIdSchema = exports.avatarUploadSchema = exports.imageUploadSchema = exports.errorResponseSchema = exports.successResponseSchema = exports.dailyGoalProgressSchema = exports.dailyGoalSchema = exports.onEnemyDefeatSchema = exports.addHeroBonusSchema = exports.itemUpgradeSchema = exports.itemPurchaseSchema = exports.itemSchema = exports.cardAnswerSchema = exports.cardUpdateSchema = exports.cardSchema = exports.userUpdateSchema = exports.userLoginSchema = exports.userRegistrationSchema = exports.usernameSchema = exports.passwordSchema = exports.emailSchema = exports.objectIdSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
/**
 * Base validation schemas for common types
 */
// MongoDB ObjectId validation
exports.objectIdSchema = zod_1.z
    .string()
    .refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
});
// Email validation with custom error messages
exports.emailSchema = zod_1.z
    .string()
    .email("Invalid email format")
    .min(5, "Email must be at least 5 characters")
    .max(100, "Email must not exceed 100 characters");
// Password validation with strength requirements
exports.passwordSchema = zod_1.z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");
// Username validation
exports.usernameSchema = zod_1.z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must not exceed 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, hyphens, and underscores");
/**
 * User-related validation schemas
 */
// User registration schema
exports.userRegistrationSchema = zod_1.z
    .object({
    username: exports.usernameSchema,
    email: exports.emailSchema,
    password: exports.passwordSchema,
    confirmPassword: zod_1.z.string(),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});
// User login schema
exports.userLoginSchema = zod_1.z
    .object({
    username: exports.usernameSchema.optional(),
    email: exports.emailSchema.optional(),
    password: zod_1.z.string().min(1, "Password is required"),
})
    .refine((data) => data.username || data.email, {
    message: "Either username or email is required",
    path: ["username"],
});
// User update schema (all fields optional for partial updates)
exports.userUpdateSchema = zod_1.z.object({
    username: exports.usernameSchema.optional(),
    email: exports.emailSchema.optional(),
    score: zod_1.z.number().int().min(0, "Score cannot be negative").optional(),
    gold: zod_1.z.number().int().min(0, "Gold cannot be negative").optional(),
    dailyGoal: zod_1.z
        .number()
        .int()
        .min(0, "Daily goal cannot be negative")
        .optional(),
    role: zod_1.z.enum(["admin", "user"]).optional(),
});
/**
 * Card-related validation schemas
 */
// Card creation/update schema
exports.cardSchema = zod_1.z.object({
    question: zod_1.z
        .string()
        .min(1, "Question is required")
        .max(1000, "Question must not exceed 1000 characters")
        .trim(),
    answer: zod_1.z
        .string()
        .min(1, "Answer is required")
        .max(1000, "Answer must not exceed 1000 characters")
        .trim(),
    category: zod_1.z
        .string()
        .min(1, "Category is required")
        .max(50, "Category must not exceed 50 characters")
        .trim()
        .optional(),
    imageLink: zod_1.z.string().url("Invalid URL format").optional().or(zod_1.z.literal("")),
    expectedAnswers: zod_1.z
        .array(zod_1.z.string().trim())
        .max(10, "Cannot have more than 10 expected answers")
        .optional(),
    parentId: exports.objectIdSchema.optional(),
});
// Card update schema (for partial updates)
exports.cardUpdateSchema = exports.cardSchema.partial();
// Card answer validation
exports.cardAnswerSchema = zod_1.z.object({
    cardId: exports.objectIdSchema,
    userAnswer: zod_1.z
        .string()
        .min(1, "Answer cannot be empty")
        .max(1000, "Answer must not exceed 1000 characters")
        .trim(),
    isCorrect: zod_1.z.boolean(),
    timeSpent: zod_1.z
        .number()
        .int()
        .min(0, "Time spent cannot be negative")
        .max(300000, "Time spent cannot exceed 5 minutes"), // 5 minutes in milliseconds
});
/**
 * Item-related validation schemas
 */
// Item creation schema
exports.itemSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Item name is required")
        .max(100, "Item name must not exceed 100 characters")
        .trim(),
    description: zod_1.z
        .string()
        .min(1, "Item description is required")
        .max(500, "Item description must not exceed 500 characters")
        .trim(),
    price: zod_1.z.number().int().min(1, "Item price must be at least 1"),
    imageUrl: zod_1.z.string().url("Invalid URL format").optional().or(zod_1.z.literal("")),
    effect: zod_1.z.object({
        type: zod_1.z.enum(["gold", "experience", "streak"], {
            message: "Effect type must be 'gold', 'experience', or 'streak'",
        }),
        value: zod_1.z.number().min(0.1, "Effect value must be at least 0.1"),
    }),
    upgradeCostMultiplier: zod_1.z
        .number()
        .min(1.1, "Upgrade cost multiplier must be at least 1.1")
        .optional()
        .default(2),
});
// Item purchase schema
exports.itemPurchaseSchema = zod_1.z.object({
    itemId: exports.objectIdSchema,
});
// Item upgrade schema
exports.itemUpgradeSchema = zod_1.z.object({
    itemId: exports.objectIdSchema,
});
exports.addHeroBonusSchema = zod_1.z.object({
    type: zod_1.z.enum(["attack", "hp", "regeneration"], {
        message: "Bonus type must be 'attack', 'hp', or 'regeneration'",
    }),
    amount: zod_1.z.number().min(0.1, "Bonus amount must be at least 1"),
});
exports.onEnemyDefeatSchema = zod_1.z.object({
    type: zod_1.z.enum(["attack", "hp", "regeneration"], {
        message: "Bonus type must be 'attack', 'hp', or 'regeneration'",
    }),
    amount: zod_1.z.number().min(0.1, "Bonus amount must be at least 1"),
    coinsDrop: zod_1.z.number().nonnegative("Coins drop must be non-negative"),
});
/**
 * Daily Goal validation schemas
 */
// Daily goal creation/update schema
exports.dailyGoalSchema = zod_1.z.object({
    target: zod_1.z
        .number()
        .int()
        .min(1, "Daily goal target must be at least 1")
        .max(100, "Daily goal target cannot exceed 100"),
});
// Daily goal progress update schema
exports.dailyGoalProgressSchema = zod_1.z.object({
    increment: zod_1.z
        .number()
        .int()
        .min(1, "Progress increment must be at least 1")
        .max(10, "Progress increment cannot exceed 10"),
});
/**
 * Response validation schemas (for API responses)
 */
// Success response schema
exports.successResponseSchema = zod_1.z.object({
    success: zod_1.z.literal(true),
    message: zod_1.z.string().optional(),
    data: zod_1.z.any().optional(),
});
// Error response schema
exports.errorResponseSchema = zod_1.z.object({
    success: zod_1.z.literal(false),
    message: zod_1.z.string(),
    errors: zod_1.z
        .array(zod_1.z.object({
        field: zod_1.z.string().optional(),
        message: zod_1.z.string(),
    }))
        .optional(),
});
/**
 * File upload validation schemas
 */
// General image upload schema (5MB limit)
exports.imageUploadSchema = zod_1.z.object({
    mimetype: zod_1.z
        .string()
        .refine((val) => val.startsWith("image/"), "File must be an image"),
    size: zod_1.z.number().max(5 * 1024 * 1024, "Image size cannot exceed 5MB"), // 5MB limit
});
// Avatar/profile image upload schema (10MB limit)
exports.avatarUploadSchema = zod_1.z.object({
    mimetype: zod_1.z
        .string()
        .refine((val) => val.startsWith("image/"), "File must be an image"),
    size: zod_1.z.number().max(10 * 1024 * 1024, "Image size cannot exceed 10MB"), // 10MB limit
    originalFilename: zod_1.z.string().optional(),
});
/**
 * Common validation helpers
 */
// Validate MongoDB ObjectId in params
exports.paramIdSchema = zod_1.z.object({
    id: exports.objectIdSchema,
});
// Validate multiple ObjectIds
exports.multipleIdsSchema = zod_1.z.object({
    ids: zod_1.z
        .array(exports.objectIdSchema)
        .min(1, "At least one ID is required")
        .max(50, "Cannot process more than 50 IDs at once"),
});
