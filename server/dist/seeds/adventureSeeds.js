"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdventure = seedAdventure;
const Enemy_js_1 = __importDefault(require("../models/Enemy.js"));
const Level_js_1 = __importDefault(require("../models/Level.js"));
async function seedAdventure() {
    try {
        console.log("🌱 Seeding adventure data...");
        // Clear existing data
        await Level_js_1.default.deleteMany({});
        await Enemy_js_1.default.deleteMany({});
        // Create levels
        const forestLevel = await Level_js_1.default.create({
            name: "Dark Forest",
            order: 1,
            description: "A mysterious forest filled with dangerous creatures",
            backgroundImage: "/assets/backgrounds/forest.jpg",
            minHeroLevel: 1,
            isUnlocked: true,
        });
        const dungeonLevel = await Level_js_1.default.create({
            name: "Ancient Dungeon",
            order: 2,
            description: "Deep underground ruins guarded by powerful enemies",
            backgroundImage: "/assets/backgrounds/dungeon.jpg",
            minHeroLevel: 5,
            isUnlocked: false,
        });
        const castleLevel = await Level_js_1.default.create({
            name: "Cursed Castle",
            order: 3,
            description: "An abandoned castle haunted by fearsome warriors",
            backgroundImage: "/assets/backgrounds/castle.jpg",
            minHeroLevel: 10,
            isUnlocked: false,
        });
        const dragonLairLevel = await Level_js_1.default.create({
            name: "Dragon's Lair",
            order: 4,
            description: "The ultimate challenge - face the mighty dragon",
            backgroundImage: "/assets/backgrounds/dragon-lair.jpg",
            minHeroLevel: 15,
            isUnlocked: false,
        });
        console.log(`✅ Created ${await Level_js_1.default.countDocuments()} levels`);
        const skeleton = {
            id: "Skeleton",
            name: "Skeleton Warrior",
            level: forestLevel._id,
            maxHealth: 5,
            attackDamage: 1.5,
            defense: 0,
            experience: 50,
            sprites: {
                idle: "Skeleton-Idle.png",
                attack: "Skeleton-Attack.png",
                hurt: "Skeleton-Hurt.png",
                defeated: "Skeleton-Death.png",
            },
            spawnWeight: 60,
            isActive: true,
        };
        // Create enemies for Dark Forest (Level 1)
        const forestEnemies = [
            {
                ...skeleton,
                bonus: { type: "hp", amount: 1 },
            },
            {
                ...skeleton,
                bonus: { type: "attack", amount: 1 },
            },
            {
                ...skeleton,
                bonus: { type: "regeneration", amount: 1 },
            },
            {
                id: "Goblin",
                name: "Forest Goblin",
                level: forestLevel._id,
                maxHealth: 8,
                attackDamage: 4,
                defense: 0,
                experience: 40,
                bonus: { type: "attack", amount: 1 },
                sprites: {
                    idle: "Goblin-Idle.png",
                    attack: "Goblin-Attack.png",
                    hurt: "Goblin-Hurt.png",
                    defeated: "Goblin-Death.png",
                },
                spawnWeight: 40,
                isActive: true,
            },
            {
                id: "BigGoblin",
                name: "Big Forest Goblin",
                level: forestLevel._id,
                maxHealth: 20,
                attackDamage: 8,
                defense: 0,
                experience: 40,
                bonus: { type: "attack", amount: 2 },
                sprites: {
                    idle: "Goblin-Idle.png",
                    attack: "Goblin-Attack.png",
                    hurt: "Goblin-Hurt.png",
                    defeated: "Goblin-Death.png",
                },
                spawnWeight: 40,
                isActive: true,
            },
        ];
        // Create enemies for Ancient Dungeon (Level 2)
        const dungeonEnemies = [
            {
                id: "Skeleton",
                name: "Dungeon Skeleton",
                level: dungeonLevel._id,
                maxHealth: 150,
                attackDamage: 25,
                defense: 10,
                experience: 100,
                bonus: { type: "hp", amount: 15 },
                sprites: {
                    idle: "Skeleton-Idle.png",
                    attack: "Skeleton-Attack.png",
                    hurt: "Skeleton-Hurt.png",
                    defeated: "Skeleton-Death.png",
                },
                spawnWeight: 50,
                isActive: true,
            },
            {
                id: "NightBorne",
                name: "Shadow Knight",
                level: dungeonLevel._id,
                maxHealth: 200,
                attackDamage: 30,
                defense: 15,
                experience: 150,
                bonus: { type: "defense", amount: 5 },
                sprites: {
                    idle: "NightBorne-Idle.png",
                    attack: "NightBorne-Attack.png",
                    hurt: "NightBorne-Hurt.png",
                    defeated: "NightBorne-Death.png",
                },
                spawnWeight: 50,
                isActive: true,
            },
        ];
        // Create enemies for Cursed Castle (Level 3)
        const castleEnemies = [
            {
                id: "NightBorne",
                name: "Cursed Knight",
                level: castleLevel._id,
                maxHealth: 300,
                attackDamage: 40,
                defense: 20,
                experience: 250,
                bonus: { type: "attack", amount: 5 },
                sprites: {
                    idle: "NightBorne-Idle.png",
                    attack: "NightBorne-Attack.png",
                    hurt: "NightBorne-Hurt.png",
                    defeated: "NightBorne-Death.png",
                },
                spawnWeight: 60,
                isActive: true,
            },
            {
                id: "Goblin",
                name: "Goblin Chieftain",
                level: castleLevel._id,
                maxHealth: 250,
                attackDamage: 35,
                defense: 15,
                experience: 200,
                bonus: { type: "regeneration", amount: 2 },
                sprites: {
                    idle: "Goblin-Idle.png",
                    attack: "Goblin-Attack.png",
                    hurt: "Goblin-Hurt.png",
                    defeated: "Goblin-Death.png",
                },
                spawnWeight: 40,
                isActive: true,
            },
        ];
        // Create enemies for Dragon's Lair (Level 4)
        const dragonLairEnemies = [
            {
                id: "Dragon",
                name: "Ancient Dragon",
                level: dragonLairLevel._id,
                maxHealth: 500,
                attackDamage: 60,
                defense: 30,
                experience: 500,
                bonus: { type: "hp", amount: 50 },
                sprites: {
                    idle: "Dragon-Idle.png",
                    attack: "Dragon-Attack.png",
                    hurt: "Dragon-Hurt.png",
                    defeated: "Dragon-Death.png",
                },
                spawnWeight: 100,
                isActive: true,
            },
        ];
        // Insert all enemies
        await Enemy_js_1.default.insertMany([
            ...forestEnemies,
            ...dungeonEnemies,
            ...castleEnemies,
            ...dragonLairEnemies,
        ]);
        console.log(`✅ Created ${await Enemy_js_1.default.countDocuments()} enemies`);
        console.log("🎉 Adventure data seeded successfully!");
    }
    catch (error) {
        console.error("❌ Error seeding adventure data:", error);
        throw error;
    }
}
