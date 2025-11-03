"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const simpleValidation_js_1 = require("../middleware/simpleValidation.js");
const router = express_1.default.Router();
// Simple validation schemas for demonstration
const createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required").max(50, "Name too long"),
    email: zod_1.z.string().email("Invalid email format"),
    age: zod_1.z
        .number()
        .int()
        .min(18, "Must be at least 18 years old")
        .max(120, "Invalid age"),
});
const updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(50).optional(),
    email: zod_1.z.string().email().optional(),
    age: zod_1.z.number().int().min(18).max(120).optional(),
});
const userIdSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format"),
});
const searchSchema = zod_1.z.object({
    q: zod_1.z.string().optional(),
    page: zod_1.z.string().optional(),
    limit: zod_1.z.string().optional(),
});
// Example routes demonstrating Zod validation
// Create user with body validation
router.post("/demo", (0, simpleValidation_js_1.validateBody)(createUserSchema), (req, res) => {
    try {
        const userData = req.validatedBody;
        console.log("✅ Validated user data:", userData);
        // Simulate user creation
        const newUser = {
            id: "507f1f77bcf86cd799439011",
            ...userData,
            createdAt: new Date().toISOString(),
        };
        res.json((0, simpleValidation_js_1.createSuccessResponse)(newUser, "User created successfully"));
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json((0, simpleValidation_js_1.createErrorResponse)("Failed to create user"));
    }
});
// Update user with params and body validation
router.put("/demo/:id", (0, simpleValidation_js_1.validateParams)(userIdSchema), (0, simpleValidation_js_1.validateBody)(updateUserSchema), (req, res) => {
    try {
        const { id } = req.validatedParams;
        const updateData = req.validatedBody;
        console.log("✅ Updating user:", id, "with data:", updateData);
        // Simulate update
        const updatedUser = {
            id,
            ...updateData,
            updatedAt: new Date().toISOString(),
        };
        res.json((0, simpleValidation_js_1.createSuccessResponse)(updatedUser, "User updated successfully"));
    }
    catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json((0, simpleValidation_js_1.createErrorResponse)("Failed to update user"));
    }
});
// Search with query validation
router.get("/demo/search", (0, simpleValidation_js_1.validateQuery)(searchSchema), (req, res) => {
    try {
        const { q, page = "1", limit = "10" } = req.validatedQuery;
        // Convert and validate page/limit
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        console.log("✅ Search params:", { q, page: pageNum, limit: limitNum });
        // Simulate search results
        const results = {
            query: q || "",
            page: pageNum,
            limit: limitNum,
            total: 0,
            data: [],
        };
        res.json((0, simpleValidation_js_1.createSuccessResponse)(results, "Search completed"));
    }
    catch (error) {
        console.error("Search error:", error);
        res.status(500).json((0, simpleValidation_js_1.createErrorResponse)("Search failed"));
    }
});
// Test route with validation error
router.post("/demo/test-validation", (0, simpleValidation_js_1.validateBody)(zod_1.z.object({
    required: zod_1.z.string().min(1, "This field is required"),
    email: zod_1.z.string().email("Must be a valid email"),
    number: zod_1.z.number().positive("Must be positive"),
})), (req, res) => {
    res.json((0, simpleValidation_js_1.createSuccessResponse)(req.validatedBody, "Validation passed!"));
});
exports.default = router;
