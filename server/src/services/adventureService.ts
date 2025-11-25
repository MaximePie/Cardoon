import mongoose from "mongoose";
import Enemy, { IEnemy } from "../models/Enemy.js";
import Level, { ILevel } from "../models/Level.js";

export class AdventureService {
  /**
   * Get all adventure data: levels with their enemies
   */
  async getAllAdventureData() {
    const levels = await Level.find().sort({ order: 1 }).lean();
    const enemies = await Enemy.find({ isActive: true })
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
    }, {} as Record<string, any[]>);

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
  async getAvailableLevels(): Promise<ILevel[]> {
    return Level.find().sort({ order: 1 });
  }

  /**
   * Get a specific level by ID
   */
  async getLevelById(levelId: string): Promise<ILevel | null> {
    if (!mongoose.Types.ObjectId.isValid(levelId)) {
      return null;
    }
    return Level.findById(levelId);
  }

  /**
   * Get all active enemies for a specific level
   */
  async getEnemiesByLevel(levelId: string): Promise<IEnemy[]> {
    if (!mongoose.Types.ObjectId.isValid(levelId)) {
      return [];
    }
    return Enemy.find({ level: levelId, isActive: true }).sort({
      spawnWeight: -1,
    });
  }

  /**
   * Get a random enemy from a level using weighted selection
   * Higher spawnWeight = higher chance of being selected
   */
  async getRandomEnemy(levelId: string): Promise<IEnemy | null> {
    if (!mongoose.Types.ObjectId.isValid(levelId)) {
      return null;
    }

    const enemies = await Enemy.find({ level: levelId, isActive: true });

    if (enemies.length === 0) {
      return null;
    }

    // Calculate total weight
    const totalWeight = enemies.reduce(
      (sum, enemy) => sum + enemy.spawnWeight,
      0
    );

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
  async unlockLevel(levelId: string): Promise<ILevel | null> {
    if (!mongoose.Types.ObjectId.isValid(levelId)) {
      return null;
    }

    return Level.findByIdAndUpdate(
      levelId,
      { isUnlocked: true },
      { new: true }
    );
  }

  /**
   * Check if a level is accessible based on hero level
   */
  async canAccessLevel(levelId: string, heroLevel: number): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(levelId)) {
      return false;
    }

    const level = await Level.findById(levelId);
    if (!level) {
      return false;
    }

    return heroLevel >= level.minHeroLevel;
  }
}

export default new AdventureService();
