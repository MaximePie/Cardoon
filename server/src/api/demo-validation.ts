import express from "express";
import { z } from "zod";
import {
  createErrorResponse,
  createSuccessResponse,
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/simpleValidation.js";

const router = express.Router();

// Simple validation schemas for demonstration
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

const searchSchema = z.object({
  q: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// Example routes demonstrating Zod validation

// Create user with body validation
router.post("/demo", validateBody(createUserSchema), (req: any, res: any) => {
  try {
    const userData = req.validatedBody;
    console.log("✅ Validated user data:", userData);

    // Simulate user creation
    const newUser = {
      id: "507f1f77bcf86cd799439011",
      ...userData,
      createdAt: new Date().toISOString(),
    };

    res.json(createSuccessResponse(newUser, "User created successfully"));
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json(createErrorResponse("Failed to create user"));
  }
});

// Update user with params and body validation
router.put(
  "/demo/:id",
  validateParams(userIdSchema),
  validateBody(updateUserSchema),
  (req: any, res: any) => {
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

      res.json(createSuccessResponse(updatedUser, "User updated successfully"));
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json(createErrorResponse("Failed to update user"));
    }
  }
);

// Search with query validation
router.get(
  "/demo/search",
  validateQuery(searchSchema),
  (req: any, res: any) => {
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

      res.json(createSuccessResponse(results, "Search completed"));
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json(createErrorResponse("Search failed"));
    }
  }
);

// Test route with validation error
router.post(
  "/demo/test-validation",
  validateBody(
    z.object({
      required: z.string().min(1, "This field is required"),
      email: z.string().email("Must be a valid email"),
      number: z.number().positive("Must be positive"),
    })
  ),
  (req: any, res: any) => {
    res.json(createSuccessResponse(req.validatedBody, "Validation passed!"));
  }
);

export default router;
