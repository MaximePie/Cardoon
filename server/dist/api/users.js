import express from "express";
import authMiddleware from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { validateImageUpload } from "../middleware/fileUpload.js";
import { createSuccessResponse, validateBody, } from "../middleware/simpleValidation.js";
import { UserService } from "../services/UserService.js";
import { avatarUploadSchema, dailyGoalSchema, itemPurchaseSchema, itemUpgradeSchema, userLoginSchema, userRegistrationSchema, } from "../validation/schemas.js";
const router = express.Router();
// Get current user with validation
// Get current user
router.get("/me", authMiddleware, asyncHandler(async (req, res) => {
    const user = await UserService.getUserProfile(req.user.id);
    res.json(user);
}));
// Login with Zod validation
router.post("/login", validateBody(userLoginSchema), asyncHandler(async (req, res) => {
    const { token, user } = await UserService.authenticate(req.validatedBody);
    res
        .status(200)
        .setHeader("Authorization", `Bearer ${token}`)
        .json({ token, user });
}));
// Register
router.post("/register", validateBody(userRegistrationSchema), asyncHandler(async (req, res) => {
    const { email, password, username } = req.validatedBody;
    const user = await UserService.createUser(email, password, username);
    res.status(201).json(user);
}));
// Update daily goal
router.put("/daily-goal", authMiddleware, validateBody(dailyGoalSchema), asyncHandler(async (req, res) => {
    const { target } = req.validatedBody;
    const user = await UserService.updateDailyGoal(req.user.id, target);
    res
        .status(200)
        .json(createSuccessResponse(user, "Daily goal updated successfully"));
}));
// Update user image
router.put("/me/image", authMiddleware, validateImageUpload(avatarUploadSchema), asyncHandler(async (req, res) => {
    const result = await UserService.updateUserImage(req.user.id, req.uploadedFile);
    res
        .status(200)
        .json(createSuccessResponse(result, "Image updated successfully"));
}));
// Buy item
router.post("/buyItem", authMiddleware, validateBody(itemPurchaseSchema), asyncHandler(async (req, res) => {
    const { itemId } = req.validatedBody;
    const user = await UserService.purchaseItem(req.user.id, itemId);
    res
        .status(200)
        .json(createSuccessResponse(user, "Item purchased successfully"));
}));
// Remove item
router.post("/removeItem", authMiddleware, validateBody(itemPurchaseSchema), asyncHandler(async (req, res) => {
    const { itemId } = req.validatedBody;
    await UserService.removeItem(req.user.id, itemId);
    res
        .status(200)
        .json(createSuccessResponse(null, "Item removed successfully"));
}));
// Upgrade item
router.post("/upgradeItem", authMiddleware, validateBody(itemUpgradeSchema), asyncHandler(async (req, res) => {
    const { itemId } = req.validatedBody;
    const upgradedItem = await UserService.upgradeItem(req.user.id, itemId);
    res
        .status(200)
        .json(createSuccessResponse(upgradedItem, "Item upgraded successfully"));
}));
// Verify token
router.get("/verify-token", authMiddleware, (req, res) => {
    res.json(createSuccessResponse({ valid: true }, "Token is valid"));
});
export default router;
