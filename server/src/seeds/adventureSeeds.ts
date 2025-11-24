import Enemy from "../models/Enemy.js";
import Level from "../models/Level.js";

export async function seedAdventure() {
  try {
    console.log("🌱 Seeding adventure data...");

    // Clear existing data
    await Level.deleteMany({});
    await Enemy.deleteMany({});

    // Create levels
    const forestLevel = await Level.create({
      name: "Dark Forest",
      order: 1,
      description: "A mysterious forest filled with dangerous creatures",
      backgroundImage: "/assets/backgrounds/forest.jpg",
      minHeroLevel: 1,
      isUnlocked: true,
    });

    const dungeonLevel = await Level.create({
      name: "Ancient Dungeon",
      order: 2,
      description: "Deep underground ruins guarded by powerful enemies",
      backgroundImage: "/assets/backgrounds/dungeon.jpg",
      minHeroLevel: 5,
      isUnlocked: false,
    });

    const castleLevel = await Level.create({
      name: "Cursed Castle",
      order: 3,
      description: "An abandoned castle haunted by fearsome warriors",
      backgroundImage: "/assets/backgrounds/castle.jpg",
      minHeroLevel: 10,
      isUnlocked: false,
    });

    const dragonLairLevel = await Level.create({
      name: "Dragon's Lair",
      order: 4,
      description: "The ultimate challenge - face the mighty dragon",
      backgroundImage: "/assets/backgrounds/dragon-lair.jpg",
      minHeroLevel: 15,
      isUnlocked: false,
    });

    console.log(`✅ Created ${await Level.countDocuments()} levels`);

    // Create enemies for Dark Forest (Level 1)
    const forestEnemies = [
      {
        id: "Skeleton",
        name: "Skeleton Warrior",
        level: forestLevel._id,
        maxHealth: 100,
        attackDamage: 15,
        defense: 5,
        experience: 50,
        bonus: { type: "hp", amount: 10 },
        sprites: {
          idle: "Skeleton-Idle.png",
          attack: "Skeleton-Attack.png",
          hurt: "Skeleton-Hurt.png",
          defeated: "Skeleton-Death.png",
        },
        spawnWeight: 60,
        isActive: true,
      },
      {
        id: "Goblin",
        name: "Forest Goblin",
        level: forestLevel._id,
        maxHealth: 80,
        attackDamage: 12,
        defense: 3,
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
    await Enemy.insertMany([
      ...forestEnemies,
      ...dungeonEnemies,
      ...castleEnemies,
      ...dragonLairEnemies,
    ]);

    console.log(`✅ Created ${await Enemy.countDocuments()} enemies`);
    console.log("🎉 Adventure data seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding adventure data:", error);
    throw error;
  }
}
