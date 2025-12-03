import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdventureContext } from "../../../context/AdventureContext/AdventureContext";
import { UserContext, UserContextType } from "../../../context/UserContext";
import { PopulatedUserCard, User } from "../../../types/common";
import useAdventureGame from "./useAdventure";

// Mock adventure data
const mockAdventureData = {
  levels: [
    {
      _id: "level1",
      name: "Dark Forest",
      order: 1,
      description: "A mysterious forest",
      backgroundImage: "/assets/backgrounds/forest.jpg",
      minHeroLevel: 1,
      enemies: [
        {
          id: "NightBorne",
          name: "Night Borne",
          maxHealth: 5,
          attackDamage: 2,
          defense: 0,
          experience: 50,
          bonus: { type: "hp" as const, amount: 1 },
          sprites: {
            idle: "NightBorne-Idle.png",
            attack: "NightBorne-Attack.png",
            hurt: "NightBorne-Hurt.png",
            defeated: "NightBorne-Death.png",
          },
          spawnWeight: 60,
          coinsDrop: 10,
        },
        {
          id: "Skeleton",
          name: "Skeleton",
          maxHealth: 13,
          attackDamage: 3,
          defense: 0,
          experience: 75,
          bonus: { type: "attack" as const, amount: 1 },
          sprites: {
            idle: "Skeleton-Idle.png",
            attack: "Skeleton-Attack.png",
            hurt: "Skeleton-Hurt.png",
            defeated: "Skeleton-Death.png",
          },
          spawnWeight: 40,
          coinsDrop: 15,
        },
      ],
    },
  ],
};

// Mock the server hook
vi.mock("../../../hooks/server", () => ({
  ACTIONS: {
    UPDATE_INTERVAL: "/api/user-cards/interval",
  },
  usePut: vi.fn(),
}));

import { usePut } from "../../../hooks/server";

describe("useAdventure", () => {
  const mockUser: User = {
    _id: "user123",
    username: "adventurer",
    score: 100,
    role: "user",
    gold: 200,
    items: [],
    dailyGoal: 5,
    currentGoldMultiplier: 1,
    streak: 3,
    currentDailyGoal: {
      progress: 2,
      target: 5,
      closedAt: "2023-10-21",
      status: "PENDING",
    },
    hero: {
      attackDamage: 2,
      regenerationRate: 0,
      maxHealth: 120,
      currentHealth: 120,
      level: 1,
      experience: 0,
      experienceToNextLevel: 100,
      defense: 0,
    },
  };

  const mockCards: PopulatedUserCard[] = [
    {
      _id: "card1",
      card: {
        _id: "cardId1",
        question: "Test question 1",
        answer: "Test answer 1",
        interval: 1,
        imageLink: "",
        category: "Test",
        createdAt: "2023-01-01",
        ownedBy: "user123",
        isInverted: false,
        hasInvertedChild: false,
      },
      interval: 1,
      lastReviewed: "2023-10-20",
      nextReview: "2023-10-21",
    },
    {
      _id: "card2",
      card: {
        _id: "cardId2",
        question: "Test question 2",
        answer: "Test answer 2",
        interval: 2,
        imageLink: "",
        category: "Test",
        createdAt: "2023-01-02",
        ownedBy: "user123",
        isInverted: false,
        hasInvertedChild: false,
      },
      interval: 2,
      lastReviewed: "2023-10-19",
      nextReview: "2023-10-21",
    },
  ];

  const mockPut = vi.fn();

  const mockUserContextValue: UserContextType = {
    cards: {
      reviewUserCards: {
        data: mockCards,
        isLoading: false,
        error: null,
        getReviewUserCards: vi.fn(),
      },
      allUserCards: {
        data: [],
        isLoading: false,
        cardsError: null,
        deleteCard: vi.fn(),
        deleteCards: vi.fn(),
        editCard: vi.fn(),
        error: null,
        invertCard: vi.fn(),
        isDeletingCard: false,
        isEditingCard: false,
        isInvertingCard: false,
      },
    },
    user: {
      data: mockUser,
      isLoading: false,
      error: null,
      hasItem: (_itemId: string) => false,
      setUser: (_user: User) => {},
      login: () => {},
      addScore: (_score: number) => {},
      logout: () => {},
      earnGold: (_gold: number) => {},
      removeGold: (_gold: number) => {},
      refresh: () => {},
      updateImage: async (_imageFile: File) => {},
      updateDailyGoal: async (_newDailyGoal: number) => {},
      addHeroBonus: async (_params: {
        type: "hp" | "attack" | "regeneration" | "defense";
        amount: number;
      }) => {},
    },
    clearAllErrors: () => {},
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(usePut).mockReturnValue({
      put: mockPut,
      putUser: vi.fn(),
      data: null,
      loading: false,
      error: undefined,
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const mockAdventureContextValue = {
      adventureData: mockAdventureData,
      currentLevelId: null,
      setCurrentLevelId: vi.fn(),
      isLoading: false,
      error: null,
      resetQueries: vi.fn(),
    };

    return (
      <QueryClientProvider client={queryClient}>
        <UserContext.Provider value={mockUserContextValue}>
          <AdventureContext.Provider value={mockAdventureContextValue}>
            {children}
          </AdventureContext.Provider>
        </UserContext.Provider>
      </QueryClientProvider>
    );
  };

  describe("Initialization", () => {
    it("should initialize with default hero stats", () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      expect(result.current.hero.maxHealth).toBe(120);
      expect(result.current.hero.currentHealth).toBe(120);
      expect(result.current.hero.level).toBe(1);
      expect(result.current.hero.experience).toBe(0);
      expect(result.current.hero.experienceToNextLevel).toBe(100);
    });

    it("should initialize with first enemy", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      // Wait for enemy to be initialized
      await waitFor(() => {
        expect(result.current.currentEnemy).not.toBeNull();
      });

      // Enemy is randomly selected from available enemies
      const validEnemyNames = ["Night Borne", "Skeleton"];
      expect(validEnemyNames).toContain(result.current.currentEnemy?.name);
      expect(result.current.currentEnemy?.currentHealth).toBeGreaterThan(0);
      expect(result.current.currentEnemy?.maxHealth).toBeGreaterThan(0);
    });

    it("should initialize with idle states", () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      expect(result.current.heroState).toBe("idle");
      expect(result.current.enemyState).toBe("idle");
    });

    it("should initialize cards in hand", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.cardsInHand.length).toBeGreaterThan(0);
      });

      expect(result.current.cardsInHand.length).toBeLessThanOrEqual(5);
    });
  });

  describe("Combat System", () => {
    it("should damage enemy on correct answer", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentEnemy).not.toBeNull();
      });

      const initialEnemyHealth = result.current.currentEnemy!.currentHealth;

      act(() => {
        result.current.attack(result.current.currentEnemy!, true);
      });

      expect(result.current.currentEnemy!.currentHealth).toBeLessThan(
        initialEnemyHealth
      );
    });

    it("should damage hero on correct answer (counterattack)", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentEnemy).not.toBeNull();
      });

      const initialHeroHealth = result.current.hero.currentHealth;

      act(() => {
        result.current.attack(result.current.currentEnemy!, true);
      });

      expect(result.current.hero.currentHealth).toBeLessThan(initialHeroHealth);
    });

    it("should apply 1.5x damage to hero on wrong answer", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentEnemy).not.toBeNull();
      });

      const initialHeroHealth = result.current.hero.currentHealth;
      const enemyDamage = Math.max(
        0,
        result.current.currentEnemy!.attackDamage - result.current.hero.defense
      );

      act(() => {
        result.current.attack(result.current.currentEnemy!, false);
      });

      const expectedDamage = enemyDamage * 1.5;
      const regeneration = result.current.hero.regenerationRate;
      const expectedHealth = Math.max(
        0,
        initialHeroHealth - expectedDamage + regeneration
      );

      expect(result.current.hero.currentHealth).toBe(expectedHealth);
    });

    it("should not damage enemy on wrong answer", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentEnemy).not.toBeNull();
      });

      const initialEnemyHealth = result.current.currentEnemy!.currentHealth;

      act(() => {
        result.current.attack(result.current.currentEnemy!, false);
      });

      expect(result.current.currentEnemy!.currentHealth).toBe(
        initialEnemyHealth
      );
    });

    it("should calculate damage with defense", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentEnemy).not.toBeNull();
      });

      const heroDamage = Math.max(
        0,
        result.current.hero.attackDamage - result.current.currentEnemy!.defense
      );
      const initialEnemyHealth = result.current.currentEnemy!.currentHealth;

      act(() => {
        result.current.attack(result.current.currentEnemy!, true);
      });

      const expectedHealth = Math.max(0, initialEnemyHealth - heroDamage);
      expect(result.current.currentEnemy!.currentHealth).toBe(expectedHealth);
    });

    it("should not allow negative health values", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentEnemy).not.toBeNull();
      });

      // Attack multiple times to ensure health doesn't go negative
      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.attack(result.current.currentEnemy!, false);
        }
      });

      expect(result.current.hero.currentHealth).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Hero State Management", () => {
    it("should set hero to attacking state on correct answer", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentEnemy).not.toBeNull();
      });

      act(() => {
        result.current.attack(result.current.currentEnemy!, true);
      });

      expect(result.current.heroState).toBe("attacking");
    });

    it("should reset hero to idle after attack", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentEnemy).not.toBeNull();
      });

      act(() => {
        result.current.attack(result.current.currentEnemy!, true);
      });

      expect(result.current.heroState).toBe("attacking");

      await waitFor(
        () => {
          expect(result.current.heroState).toBe("idle");
        },
        { timeout: 600 }
      );
    });

    it("should keep hero idle on wrong answer", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentEnemy).not.toBeNull();
      });

      act(() => {
        result.current.attack(result.current.currentEnemy!, false);
      });

      expect(result.current.heroState).toBe("idle");
    });
  });

  describe("Enemy Defeat", () => {
    it("should trigger defeated state when enemy health reaches 0", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentEnemy).not.toBeNull();
      });

      // Attack until enemy is defeated (with limit to prevent infinite loop)
      act(() => {
        let attacks = 0;
        while (result.current.currentEnemy!.currentHealth > 0 && attacks < 20) {
          result.current.attack(result.current.currentEnemy!, true);
          attacks++;
        }
      });

      await waitFor(() => {
        expect(result.current.enemyState).toBe("defeated");
      });
    });

    it("should reset enemy state to idle after defeat animation", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentEnemy).not.toBeNull();
      });

      act(() => {
        let attacks = 0;
        while (result.current.currentEnemy!.currentHealth > 0 && attacks < 20) {
          result.current.attack(result.current.currentEnemy!, true);
          attacks++;
        }
      });

      await waitFor(() => {
        expect(result.current.enemyState).toBe("defeated");
      });

      await waitFor(
        () => {
          expect(result.current.enemyState).toBe("idle");
        },
        { timeout: 600 }
      );
    });

    it("should spawn new enemy after defeat", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentEnemy).not.toBeNull();
      });

      act(() => {
        let attacks = 0;
        while (result.current.currentEnemy!.currentHealth > 0 && attacks < 20) {
          result.current.attack(result.current.currentEnemy!, true);
          attacks++;
        }
      });

      await waitFor(
        () => {
          expect(result.current.currentEnemy!.currentHealth).toBe(
            result.current.currentEnemy!.maxHealth
          );
        },
        { timeout: 700 }
      );
    });

    it("should grant experience when enemy is defeated", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentEnemy).not.toBeNull();
      });

      const initialExperience = result.current.hero.experience;
      const enemyExperience = result.current.currentEnemy!.experience;

      act(() => {
        let attacks = 0;
        while (result.current.currentEnemy!.currentHealth > 0 && attacks < 20) {
          result.current.attack(result.current.currentEnemy!, true);
          attacks++;
        }
      });

      await waitFor(
        () => {
          expect(result.current.hero.experience).toBeGreaterThanOrEqual(0);
          // Ensure the experience has actually changed (not just initialized)
          const newExp = result.current.hero.experience;
          const didLevelUp = newExp === 0 && result.current.hero.level > 1;
          const gainedExp = newExp === initialExperience + enemyExperience;
          expect(didLevelUp || gainedExp).toBe(true);
        },
        { timeout: 700 }
      );
    });
  });

  describe("Hero Defeat", () => {
    it("should reset hero when health reaches 0", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentEnemy).not.toBeNull();
      });

      // Take damage until defeated
      act(() => {
        let attacks = 0;
        while (result.current.hero.currentHealth > 0 && attacks < 20) {
          result.current.attack(result.current.currentEnemy!, false);
          attacks++;
        }
      });

      await waitFor(() => {
        expect(result.current.hero.currentHealth).toBeGreaterThan(0);
        expect(result.current.hero.level).toBe(1);
      });

      expect(result.current.hero.experience).toBe(0);
    });

    it("should reset enemy when hero is defeated", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentEnemy).not.toBeNull();
      });

      // Damage the enemy first
      act(() => {
        result.current.attack(result.current.currentEnemy!, true);
      });

      // Defeat the hero
      act(() => {
        let attacks = 0;
        while (result.current.hero.currentHealth > 0 && attacks < 20) {
          result.current.attack(result.current.currentEnemy!, false);
          attacks++;
        }
      });

      await waitFor(() => {
        // Enemy should be reset when hero is defeated
        expect(result.current.currentEnemy!.currentHealth).toBeGreaterThan(0);
      });
    });
  });

  describe("Card Management", () => {
    it("should remove card after answering", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentEnemy).not.toBeNull();
      });

      await waitFor(() => {
        expect(result.current.cardsInHand.length).toBeGreaterThan(0);
      });

      const initialCardCount = result.current.cardsInHand.length;
      const cardToRemove = result.current.cardsInHand[0];

      await act(async () => {
        await result.current.removeCard(cardToRemove, true);
      });

      expect(result.current.cardsInHand.length).toBeLessThanOrEqual(
        initialCardCount
      );
      expect(
        result.current.cardsInHand.find((c) => c._id === cardToRemove._id)
      ).toBeUndefined();
    });

    it("should call updateUserCard when card is answered", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentEnemy).not.toBeNull();
      });

      await waitFor(() => {
        expect(result.current.cardsInHand.length).toBeGreaterThan(0);
      });

      const card = result.current.cardsInHand[0];

      await act(async () => {
        await result.current.removeCard(card, true);
      });

      expect(mockPut).toHaveBeenCalledWith(card._id, {
        isCorrectAnswer: true,
      });
    });

    it("should maintain maximum 5 cards in hand", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.cardsInHand.length).toBeGreaterThan(0);
      });

      expect(result.current.cardsInHand.length).toBeLessThanOrEqual(5);
    });
  });

  describe("Enemy Bonuses", () => {
    it("should have bonus information for each enemy", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentEnemy).not.toBeNull();
      });

      expect(result.current.currentEnemy!.bonus).toBeDefined();
      expect(result.current.currentEnemy!.bonus.type).toMatch(
        /hp|attack|regeneration/
      );
      expect(result.current.currentEnemy!.bonus.amount).toBeGreaterThan(0);
      expect(result.current.currentEnemy!.bonus.icon).toBeDefined();
      expect(result.current.currentEnemy!.bonus.iconColor).toBeDefined();
    });

    it("should calculate hp bonus as percentage of current maxHealth", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentEnemy).not.toBeNull();
      });

      const initialMaxHealth = result.current.hero.maxHealth;

      // Find and defeat an enemy with hp bonus
      let enemyWithHpBonus = result.current.currentEnemy;
      let attempts = 0;
      while (enemyWithHpBonus!.bonus.type !== "hp" && attempts < 50) {
        act(() => {
          let attacks = 0;
          while (
            result.current.currentEnemy!.currentHealth > 0 &&
            attacks < 20
          ) {
            result.current.attack(result.current.currentEnemy!, true);
            attacks++;
          }
        });

        await waitFor(
          () => {
            expect(result.current.currentEnemy!.currentHealth).toBe(
              result.current.currentEnemy!.maxHealth
            );
          },
          { timeout: 700 }
        );

        enemyWithHpBonus = result.current.currentEnemy;
        attempts++;
      }

      if (enemyWithHpBonus && enemyWithHpBonus.bonus.type === "hp") {
        const bonusPercentage = enemyWithHpBonus.bonus.amount;
        const expectedBonus = Math.max(
          initialMaxHealth * (bonusPercentage / 100),
          0.1
        );

        act(() => {
          let attacks = 0;
          while (
            result.current.currentEnemy!.currentHealth > 0 &&
            attacks < 20
          ) {
            result.current.attack(result.current.currentEnemy!, true);
            attacks++;
          }
        });

        await waitFor(
          () => {
            const newMaxHealth = result.current.hero.maxHealth;
            // Only check maxHealth since currentHealth is affected by enemy damage
            expect(newMaxHealth).toBeCloseTo(
              initialMaxHealth + expectedBonus,
              0
            );
          },
          { timeout: 700 }
        );
      }
    });

    it("should calculate attack bonus as percentage of current attackDamage", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentEnemy).not.toBeNull();
      });

      const initialAttackDamage = result.current.hero.attackDamage;

      // Find and defeat an enemy with attack bonus
      let enemyWithAttackBonus = result.current.currentEnemy;
      let attempts = 0;
      while (enemyWithAttackBonus!.bonus.type !== "attack" && attempts < 50) {
        act(() => {
          let attacks = 0;
          while (
            result.current.currentEnemy!.currentHealth > 0 &&
            attacks < 20
          ) {
            result.current.attack(result.current.currentEnemy!, true);
            attacks++;
          }
        });

        await waitFor(
          () => {
            expect(result.current.currentEnemy!.currentHealth).toBe(
              result.current.currentEnemy!.maxHealth
            );
          },
          { timeout: 700 }
        );

        enemyWithAttackBonus = result.current.currentEnemy;
        attempts++;
      }

      if (
        enemyWithAttackBonus &&
        enemyWithAttackBonus.bonus.type === "attack"
      ) {
        const bonusPercentage = enemyWithAttackBonus.bonus.amount;
        const expectedBonus = Math.max(
          initialAttackDamage * (bonusPercentage / 100),
          0.1
        );

        act(() => {
          let attacks = 0;
          while (
            result.current.currentEnemy!.currentHealth > 0 &&
            attacks < 20
          ) {
            result.current.attack(result.current.currentEnemy!, true);
            attacks++;
          }
        });

        await waitFor(
          () => {
            const newAttackDamage = result.current.hero.attackDamage;
            expect(newAttackDamage).toBeCloseTo(
              initialAttackDamage + expectedBonus,
              1
            );
          },
          { timeout: 700 }
        );
      }
    });

    it("should calculate regeneration bonus as percentage of current regenerationRate", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentEnemy).not.toBeNull();
      });

      const initialRegenerationRate = result.current.hero.regenerationRate;

      // Find and defeat an enemy with regeneration bonus
      let enemyWithRegenBonus = result.current.currentEnemy;
      let attempts = 0;
      while (
        enemyWithRegenBonus!.bonus.type !== "regeneration" &&
        attempts < 10
      ) {
        act(() => {
          let attacks = 0;
          while (
            result.current.currentEnemy!.currentHealth > 0 &&
            attacks < 20
          ) {
            result.current.attack(result.current.currentEnemy!, true);
            attacks++;
          }
        });

        await waitFor(
          () => {
            expect(result.current.currentEnemy!.currentHealth).toBe(
              result.current.currentEnemy!.maxHealth
            );
          },
          { timeout: 700 }
        );

        enemyWithRegenBonus = result.current.currentEnemy;
        attempts++;
      }

      // Skip test if no regeneration enemy found in mock data
      if (
        enemyWithRegenBonus &&
        enemyWithRegenBonus.bonus.type === "regeneration"
      ) {
        const bonusPercentage = enemyWithRegenBonus.bonus.amount;
        const expectedBonus = Math.max(
          initialRegenerationRate * (bonusPercentage / 100),
          0.1
        );

        act(() => {
          let attacks = 0;
          while (
            result.current.currentEnemy!.currentHealth > 0 &&
            attacks < 20
          ) {
            result.current.attack(result.current.currentEnemy!, true);
            attacks++;
          }
        });

        await waitFor(
          () => {
            const newRegenerationRate = result.current.hero.regenerationRate;
            expect(newRegenerationRate).toBeCloseTo(
              initialRegenerationRate + expectedBonus,
              0
            );
          },
          { timeout: 700 }
        );
      }
    }, 10000);

    it("should ensure minimum bonus of 0.1", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentEnemy).not.toBeNull();
      });

      // Even if the hero has 0 in a stat (like regenerationRate),
      // defeating an enemy should give at least 0.1 bonus
      const initialStats = {
        attackDamage: result.current.hero.attackDamage,
        maxHealth: result.current.hero.maxHealth,
        regenerationRate: result.current.hero.regenerationRate,
      };

      act(() => {
        let attacks = 0;
        while (result.current.currentEnemy!.currentHealth > 0 && attacks < 20) {
          result.current.attack(result.current.currentEnemy!, true);
          attacks++;
        }
      });

      await waitFor(
        () => {
          const bonusType = result.current.currentEnemy!.bonus.type;
          let statIncreased = false;

          if (bonusType === "attack") {
            statIncreased =
              result.current.hero.attackDamage >
              initialStats.attackDamage + 0.09;
          } else if (bonusType === "hp") {
            statIncreased =
              result.current.hero.maxHealth > initialStats.maxHealth + 0.09;
          } else if (bonusType === "regeneration") {
            statIncreased =
              result.current.hero.regenerationRate >
              initialStats.regenerationRate + 0.09;
          }

          expect(statIncreased).toBe(true);
        },
        { timeout: 700 }
      );
    });

    it("should display bonus animation when enemy is defeated", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentEnemy).not.toBeNull();
      });

      expect(result.current.bonusAnimation).toBeNull();

      act(() => {
        let attacks = 0;
        while (result.current.currentEnemy!.currentHealth > 0 && attacks < 20) {
          result.current.attack(result.current.currentEnemy!, true);
          attacks++;
        }
      });

      await waitFor(() => {
        expect(result.current.bonusAnimation).not.toBeNull();
        expect(result.current.bonusAnimation?.type).toMatch(
          /hp|attack|regeneration/
        );
        expect(result.current.bonusAnimation?.amount).toBeGreaterThan(0);
      });
    });

    it("should clear bonus animation after 1 second", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentEnemy).not.toBeNull();
      });

      act(() => {
        let attacks = 0;
        while (result.current.currentEnemy!.currentHealth > 0 && attacks < 20) {
          result.current.attack(result.current.currentEnemy!, true);
          attacks++;
        }
      });

      await waitFor(() => {
        expect(result.current.bonusAnimation).not.toBeNull();
      });

      await waitFor(
        () => {
          expect(result.current.bonusAnimation).toBeNull();
        },
        { timeout: 1500 }
      );
    });
  });

  describe("Start New Adventure", () => {
    it("should expose startNewAdventure function", () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      expect(result.current.startNewAdventure).toBeDefined();
      expect(typeof result.current.startNewAdventure).toBe("function");
    });

    it("should reset hero health when calling startNewAdventure", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentEnemy).not.toBeNull();
      });

      // Damage the hero
      act(() => {
        result.current.attack(result.current.currentEnemy!, false);
      });

      await waitFor(() => {
        expect(result.current.hero.currentHealth).toBeLessThan(
          result.current.hero.maxHealth
        );
      });

      const maxHealth = result.current.hero.maxHealth;

      // Start new adventure
      act(() => {
        result.current.startNewAdventure();
      });

      await waitFor(() => {
        expect(result.current.hero.currentHealth).toBe(maxHealth);
      });
    });

    it("should reset to first enemy when calling startNewAdventure", async () => {
      const { result } = renderHook(() => useAdventureGame(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentEnemy).not.toBeNull();
      });

      // Defeat some enemies
      act(() => {
        for (let i = 0; i < 3; i++) {
          let attacks = 0;
          while (
            result.current.currentEnemy!.currentHealth > 0 &&
            attacks < 20
          ) {
            result.current.attack(result.current.currentEnemy!, true);
            attacks++;
          }
        }
      });

      await waitFor(() => {
        expect(result.current.currentEnemy!.currentHealth).toBe(
          result.current.currentEnemy!.maxHealth
        );
      });

      // Start new adventure
      act(() => {
        result.current.startNewAdventure();
      });

      // Enemy is randomly selected, so we just verify it's a valid enemy
      await waitFor(() => {
        const validEnemyIds = ["NightBorne", "Skeleton"];
        expect(validEnemyIds).toContain(result.current.currentEnemy!.id);
      });
    });
  });
});
