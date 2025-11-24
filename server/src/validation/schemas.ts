import mongoose from "mongoose";
import { z } from "zod";

/**
 * Base validation schemas for common types
 */

// MongoDB ObjectId validation
export const objectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
  });

// Email validation with custom error messages
export const emailSchema = z
  .string()
  .email("Invalid email format")
  .min(5, "Email must be at least 5 characters")
  .max(100, "Email must not exceed 100 characters");

// Password validation with strength requirements
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must not exceed 100 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

// Username validation
export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must not exceed 30 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, hyphens, and underscores"
  );

/**
 * User-related validation schemas
 */

// User registration schema
export const userRegistrationSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// User login schema
export const userLoginSchema = z
  .object({
    username: usernameSchema.optional(),
    email: emailSchema.optional(),
    password: z.string().min(1, "Password is required"),
  })
  .refine((data) => data.username || data.email, {
    message: "Either username or email is required",
    path: ["username"],
  });

// User update schema (all fields optional for partial updates)
export const userUpdateSchema = z.object({
  username: usernameSchema.optional(),
  email: emailSchema.optional(),
  score: z.number().int().min(0, "Score cannot be negative").optional(),
  gold: z.number().int().min(0, "Gold cannot be negative").optional(),
  dailyGoal: z
    .number()
    .int()
    .min(0, "Daily goal cannot be negative")
    .optional(),
  role: z.enum(["admin", "user"]).optional(),
});

/**
 * Card-related validation schemas
 */

// Card creation/update schema
export const cardSchema = z.object({
  question: z
    .string()
    .min(1, "Question is required")
    .max(1000, "Question must not exceed 1000 characters")
    .trim(),
  answer: z
    .string()
    .min(1, "Answer is required")
    .max(1000, "Answer must not exceed 1000 characters")
    .trim(),
  category: z
    .string()
    .min(1, "Category is required")
    .max(50, "Category must not exceed 50 characters")
    .trim()
    .optional(),
  imageLink: z.string().url("Invalid URL format").optional().or(z.literal("")),
  expectedAnswers: z
    .array(z.string().trim())
    .max(10, "Cannot have more than 10 expected answers")
    .optional(),
  parentId: objectIdSchema.optional(),
});

// Card update schema (for partial updates)
export const cardUpdateSchema = cardSchema.partial();

// Card answer validation
export const cardAnswerSchema = z.object({
  cardId: objectIdSchema,
  userAnswer: z
    .string()
    .min(1, "Answer cannot be empty")
    .max(1000, "Answer must not exceed 1000 characters")
    .trim(),
  isCorrect: z.boolean(),
  timeSpent: z
    .number()
    .int()
    .min(0, "Time spent cannot be negative")
    .max(300000, "Time spent cannot exceed 5 minutes"), // 5 minutes in milliseconds
});

/**
 * Item-related validation schemas
 */

// Item creation schema
export const itemSchema = z.object({
  name: z
    .string()
    .min(1, "Item name is required")
    .max(100, "Item name must not exceed 100 characters")
    .trim(),
  description: z
    .string()
    .min(1, "Item description is required")
    .max(500, "Item description must not exceed 500 characters")
    .trim(),
  price: z.number().int().min(1, "Item price must be at least 1"),
  imageUrl: z.string().url("Invalid URL format").optional().or(z.literal("")),
  effect: z.object({
    type: z.enum(["gold", "experience", "streak"], {
      message: "Effect type must be 'gold', 'experience', or 'streak'",
    }),
    value: z.number().min(0.1, "Effect value must be at least 0.1"),
  }),
  upgradeCostMultiplier: z
    .number()
    .min(1.1, "Upgrade cost multiplier must be at least 1.1")
    .optional()
    .default(2),
});

// Item purchase schema
export const itemPurchaseSchema = z.object({
  itemId: objectIdSchema,
});

// Item upgrade schema
export const itemUpgradeSchema = z.object({
  itemId: objectIdSchema,
});

export const addHeroBonusSchema = z.object({
  type: z.enum(["attack", "hp", "regeneration"], {
    message: "Bonus type must be 'attack', 'hp', or 'regeneration'",
  }),
  amount: z.number().min(1, "Bonus amount must be at least 1"),
});

/**
 * Daily Goal validation schemas
 */

// Daily goal creation/update schema
export const dailyGoalSchema = z.object({
  target: z
    .number()
    .int()
    .min(1, "Daily goal target must be at least 1")
    .max(100, "Daily goal target cannot exceed 100"),
});

// Daily goal progress update schema
export const dailyGoalProgressSchema = z.object({
  increment: z
    .number()
    .int()
    .min(1, "Progress increment must be at least 1")
    .max(10, "Progress increment cannot exceed 10"),
});

/**
 * Response validation schemas (for API responses)
 */

// Success response schema
export const successResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
  data: z.any().optional(),
});

// Error response schema
export const errorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z
    .array(
      z.object({
        field: z.string().optional(),
        message: z.string(),
      })
    )
    .optional(),
});

/**
 * File upload validation schemas
 */

// General image upload schema (5MB limit)
export const imageUploadSchema = z.object({
  mimetype: z
    .string()
    .refine((val) => val.startsWith("image/"), "File must be an image"),
  size: z.number().max(5 * 1024 * 1024, "Image size cannot exceed 5MB"), // 5MB limit
});

// Avatar/profile image upload schema (10MB limit)
export const avatarUploadSchema = z.object({
  mimetype: z
    .string()
    .refine((val) => val.startsWith("image/"), "File must be an image"),
  size: z.number().max(10 * 1024 * 1024, "Image size cannot exceed 10MB"), // 10MB limit
  originalFilename: z.string().optional(),
});

/**
 * Common validation helpers
 */

// Validate MongoDB ObjectId in params
export const paramIdSchema = z.object({
  id: objectIdSchema,
});

// Validate multiple ObjectIds
export const multipleIdsSchema = z.object({
  ids: z
    .array(objectIdSchema)
    .min(1, "At least one ID is required")
    .max(50, "Cannot process more than 50 IDs at once"),
});

/**
 * Type exports for TypeScript
 */

export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type CardData = z.infer<typeof cardSchema>;
export type CardUpdate = z.infer<typeof cardUpdateSchema>;
export type CardAnswer = z.infer<typeof cardAnswerSchema>;
export type ItemData = z.infer<typeof itemSchema>;
export type ItemPurchase = z.infer<typeof itemPurchaseSchema>;
export type ItemUpgrade = z.infer<typeof itemUpgradeSchema>;
export type DailyGoalData = z.infer<typeof dailyGoalSchema>;
export type DailyGoalProgress = z.infer<typeof dailyGoalProgressSchema>;
export type ParamId = z.infer<typeof paramIdSchema>;
export type MultipleIds = z.infer<typeof multipleIdsSchema>;
export type AvatarUpload = z.infer<typeof avatarUploadSchema>;
