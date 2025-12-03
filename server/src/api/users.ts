import express, { Response } from "express";
import authMiddleware from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { validateImageUpload } from "../middleware/fileUpload.js";
import {
  createSuccessResponse,
  validateBody,
} from "../middleware/simpleValidation.js";
import { UserService } from "../services/userService.js";
import {
  AddHeroBonusRequest,
  AuthenticatedRequest,
  DailyGoalRequest,
  ItemRequest,
  OnEnemyDefeatRequest,
  UploadedFile,
  UserLoginRequest,
  UserRegistrationRequest,
} from "../types/requests.js";
import {
  addHeroBonusSchema,
  avatarUploadSchema,
  dailyGoalSchema,
  itemPurchaseSchema,
  itemUpgradeSchema,
  onEnemyDefeatSchema,
  userLoginSchema,
  userRegistrationSchema,
} from "../validation/schemas.js";
const router = express.Router();

// Get current user with validation
router.get(
  "/me",
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await UserService.getUserProfile(req.user.id);
    res.json(user);
  })
);

// Login with Zod validation
router.post(
  "/login",
  validateBody(userLoginSchema),
  asyncHandler(async (req: UserLoginRequest, res: Response) => {
    const { token, user } = await UserService.authenticate(req.validatedBody!);
    res
      .status(200)
      .setHeader("Authorization", `Bearer ${token}`)
      .json({ token, user });
  })
);

// Register
router.post(
  "/register",
  validateBody(userRegistrationSchema),
  asyncHandler(async (req: UserRegistrationRequest, res: Response) => {
    const { email, password, username } = req.validatedBody!;
    const user = await UserService.createUser(email, password, username);

    res.status(201).json(user);
  })
);

// Update daily goal
router.put(
  "/daily-goal",
  authMiddleware,
  validateBody(dailyGoalSchema),
  asyncHandler(async (req: DailyGoalRequest, res: Response) => {
    const { target } = req.validatedBody!;
    const user = await UserService.updateDailyGoal(req.user.id, target);
    res
      .status(200)
      .json(createSuccessResponse(user, "Daily goal updated successfully"));
  })
);

// Update user image
router.put(
  "/me/image",
  authMiddleware,
  validateImageUpload(avatarUploadSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const uploadedFile = req.uploadedFile as UploadedFile;
    const result = await UserService.updateUserImage(req.user.id, uploadedFile);
    res
      .status(200)
      .json(createSuccessResponse(result, "Image updated successfully"));
  })
);

// Buy item
router.post(
  "/buyItem",
  authMiddleware,
  validateBody(itemPurchaseSchema),
  asyncHandler(async (req: ItemRequest, res: Response) => {
    const { itemId } = req.validatedBody!;
    const user = await UserService.purchaseItem(req.user.id, itemId);
    res
      .status(200)
      .json(createSuccessResponse(user, "Item purchased successfully"));
  })
);

// Remove item
router.post(
  "/removeItem",
  authMiddleware,
  validateBody(itemPurchaseSchema),
  asyncHandler(async (req: ItemRequest, res: Response) => {
    const { itemId } = req.validatedBody!;
    await UserService.removeItem(req.user.id, itemId);
    res
      .status(200)
      .json(createSuccessResponse(null, "Item removed successfully"));
  })
);

// Upgrade item
router.post(
  "/upgradeItem",
  authMiddleware,
  validateBody(itemUpgradeSchema),
  asyncHandler(async (req: ItemRequest, res: Response) => {
    const { itemId } = req.validatedBody!;
    const upgradedItem = await UserService.upgradeItem(req.user.id, itemId);
    res
      .status(200)
      .json(createSuccessResponse(upgradedItem, "Item upgraded successfully"));
  })
);

// Add Bonus to Hero after defeating an enemy
router.post(
  "/addHeroBonus",
  authMiddleware,
  validateBody(addHeroBonusSchema),
  asyncHandler(async (req: AddHeroBonusRequest, res: Response) => {
    const { type, amount } = req.validatedBody!;
    const result = await UserService.addHeroBonus(type, amount, req.user.id);
    res
      .status(200)
      .json(createSuccessResponse(result, "Hero bonus added successfully"));
  })
);

// Handle enemy defeat (bonuses + coins)
router.post(
  "/onEnemyDefeat",
  authMiddleware,
  validateBody(onEnemyDefeatSchema),
  asyncHandler(async (req: OnEnemyDefeatRequest, res: Response) => {
    const { type, amount, coinsDrop } = req.validatedBody!;
    const result = await UserService.onEnemyDefeat(
      type,
      amount,
      coinsDrop,
      req.user.id
    );
    res
      .status(200)
      .json(createSuccessResponse(result, "Enemy defeated successfully"));
  })
);

// Verify token
router.get("/verify-token", authMiddleware, (req: any, res: Response) => {
  res.json(createSuccessResponse({ valid: true }, "Token is valid"));
});

export default router;
