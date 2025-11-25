import { NextFunction, Request, Response, Router } from "express";
import { NotFoundError } from "../errors/NotFoundError.js";
import authMiddleware from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import adventureService from "../services/adventureService.js";

const router = Router();

/**
 * GET /adventure
 * Get all adventure data (levels with their enemies)
 */
router.get(
  "/",
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    console.log("Fetching all adventure data");
    const adventureData = await adventureService.getAllAdventureData();
    res.json(adventureData);
  })
);

/**
 * GET /adventure/levels
 * Get all available levels
 */
router.get(
  "/levels",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const levels = await adventureService.getAvailableLevels();
      res.json(levels);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /adventure/levels/:levelId
 * Get a specific level by ID
 */
router.get(
  "/levels/:levelId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { levelId } = req.params;
      const level = await adventureService.getLevelById(levelId);

      if (!level) {
        throw new NotFoundError("Level not found");
      }

      res.json(level);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /adventure/levels/:levelId/enemies
 * Get all enemies for a specific level
 */
router.get(
  "/levels/:levelId/enemies",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { levelId } = req.params;
      const enemies = await adventureService.getEnemiesByLevel(levelId);
      res.json(enemies);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /adventure/levels/:levelId/random-enemy
 * Get a random enemy from a level (weighted selection)
 */
router.get(
  "/levels/:levelId/random-enemy",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { levelId } = req.params;
      const enemy = await adventureService.getRandomEnemy(levelId);

      if (!enemy) {
        throw new NotFoundError("No enemies found for this level");
      }

      res.json(enemy);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
