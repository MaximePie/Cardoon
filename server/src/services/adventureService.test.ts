import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import Enemy from "../models/Enemy";
import Level from "../models/Level";
import { AdventureService } from "./adventureService";

describe("AdventureService", () => {
  let mongoServer: MongoMemoryServer;
  let adventureService: AdventureService;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(() => {
    adventureService = new AdventureService();
  });

  afterEach(async () => {
    await Level.deleteMany({});
    await Enemy.deleteMany({});
  });

  describe("getAvailableLevels", () => {
    it("should return empty array when no levels exist", async () => {
      const levels = await adventureService.getAvailableLevels();
      expect(levels).toEqual([]);
    });

    it("should return levels sorted by order", async () => {
      await Level.create([
        {
          name: "Level 2",
          order: 2,
          description: "Second level",
          minHeroLevel: 5,
          backgroundImage: "bg2.jpg",
        },
        {
          name: "Level 1",
          order: 1,
          description: "First level",
          minHeroLevel: 1,
          backgroundImage: "bg1.jpg",
        },
        {
          name: "Level 3",
          order: 3,
          description: "Third level",
          minHeroLevel: 10,
          backgroundImage: "bg3.jpg",
        },
      ]);

      const levels = await adventureService.getAvailableLevels();

      expect(levels).toHaveLength(3);
      expect(levels[0].order).toBe(1);
      expect(levels[1].order).toBe(2);
      expect(levels[2].order).toBe(3);
    });
  });

  describe("getLevelById", () => {
    it("should return null for invalid ObjectId", async () => {
      const level = await adventureService.getLevelById("invalid-id");
      expect(level).toBeNull();
    });

    it("should return null when level does not exist", async () => {
      const validId = new mongoose.Types.ObjectId().toString();
      const level = await adventureService.getLevelById(validId);
      expect(level).toBeNull();
    });

    it("should return level when it exists", async () => {
      const createdLevel = await Level.create({
        name: "Test Level",
        order: 1,
        description: "Test description",
        minHeroLevel: 1,
        backgroundImage: "test-bg.jpg",
      });

      const level = await adventureService.getLevelById(
        String(createdLevel._id)
      );

      expect(level).not.toBeNull();
      expect(level?.name).toBe("Test Level");
      expect(level?.order).toBe(1);
    });
  });

  describe("getEnemiesByLevel", () => {
    it("should return empty array for invalid ObjectId", async () => {
      const enemies = await adventureService.getEnemiesByLevel("invalid-id");
      expect(enemies).toEqual([]);
    });

    it("should return only active enemies for a level", async () => {
      const level = await Level.create({
        name: "Test Level",
        order: 1,
        description: "Test",
        minHeroLevel: 1,
        backgroundImage: "test-bg.jpg",
      });

      await Enemy.create([
        {
          id: "Goblin",
          name: "Active Enemy 1",
          level: level._id,
          isActive: true,
          maxHealth: 100,
          attackDamage: 10,
          defense: 5,
          experience: 50,
          spawnWeight: 10,
          bonus: {
            type: "hp",
            amount: 5,
          },
          sprites: {
            idle: "idle.png",
            attack: "attack.png",
            hurt: "hurt.png",
            defeated: "defeated.png",
          },
        },
        {
          id: "Skeleton",
          name: "Inactive Enemy",
          level: level._id,
          isActive: false,
          maxHealth: 100,
          attackDamage: 10,
          defense: 5,
          experience: 50,
          spawnWeight: 5,
          bonus: {
            type: "attack",
            amount: 3,
          },
          sprites: {
            idle: "idle.png",
            attack: "attack.png",
            hurt: "hurt.png",
            defeated: "defeated.png",
          },
        },
        {
          id: "NightBorne",
          name: "Active Enemy 2",
          level: level._id,
          isActive: true,
          maxHealth: 150,
          attackDamage: 15,
          defense: 8,
          experience: 75,
          spawnWeight: 15,
          bonus: {
            type: "defense",
            amount: 7,
          },
          sprites: {
            idle: "idle.png",
            attack: "attack.png",
            hurt: "hurt.png",
            defeated: "defeated.png",
          },
        },
      ]);

      const enemies = await adventureService.getEnemiesByLevel(
        String(level._id)
      );

      expect(enemies).toHaveLength(2);
      expect(enemies[0].spawnWeight).toBeGreaterThanOrEqual(
        enemies[1].spawnWeight
      );
      expect(enemies.every((e) => e.isActive)).toBe(true);
    });
  });
});
