import express from "express";
import { z } from "zod";
import { createSuccessResponse, createValidationError, validation, } from "../middleware/validation.js";
const router = express.Router();
// Simple user validation schema
const createUserSchema = z.object({
    name: z.string().min(1, "Name is required").max(50, "Name too long"),
    email: z.string().email("Invalid email format"),
    age: z
        .number()
        .int()
        .min(18, "Must be at least 18 years old")
        .max(120, "Invalid age"),
});
const updateUserSchema = z.object({
    name: z.string().min(1).max(50).optional(),
    email: z.string().email().optional(),
    age: z.number().int().min(18).max(120).optional(),
});
const userIdSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format"),
});
// Example routes demonstrating Zod validation
// Create user with validation
router.post("/example", validation.body(createUserSchema), (req, res) => {
    try {
        // req.validatedBody contains the validated and transformed data
        const userData = req.validatedBody;
        console.log("Validated user data:", userData);
        // Your business logic here
        // const newUser = await User.create(userData);
        res.json(createSuccessResponse(userData, "User created successfully"));
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json(createValidationError("Failed to create user"));
    }
});
// Update user with validation
router.put("/example/:id", validation.params(userIdSchema), validation.body(updateUserSchema), (req, res) => {
    try {
        const { id } = req.validatedParams;
        const updateData = req.validatedBody;
        console.log("Updating user:", id, "with data:", updateData);
        // Your business logic here
        // const updatedUser = await User.findByIdAndUpdate(id, updateData);
        res.json(createSuccessResponse({ id, ...updateData }, "User updated successfully"));
    }
    catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json(createValidationError("Failed to update user"));
    }
});
// Query parameters validation example
const searchSchema = z.object({
    q: z.string().min(1, "Search query required").optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default("10"),
});
router.get("/example/search", validation.query(searchSchema), (req, res) => {
    try {
        const { q, page, limit } = req.validatedQuery;
        console.log("Search params:", { q, page, limit });
        // Your search logic here
        const results = {
            query: q,
            page,
            limit,
            data: [],
            total: 0,
        };
        res.json(createSuccessResponse(results, "Search completed"));
    }
    catch (error) {
        console.error("Search error:", error);
        res.status(500).json(createValidationError("Search failed"));
    }
});
// Multi-validation example (params + body)
router.post("/example/:id/action", validation.multi({
    params: userIdSchema,
    body: z.object({
        action: z.enum(["activate", "deactivate", "reset"]),
        reason: z.string().min(1, "Reason is required"),
    }),
}), (req, res) => {
    try {
        const { id } = req.validatedParams;
        const { action, reason } = req.validatedBody;
        console.log(`Performing ${action} on user ${id} for reason: ${reason}`);
        res.json(createSuccessResponse({ id, action, reason }, `User ${action} successful`));
    }
    catch (error) {
        console.error("Action error:", error);
        res.status(500).json(createValidationError("Action failed"));
    }
});
export default router;
