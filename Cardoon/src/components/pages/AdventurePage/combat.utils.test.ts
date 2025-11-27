import FavoriteIcon from "@mui/icons-material/Favorite";
import { describe, expect, it } from "vitest";
import { Enemy, EnemyType, Hero } from "./adventure.types";
import {
  applyRegeneration,
  calculateEnemyDamage,
  calculateHeroDamage,
  calculatePenaltyDamage,
  selectRandomEnemy,
} from "./combat.utils";

describe("combat.utils", () => {
  const mockHero: Hero = {
    attackDamage: 5,
    regenerationRate: 2,
    maxHealth: 100,
    currentHealth: 80,
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
    defense: 2,
  };

  const mockEnemy: Enemy = {
    id: "NightBorne" as EnemyType,
    name: "Test Enemy",
    maxHealth: 50,
    currentHealth: 50,
    attackDamage: 6,
    defense: 1,
    experience: 50,
    bonus: {
      type: "hp",
      amount: 5,
      icon: FavoriteIcon,
      iconColor: "primary" as const,
    },
  };

  describe("calculateHeroDamage", () => {
    it("should calculate damage correctly", () => {
      const damage = calculateHeroDamage(mockHero, mockEnemy);
      expect(damage).toBe(4); // 5 attack - 1 defense
    });

    it("should return 0 if defense exceeds attack", () => {
      const strongEnemy = { ...mockEnemy, defense: 10 };
      const damage = calculateHeroDamage(mockHero, strongEnemy);
      expect(damage).toBe(0);
    });

    it("should handle 0 defense", () => {
      const noDefenseEnemy = { ...mockEnemy, defense: 0 };
      const damage = calculateHeroDamage(mockHero, noDefenseEnemy);
      expect(damage).toBe(5);
    });
  });

  describe("calculateEnemyDamage", () => {
    it("should calculate damage correctly", () => {
      const damage = calculateEnemyDamage(mockEnemy, mockHero);
      expect(damage).toBe(4); // 6 attack - 2 defense
    });

    it("should return 0 if defense exceeds attack", () => {
      const strongHero = { ...mockHero, defense: 10 };
      const damage = calculateEnemyDamage(mockEnemy, strongHero);
      expect(damage).toBe(0);
    });

    it("should handle 0 defense", () => {
      const noDefenseHero = { ...mockHero, defense: 0 };
      const damage = calculateEnemyDamage(mockEnemy, noDefenseHero);
      expect(damage).toBe(6);
    });
  });

  describe("calculatePenaltyDamage", () => {
    it("should apply 1.5x multiplier", () => {
      const damage = calculatePenaltyDamage(mockEnemy, mockHero);
      const baseDamage = 4; // 6 attack - 2 defense
      expect(damage).toBe(baseDamage * 1.5);
    });

    it("should handle 0 damage correctly", () => {
      const strongHero = { ...mockHero, defense: 10 };
      const damage = calculatePenaltyDamage(mockEnemy, strongHero);
      expect(damage).toBe(0);
    });

    it("should return correct penalty for no defense", () => {
      const noDefenseHero = { ...mockHero, defense: 0 };
      const damage = calculatePenaltyDamage(mockEnemy, noDefenseHero);
      expect(damage).toBe(9); // 6 * 1.5
    });
  });

  describe("applyRegeneration", () => {
    it("should add regeneration to current health", () => {
      const newHealth = applyRegeneration(mockHero);
      expect(newHealth).toBe(82); // 80 + 2
    });

    it("should cap at max health", () => {
      const almostFullHero = { ...mockHero, currentHealth: 99 };
      const newHealth = applyRegeneration(almostFullHero);
      expect(newHealth).toBe(100);
    });

    it("should not exceed max health", () => {
      const fullHero = { ...mockHero, currentHealth: 100 };
      const newHealth = applyRegeneration(fullHero);
      expect(newHealth).toBe(100);
    });

    it("should handle 0 regeneration rate", () => {
      const noRegenHero = { ...mockHero, regenerationRate: 0 };
      const newHealth = applyRegeneration(noRegenHero);
      expect(newHealth).toBe(80);
    });

    it("should handle low health with high regeneration", () => {
      const lowHealthHero = {
        ...mockHero,
        currentHealth: 5,
        regenerationRate: 10,
      };
      const newHealth = applyRegeneration(lowHealthHero);
      expect(newHealth).toBe(15);
    });
  });

  describe("selectRandomEnemy", () => {
    const enemies: Enemy[] = [
      { ...mockEnemy, id: "NightBorne" as EnemyType, name: "Enemy 1" },
      { ...mockEnemy, id: "Skeleton" as EnemyType, name: "Enemy 2" },
      { ...mockEnemy, id: "Goblin" as EnemyType, name: "Enemy 3" },
    ];

    it("should return an enemy from the list", () => {
      const selected = selectRandomEnemy(enemies);
      expect(selected).not.toBeNull();
      expect(enemies).toContain(selected!);
    });

    it("should return null for empty list", () => {
      const selected = selectRandomEnemy([]);
      expect(selected).toBeNull();
    });

    it("should return the only enemy if list has one", () => {
      const singleEnemy = [enemies[0]];
      const selected = selectRandomEnemy(singleEnemy);
      expect(selected).toBe(enemies[0]);
    });

    it("should select different enemies over multiple calls", () => {
      const selections = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const selected = selectRandomEnemy(enemies);
        if (selected) {
          selections.add(selected.id);
        }
      }
      expect(selections.size).toBeGreaterThan(1);
    });
  });
});
