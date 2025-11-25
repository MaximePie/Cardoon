"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const NotFoundError_js_1 = require("../errors/NotFoundError.js");
const auth_js_1 = __importDefault(require("../middleware/auth.js"));
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const adventureService_js_1 = __importDefault(require("../services/adventureService.js"));
const router = (0, express_1.Router)();
/**
 * GET /adventure
 * Get all adventure data (levels with their enemies)
 */
router.get("/", auth_js_1.default, (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
    console.log("Fetching all adventure data");
    const adventureData = await adventureService_js_1.default.getAllAdventureData();
    res.json(adventureData);
}));
/**
 * GET /adventure/levels
 * Get all available levels
 */
router.get("/levels", async (req, res, next) => {
    try {
        const levels = await adventureService_js_1.default.getAvailableLevels();
        res.json(levels);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /adventure/levels/:levelId
 * Get a specific level by ID
 */
router.get("/levels/:levelId", async (req, res, next) => {
    try {
        const { levelId } = req.params;
        const level = await adventureService_js_1.default.getLevelById(levelId);
        if (!level) {
            throw new NotFoundError_js_1.NotFoundError("Level not found");
        }
        res.json(level);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /adventure/levels/:levelId/enemies
 * Get all enemies for a specific level
 */
router.get("/levels/:levelId/enemies", async (req, res, next) => {
    try {
        const { levelId } = req.params;
        const enemies = await adventureService_js_1.default.getEnemiesByLevel(levelId);
        res.json(enemies);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /adventure/levels/:levelId/random-enemy
 * Get a random enemy from a level (weighted selection)
 */
router.get("/levels/:levelId/random-enemy", async (req, res, next) => {
    try {
        const { levelId } = req.params;
        const enemy = await adventureService_js_1.default.getRandomEnemy(levelId);
        if (!enemy) {
            throw new NotFoundError_js_1.NotFoundError("No enemies found for this level");
        }
        res.json(enemy);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
