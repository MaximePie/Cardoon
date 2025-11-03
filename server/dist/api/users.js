"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_js_1 = __importDefault(require("../middleware/auth.js"));
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const fileUpload_js_1 = require("../middleware/fileUpload.js");
const simpleValidation_js_1 = require("../middleware/simpleValidation.js");
const userService_js_1 = require("../services/userService.js");
const schemas_js_1 = require("../validation/schemas.js");
const router = express_1.default.Router();
// Get current user with validation
// Get current user
router.get("/me", auth_js_1.default, (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
    const user = await userService_js_1.UserService.getUserProfile(req.user.id);
    res.json(user);
}));
// Login with Zod validation
router.post("/login", (0, simpleValidation_js_1.validateBody)(schemas_js_1.userLoginSchema), (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
    const { token, user } = await userService_js_1.UserService.authenticate(req.validatedBody);
    res
        .status(200)
        .setHeader("Authorization", `Bearer ${token}`)
        .json({ token, user });
}));
// Register
router.post("/register", (0, simpleValidation_js_1.validateBody)(schemas_js_1.userRegistrationSchema), (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
    const { email, password, username } = req.validatedBody;
    const user = await userService_js_1.UserService.createUser(email, password, username);
    res.status(201).json(user);
}));
// Update daily goal
router.put("/daily-goal", auth_js_1.default, (0, simpleValidation_js_1.validateBody)(schemas_js_1.dailyGoalSchema), (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
    const { target } = req.validatedBody;
    const user = await userService_js_1.UserService.updateDailyGoal(req.user.id, target);
    res
        .status(200)
        .json((0, simpleValidation_js_1.createSuccessResponse)(user, "Daily goal updated successfully"));
}));
// Update user image
router.put("/me/image", auth_js_1.default, (0, fileUpload_js_1.validateImageUpload)(schemas_js_1.avatarUploadSchema), (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
    const uploadedFile = req.uploadedFile;
    const result = await userService_js_1.UserService.updateUserImage(req.user.id, uploadedFile);
    res
        .status(200)
        .json((0, simpleValidation_js_1.createSuccessResponse)(result, "Image updated successfully"));
}));
// Buy item
router.post("/buyItem", auth_js_1.default, (0, simpleValidation_js_1.validateBody)(schemas_js_1.itemPurchaseSchema), (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
    const { itemId } = req.validatedBody;
    const user = await userService_js_1.UserService.purchaseItem(req.user.id, itemId);
    res
        .status(200)
        .json((0, simpleValidation_js_1.createSuccessResponse)(user, "Item purchased successfully"));
}));
// Remove item
router.post("/removeItem", auth_js_1.default, (0, simpleValidation_js_1.validateBody)(schemas_js_1.itemPurchaseSchema), (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
    const { itemId } = req.validatedBody;
    await userService_js_1.UserService.removeItem(req.user.id, itemId);
    res
        .status(200)
        .json((0, simpleValidation_js_1.createSuccessResponse)(null, "Item removed successfully"));
}));
// Upgrade item
router.post("/upgradeItem", auth_js_1.default, (0, simpleValidation_js_1.validateBody)(schemas_js_1.itemUpgradeSchema), (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
    const { itemId } = req.validatedBody;
    const upgradedItem = await userService_js_1.UserService.upgradeItem(req.user.id, itemId);
    res
        .status(200)
        .json((0, simpleValidation_js_1.createSuccessResponse)(upgradedItem, "Item upgraded successfully"));
}));
// Verify token
router.get("/verify-token", auth_js_1.default, (req, res) => {
    res.json((0, simpleValidation_js_1.createSuccessResponse)({ valid: true }, "Token is valid"));
});
exports.default = router;
