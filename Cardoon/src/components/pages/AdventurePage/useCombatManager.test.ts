import FavoriteIcon from "@mui/icons-material/Favorite";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Enemy, Hero } from "./adventure.types";
import { useCombatManager } from "./useCombatManager";

describe("useCombatManager", () => {
  let mockHero: Hero;
  let mockEnemies: Enemy[];
  let mockSetHero: ReturnType<typeof vi.fn>;
  let mockOnEnemyDefeated: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();

    mockHero = {
      attackDamage: 2,
      regenerationRate: 1,
      maxHealth: 100,
      currentHealth: 100,
      level: 1,
      experience: 0,
      experienceToNextLevel: 100,
      defense: 0,
    };

    mockEnemies = [
      {
        id: "NightBorne",
        name: "Night Borne",
        maxHealth: 10,
        currentHealth: 10,
        attackDamage: 3,
        defense: 0,
        experience: 50,
        bonus: {
          type: "hp",
          amount: 5,
          icon: FavoriteIcon,
          iconColor: "primary" as const,
        },
      },
    ];

    mockSetHero = vi.fn((update) => {
      if (typeof update === "function") {
        mockHero = update(mockHero);
      } else {
        mockHero = update;
      }
    });

    mockOnEnemyDefeated = vi.fn();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe("Basic Combat", () => {
    it("should damage enemy on correct answer", () => {
      const { result, unmount } = renderHook(() =>
        useCombatManager({
          hero: mockHero,
          setHero: mockSetHero,
          availableEnemies: mockEnemies,
          onEnemyDefeated: mockOnEnemyDefeated,
        })
      );

      act(() => {
        result.current.performAttack(true);
      });

      expect(result.current.currentEnemy!.currentHealth).toBe(8);
      unmount();
    });

    it("should apply penalty damage on wrong answer", () => {
      const { result, unmount } = renderHook(() =>
        useCombatManager({
          hero: mockHero,
          setHero: mockSetHero,
          availableEnemies: mockEnemies,
          onEnemyDefeated: mockOnEnemyDefeated,
        })
      );

      act(() => {
        result.current.performAttack(false);
      });

      // Enemy should not be damaged on wrong answer
      expect(result.current.currentEnemy!.currentHealth).toBe(10);
      unmount();
    });

    it("should set hero to attacking state on correct answer", () => {
      const { result, unmount } = renderHook(() =>
        useCombatManager({
          hero: mockHero,
          setHero: mockSetHero,
          availableEnemies: mockEnemies,
          onEnemyDefeated: mockOnEnemyDefeated,
        })
      );

      act(() => {
        result.current.performAttack(true);
      });

      expect(result.current.heroState).toBe("attacking");
      unmount();
    });
  });

  describe("Enemy Defeat", () => {
    it("should call onEnemyDefeated when enemy dies", () => {
      const { result, unmount } = renderHook(() =>
        useCombatManager({
          hero: mockHero,
          setHero: mockSetHero,
          availableEnemies: mockEnemies,
          onEnemyDefeated: mockOnEnemyDefeated,
        })
      );

      act(() => {
        // Attack 6 times to kill enemy (10 HP, 2 damage per attack)
        for (let i = 0; i < 6; i++) {
          result.current.performAttack(true);
        }
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockOnEnemyDefeated).toHaveBeenCalled();
      unmount();
    });

    it("should set enemy state to defeated", () => {
      const { result, unmount } = renderHook(() =>
        useCombatManager({
          hero: mockHero,
          setHero: mockSetHero,
          availableEnemies: mockEnemies,
          onEnemyDefeated: mockOnEnemyDefeated,
        })
      );

      act(() => {
        for (let i = 0; i < 6; i++) {
          result.current.performAttack(true);
        }
      });

      expect(result.current.enemyState).toBe("defeated");
      unmount();
    });
  });

  describe("Hero Defeat", () => {
    it("should set hero health to 0 when receiving fatal damage", () => {
      let testHero = {
        ...mockHero,
        currentHealth: 3,
      };

      const setHeroSpy = vi.fn((update) => {
        if (typeof update === "function") {
          testHero = update(testHero);
        } else {
          testHero = update;
        }
      });

      const { result, unmount } = renderHook(() =>
        useCombatManager({
          hero: testHero,
          setHero: setHeroSpy,
          availableEnemies: mockEnemies,
          onEnemyDefeated: mockOnEnemyDefeated,
        })
      );

      act(() => {
        // Wrong answer triggers enemy attack (3 damage * 1.5 = 4.5 damage)
        result.current.performAttack(false);
      });

      // Verify setHero was called
      expect(setHeroSpy).toHaveBeenCalled();

      // Verify the hero health is now 0
      expect(testHero.currentHealth).toBe(0);

      unmount();
    });

    it("should not allow hero to attack when defeated", () => {
      let testHero = {
        ...mockHero,
        currentHealth: 3,
      };

      const setHeroSpy = vi.fn((update) => {
        if (typeof update === "function") {
          testHero = update(testHero);
        } else {
          testHero = update;
        }
      });

      const { result, unmount } = renderHook(() =>
        useCombatManager({
          hero: testHero,
          setHero: setHeroSpy,
          availableEnemies: mockEnemies,
          onEnemyDefeated: mockOnEnemyDefeated,
        })
      );

      // Defeat the hero
      act(() => {
        result.current.performAttack(false);
      });

      // Verify hero has 0 health
      expect(testHero.currentHealth).toBe(0);

      unmount();
    });
  });

  describe("startNewAdventure", () => {
    it("should reset hero health to max", () => {
      const damagedHero = {
        ...mockHero,
        currentHealth: 50,
      };

      const { result, unmount } = renderHook(() =>
        useCombatManager({
          hero: damagedHero,
          setHero: mockSetHero,
          availableEnemies: mockEnemies,
          onEnemyDefeated: mockOnEnemyDefeated,
        })
      );

      act(() => {
        result.current.startNewAdventure();
      });

      // setHero should be called with a function that updates currentHealth
      expect(mockSetHero).toHaveBeenCalled();
      const updateFunction = mockSetHero.mock.calls[0][0];
      const updatedHero = updateFunction(damagedHero);
      expect(updatedHero.currentHealth).toBe(mockHero.maxHealth);
      unmount();
    });

    it("should reset hero state to idle", () => {
      const { result, unmount } = renderHook(() =>
        useCombatManager({
          hero: mockHero,
          setHero: mockSetHero,
          availableEnemies: mockEnemies,
          onEnemyDefeated: mockOnEnemyDefeated,
        })
      );

      act(() => {
        result.current.performAttack(true);
      });

      act(() => {
        result.current.startNewAdventure();
      });

      expect(result.current.heroState).toBe("idle");
      unmount();
    });

    it("should reset enemy state to idle", () => {
      const { result, unmount } = renderHook(() =>
        useCombatManager({
          hero: mockHero,
          setHero: mockSetHero,
          availableEnemies: mockEnemies,
          onEnemyDefeated: mockOnEnemyDefeated,
        })
      );

      act(() => {
        result.current.startNewAdventure();
      });

      expect(result.current.enemyState).toBe("idle");
      unmount();
    });

    it("should set current enemy to first available enemy", () => {
      const { result, unmount } = renderHook(() =>
        useCombatManager({
          hero: mockHero,
          setHero: mockSetHero,
          availableEnemies: mockEnemies,
          onEnemyDefeated: mockOnEnemyDefeated,
        })
      );

      act(() => {
        result.current.startNewAdventure();
      });

      expect(result.current.currentEnemy?.id).toBe(mockEnemies[0].id);
      unmount();
    });
  });

  describe("Animations", () => {
    it("should show damage animation when attacked", () => {
      const { result, unmount } = renderHook(() =>
        useCombatManager({
          hero: mockHero,
          setHero: mockSetHero,
          availableEnemies: mockEnemies,
          onEnemyDefeated: mockOnEnemyDefeated,
        })
      );

      act(() => {
        result.current.performAttack(true);
      });

      expect(result.current.showDamageAnimation).toBe(true);
      unmount();
    });

    it("should increment animation key on each attack", () => {
      const { result, unmount } = renderHook(() =>
        useCombatManager({
          hero: mockHero,
          setHero: mockSetHero,
          availableEnemies: mockEnemies,
          onEnemyDefeated: mockOnEnemyDefeated,
        })
      );

      const initialKey = result.current.damageAnimationKey;

      act(() => {
        result.current.performAttack(true);
      });

      expect(result.current.damageAnimationKey).toBe(initialKey + 1);
      unmount();
    });
  });
});
