import bcrypt from "bcrypt";
import express, { Response } from "express";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/auth.js";
import { validateImageUpload } from "../middleware/fileUpload.js";
import {
  createErrorResponse,
  createSuccessResponse,
  validateBody,
} from "../middleware/simpleValidation.js";
import User from "../models/User.js";
import { uploadImage } from "../utils/imagesManager.js";
import {
  avatarUploadSchema,
  dailyGoalSchema,
  itemPurchaseSchema,
  itemUpgradeSchema,
  userLoginSchema,
  userRegistrationSchema,
} from "../validation/schemas.js";
const router = express.Router();

// Get current user with validation
router.get("/me", authMiddleware, async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404).json(createErrorResponse("User not found"));
      return;
    }

    await user.createDailyGoal(user.dailyGoal, new Date());
    await user.populate("items.base");
    await user.populate("currentDailyGoal");

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json(createErrorResponse("Failed to retrieve user"));
  }
});

// Login with Zod validation
router.post(
  "/login",
  validateBody(userLoginSchema),
  async (req: any, res: Response) => {
    try {
      const { email, password, rememberMe } = req.validatedBody;
      const jwtSecret = process.env.JWT_SECRET as string;

      if (!jwtSecret) {
        res
          .status(500)
          .json(createErrorResponse("JWT_SECRET is not configured"));
        return;
      }

      // Get user by email or username
      const user = email
        ? await User.getUserByEmail(email.trim().toLowerCase())
        : await User.getUserByUsername(req.validatedBody.username!.trim());

      if (!user) {
        res.status(401).json(createErrorResponse("Invalid credentials"));
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        res.status(401).json(createErrorResponse("Invalid credentials"));
        return;
      }

      // Generate JWT token
      const token = jwt.sign({ id: user.id }, jwtSecret, {
        expiresIn: rememberMe ? "90d" : "1d",
      });

      await user.populate("items.base");
      await user.populate("currentDailyGoal");

      res
        .status(200)
        .setHeader("Authorization", `Bearer ${token}`)
        .json({ token, user });
    } catch (error) {
      console.error("Login error:", error);
      res
        .status(500)
        .json(createErrorResponse("An error occurred during login"));
    }
  }
);

// Register with Zod validation
router.post(
  "/register",
  validateBody(userRegistrationSchema),
  async (req: any, res: Response) => {
    try {
      const { email, password, username } = req.validatedBody;

      // Check if user already exists
      const existingUser = await User.getUserByEmail(email);
      if (existingUser) {
        res
          .status(400)
          .json(createErrorResponse("User already exists with this email"));
        return;
      }

      // Check if username is taken
      const existingUsername = await User.getUserByUsername(username);
      if (existingUsername) {
        res.status(400).json(createErrorResponse("Username is already taken"));
        return;
      }

      const newUser = await User.createUser(email, password, username);

      // Remove password from response
      const userResponse = { ...newUser.toObject() };
      delete userResponse.password;

      res.status(201).json(userResponse);
    } catch (error) {
      console.error("Registration error:", error);
      res
        .status(500)
        .json(createErrorResponse("An error occurred during registration"));
    }
  }
);

// Update daily goal with validation
router.put(
  "/daily-goal",
  authMiddleware,
  validateBody(dailyGoalSchema),
  async (req: any, res: Response) => {
    try {
      const { target } = req.validatedBody;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json(createErrorResponse("User not found"));
        return;
      }

      await user.updateDailyGoal(target);
      await user.populate("currentDailyGoal");

      res
        .status(200)
        .json(createSuccessResponse(user, "Daily goal updated successfully"));
    } catch (error) {
      console.error("Error updating daily goal:", error);
      res
        .status(500)
        .json(
          createErrorResponse("An error occurred while updating the daily goal")
        );
    }
  }
);

// Update user image with Zod validation
router.put(
  "/me/image",
  authMiddleware,
  validateImageUpload(avatarUploadSchema),
  async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json(createErrorResponse("User not found"));
        return;
      }

      // File has already been validated by the middleware
      const validatedFile = req.validatedFile;
      const uploadedFile = req.uploadedFile;
      const tempPath = uploadedFile.filepath;
      try {
        // Upload image to S3
        const imageUrl = await uploadImage({
          filepath: tempPath,
          originalFilename: validatedFile.originalFilename || "avatar.jpg",
          contentType: validatedFile.mimetype,
        });

        // Update user with new image URL
        user.image = imageUrl;
        await user.save();

        res
          .status(200)
          .json(
            createSuccessResponse({ imageUrl }, "Image updated successfully")
          );
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError);
        res.status(500).json(createErrorResponse("Error uploading image"));
      } finally {
        // Clean up temp file
        const fs = await import("fs");
        fs.unlink(tempPath, (err) => {
          if (err) {
            console.error("Error deleting temp file:", err);
          }
        });
      }
    } catch (error) {
      console.error("Error updating image:", error);
      res
        .status(500)
        .json(
          createErrorResponse("An error occurred while updating the image")
        );
    }
  }
);

// Buy item with validation
router.post(
  "/buyItem",
  authMiddleware,
  validateBody(itemPurchaseSchema),
  async (req: any, res: Response) => {
    try {
      const { itemId } = req.validatedBody;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json(createErrorResponse("User not found"));
        return;
      }

      await user.buyItem(itemId);

      // Return updated user data
      await user.populate("items.base");

      res
        .status(200)
        .json(createSuccessResponse(user, "Item purchased successfully"));
    } catch (error) {
      console.error("Error purchasing item:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while processing the purchase";
      res.status(500).json(createErrorResponse(errorMessage));
    }
  }
);

// Remove item with validation
router.post(
  "/removeItem",
  authMiddleware,
  validateBody(itemPurchaseSchema),
  async (req: any, res: Response) => {
    try {
      const { itemId } = req.validatedBody;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json(createErrorResponse("User not found"));
        return;
      }

      await user.removeItem(itemId);

      res
        .status(200)
        .json(createSuccessResponse(null, "Item removed successfully"));
    } catch (error) {
      console.error("Error removing item:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while removing the item";
      res.status(500).json(createErrorResponse(errorMessage));
    }
  }
);

// Upgrade item with validation
router.post(
  "/upgradeItem",
  authMiddleware,
  validateBody(itemUpgradeSchema),
  async (req: any, res: Response) => {
    try {
      const { itemId } = req.validatedBody;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json(createErrorResponse("User not found"));
        return;
      }

      const upgradedItem = await user.upgradeItem(itemId);

      res
        .status(200)
        .json(
          createSuccessResponse(upgradedItem, "Item upgraded successfully")
        );
    } catch (error) {
      console.error("Error upgrading item:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while upgrading the item";
      res.status(500).json(createErrorResponse(errorMessage));
    }
  }
);

// Verify token
router.get("/verify-token", authMiddleware, (req: any, res: Response) => {
  res.json(createSuccessResponse({ valid: true }, "Token is valid"));
});

export default router;
