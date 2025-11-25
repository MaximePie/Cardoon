"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdventureService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Enemy_js_1 = __importDefault(require("../models/Enemy.js"));
const Level_js_1 = __importDefault(require("../models/Level.js"));
class AdventureService {
    /**
     * Get all adventure data: levels with their enemies
     */
    async getAllAdventureData() {
        const levels = await Level_js_1.default.find().sort({ order: 1 }).lean();
        const enemies = await Enemy_js_1.default.find({ isActive: true })
            .sort({ level: 1, spawnWeight: -1 })
            .lean();
        // Group enemies by levelId
        const enemiesByLevel = enemies.reduce((acc, enemy) => {
            const levelId = enemy.level.toString();
            if (!acc[levelId]) {
                acc[levelId] = [];
            }
            acc[levelId].push({
                id: enemy.id,
                name: enemy.name,
                maxHealth: enemy.maxHealth,
                attackDamage: enemy.attackDamage,
                defense: enemy.defense,
                experience: enemy.experience,
                bonus: enemy.bonus,
                sprites: enemy.sprites,
                spawnWeight: enemy.spawnWeight,
            });
            return acc;
        }, {});
        // Combine levels with their enemies
        const levelsWithEnemies = levels.map((level) => ({
            _id: level._id,
            name: level.name,
            order: level.order,
            description: level.description,
            backgroundImage: level.backgroundImage,
            minHeroLevel: level.minHeroLevel,
            enemies: enemiesByLevel[level._id.toString()] || [],
        }));
        return {
            levels: levelsWithEnemies,
        };
    }
    /**
     * Get all available levels sorted by order
     */
    async getAvailableLevels() {
        return Level_js_1.default.find().sort({ order: 1 });
    }
    /**
     * Get a specific level by ID
     */
    async getLevelById(levelId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(levelId)) {
            return null;
        }
        return Level_js_1.default.findById(levelId);
    }
    /**
     * Get all active enemies for a specific level
     */
    async getEnemiesByLevel(levelId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(levelId)) {
            return [];
        }
        return Enemy_js_1.default.find({ level: levelId, isActive: true }).sort({
            spawnWeight: -1,
        });
    }
    /**
     * Get a random enemy from a level using weighted selection
     * Higher spawnWeight = higher chance of being selected
     */
    async getRandomEnemy(levelId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(levelId)) {
            return null;
        }
        const enemies = await Enemy_js_1.default.find({ level: levelId, isActive: true });
        if (enemies.length === 0) {
            return null;
        }
        // Calculate total weight
        const totalWeight = enemies.reduce((sum, enemy) => sum + enemy.spawnWeight, 0);
        // Generate random number between 0 and totalWeight
        let random = Math.random() * totalWeight;
        // Select enemy based on weight
        for (const enemy of enemies) {
            random -= enemy.spawnWeight;
            if (random <= 0) {
                return enemy;
            }
        }
        // Fallback to last enemy (should rarely happen)
        return enemies[enemies.length - 1];
    }
    /**
     * Unlock a level for a user based on hero level
     */
    async unlockLevel(levelId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(levelId)) {
            return null;
        }
        return Level_js_1.default.findByIdAndUpdate(levelId, { isUnlocked: true }, { new: true });
    }
    /**
     * Check if a level is accessible based on hero level
     */
    async canAccessLevel(levelId, heroLevel) {
        if (!mongoose_1.default.Types.ObjectId.isValid(levelId)) {
            return false;
        }
        const level = await Level_js_1.default.findById(levelId);
        if (!level) {
            return false;
        }
        return heroLevel >= level.minHeroLevel;
    }
}
exports.AdventureService = AdventureService;
exports.default = new AdventureService();
