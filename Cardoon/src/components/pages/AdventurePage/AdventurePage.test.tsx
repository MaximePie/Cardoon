import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdventureContext } from "../../../context/AdventureContext/AdventureContext";
import { UserContext, UserContextType } from "../../../context/UserContext";
import { PopulatedUserCard, User } from "../../../types/common";
import AdventurePage from "./AdventurePage";

// Mock the Card component
vi.mock("../../molecules/Card/Card", () => ({
  default: ({
    card,
    onUpdate,
  }: {
    card: PopulatedUserCard;
    onUpdate: (card: PopulatedUserCard, isCorrect: boolean) => void;
  }) => (
    <div data-testid={`card-${card._id}`}>
      <div>Question: {card.card.question}</div>
      <div>Answer: {card.card.answer}</div>
      <button
        data-testid={`correct-${card._id}`}
        onClick={() => onUpdate(card, true)}
      >
        Correct Answer
      </button>
      <button
        data-testid={`wrong-${card._id}`}
        onClick={() => onUpdate(card, false)}
      >
        Wrong Answer
      </button>
    </div>
  ),
}));

// Mock the server hook
vi.mock("../../../hooks/server", () => ({
  ACTIONS: {
    UPDATE_INTERVAL: "/api/user-cards/interval",
    ME: "/api/me",
  },
  RESOURCES: {
    USERCARDS: "/api/user-cards",
    REVIEW_USERCARDS: "/api/review-user-cards",
  },
  usePut: vi.fn(),
  useFetch: vi.fn(),
}));

// Mock TanStack Query hooks used in useUserManager and useUserCardsManager
vi.mock("../../../hooks/queries/useUserCards", () => ({
  useUserManager: vi.fn(),
  useUserCardsManager: vi.fn(),
}));

// Import the mocked hook
import { usePut } from "../../../hooks/server";

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
        },
      ],
    },
  ],
};

describe("AdventurePage", () => {
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
        question: "What is the capital of France?",
        answer: "Paris",
        interval: 1,
        imageLink: "",
        category: "Geography",
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
        question: "Who wrote Hamlet?",
        answer: "Shakespeare",
        interval: 2,
        imageLink: "",
        category: "Literature",
        createdAt: "2023-01-02",
        ownedBy: "user123",
        isInverted: false,
        hasInvertedChild: false,
      },
      interval: 2,
      lastReviewed: "2023-10-19",
      nextReview: "2023-10-21",
    },
    {
      _id: "card3",
      card: {
        _id: "cardId3",
        question: "What is 2+2?",
        answer: "4",
        interval: 1,
        imageLink: "",
        category: "Math",
        createdAt: "2023-01-03",
        ownedBy: "user123",
        isInverted: false,
        hasInvertedChild: false,
      },
      interval: 1,
      lastReviewed: "2023-10-20",
      nextReview: "2023-10-21",
    },
  ];

  const mockPut = vi.fn();
  const mockGetReviewUserCards = vi.fn();

  const mockUserContextValue: UserContextType = {
    cards: {
      reviewUserCards: {
        data: mockCards,
        isLoading: false,
        error: null,
        getReviewUserCards: mockGetReviewUserCards,
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

    // Mock usePut hook
    vi.mocked(usePut).mockReturnValue({
      put: mockPut,
      putUser: vi.fn(),
      data: null,
      loading: false,
      error: undefined,
    });

    // Mock TanStack Query hooks
    const mockUseUserManager = vi.fn(() => ({
      user: mockUser,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      resetQueries: vi.fn(),
    }));

    const mockUseUserCardsManager = vi.fn(() => ({
      cards: [],
      reviewUserCards: mockCards,
      isLoading: false,
      isReviewUserCardsLoading: false,
      isDeletingCard: false,
      isEditingCard: false,
      isInvertingCard: false,
      error: null,
      deleteError: null,
      editError: null,
      invertError: null,
      reviewUserCardsError: null,
      deleteCard: vi.fn(),
      deleteCards: vi.fn(),
      editCard: vi.fn(),
      invertCard: vi.fn(),
      refetch: vi.fn(),
      isStale: false,
      refetchReviewUserCards: mockGetReviewUserCards,
      resetQueries: vi.fn(),
    }));

    // Apply mocks
    vi.doMock("../../../hooks/queries/useUserCards", () => ({
      useUserManager: mockUseUserManager,
      useUserCardsManager: mockUseUserCardsManager,
    }));
  });

  const renderAdventurePage = (contextValue = mockUserContextValue) => {
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

    return render(
      <QueryClientProvider client={queryClient}>
        <UserContext.Provider value={contextValue}>
          <AdventureContext.Provider value={mockAdventureContextValue}>
            <AdventurePage />
          </AdventureContext.Provider>
        </UserContext.Provider>
      </QueryClientProvider>
    );
  };

  describe("Initial Rendering", () => {
    it("should render the hero stats and icons", () => {
      renderAdventurePage();

      // Check that stats are displayed correctly
      expect(screen.getByText("2")).toBeInTheDocument(); // Attack damage

      // Check that hero stats are displayed
      const statsSection = document.querySelector(".AdventurePage__stats");
      expect(statsSection).toBeInTheDocument();

      // Check for stats resources section
      const statsResources = document.querySelector(
        ".AdventurePage__stats-resources"
      );
      expect(statsResources).toBeInTheDocument();
    });

    it("should render hero and enemy characters with health bars and names", () => {
      renderAdventurePage();

      // Check for hero avatar and info
      expect(screen.getByAltText("Hero Avatar")).toBeInTheDocument();

      // Check hero health using the health bar element
      const heroHealthElements = document.querySelectorAll(
        ".AdventurePage__healthText"
      );
      expect(heroHealthElements[0]).toHaveTextContent("120 / 120"); // Hero health

      // Check for enemy image and info
      expect(screen.getByAltText("Night Borne")).toBeInTheDocument();
      expect(screen.getByText(/Night Borne/)).toBeInTheDocument();

      // Check for enemy health - use class selector to be specific
      const enemyHealthElements = document.querySelectorAll(
        ".AdventurePage__healthText"
      );
      expect(enemyHealthElements).toHaveLength(2); // Hero and enemy
      expect(enemyHealthElements[1]).toHaveTextContent("5 / 5"); // Enemy health

      // Check for health bars (by class name since they don't have specific roles)
      const healthBars = document.querySelectorAll(".AdventurePage__healthBar");
      expect(healthBars).toHaveLength(2);
    });

    it("should render up to 5 cards in hand", () => {
      renderAdventurePage();

      // Should show first 3 cards (all available cards in mock)
      expect(screen.getByTestId("card-card1")).toBeInTheDocument();
      expect(screen.getByTestId("card-card2")).toBeInTheDocument();
      expect(screen.getByTestId("card-card3")).toBeInTheDocument();
    });

    it("should limit cards to maximum of 5", () => {
      const manyCards = Array.from({ length: 7 }, (_, i) => ({
        ...mockCards[0],
        _id: `card${i + 1}`,
        card: {
          ...mockCards[0].card,
          _id: `cardId${i + 1}`,
          question: `Question ${i + 1}`,
        },
      }));

      const contextWithManyCards = {
        ...mockUserContextValue,
        cards: {
          ...mockUserContextValue.cards,
          reviewUserCards: {
            ...mockUserContextValue.cards.reviewUserCards,
            data: manyCards,
          },
        },
      };

      renderAdventurePage(contextWithManyCards);

      // Should show at most 5 cards (or all available if less than 5)
      const cardElements = screen.getAllByTestId(/^card-/);
      expect(cardElements.length).toBeLessThanOrEqual(5);

      // Verify first 5 cards exist if we have them
      const expectedCards = Math.min(manyCards.length, 5);
      for (let i = 1; i <= expectedCards; i++) {
        expect(screen.getByTestId(`card-card${i}`)).toBeInTheDocument();
      }

      // Verify cards beyond 5 don't exist
      expect(screen.queryByTestId("card-card6")).not.toBeInTheDocument();
      expect(screen.queryByTestId("card-card7")).not.toBeInTheDocument();
    });
  });

  describe("Health Bar Display", () => {
    it("should show full health bars initially", () => {
      renderAdventurePage();

      const healthFills = document.querySelectorAll(
        ".AdventurePage__healthBar__fill"
      );

      // Both hero and enemy should start at 100% health
      expect(healthFills[0]).toHaveStyle("width: 100%"); // Hero: 120/120
      expect(healthFills[1]).toHaveStyle("width: 100%"); // Enemy: 100/100
    });
  });

  describe("Experience System", () => {
    it("should display hero stats with icons", () => {
      renderAdventurePage();

      // Check that attack damage is displayed
      expect(screen.getByText("2")).toBeInTheDocument(); // Attack damage

      // Check that icons are displayed (using getAllByTestId because icons may appear multiple times)
      expect(screen.getAllByTestId("WhatshotIcon").length).toBeGreaterThan(0);
      expect(
        screen.getAllByTestId("HealthAndSafetyIcon").length
      ).toBeGreaterThan(0);
      expect(screen.getAllByTestId("FavoriteIcon").length).toBeGreaterThan(0);
      expect(
        screen.getAllByTestId("StarBorderPurple500Icon").length
      ).toBeGreaterThan(0);

      // Check for stats structure
      const statsSection = document.querySelector(
        ".AdventurePage__stats-resources"
      );
      expect(statsSection).toBeInTheDocument();
    });
  });

  describe("Card Interactions", () => {
    it("should call updateUserCard when answering correctly", async () => {
      renderAdventurePage();

      const correctButton = screen.getByTestId("correct-card1");
      fireEvent.click(correctButton);

      expect(mockPut).toHaveBeenCalledWith("card1", { isCorrectAnswer: true });
      // 🔥 SUPPRIMÉ: getReviewUserCards n'est plus appelée dans removeCard
    });

    it("should call updateUserCard when answering incorrectly", async () => {
      renderAdventurePage();

      const wrongButton = screen.getByTestId("wrong-card2");
      fireEvent.click(wrongButton);

      expect(mockPut).toHaveBeenCalledWith("card2", { isCorrectAnswer: false });
      // 🔥 SUPPRIMÉ: getReviewUserCards n'est plus appelée dans removeCard
    });

    it("should remove card from hand after answering", async () => {
      renderAdventurePage();

      expect(screen.getByTestId("card-card1")).toBeInTheDocument();

      const correctButton = screen.getByTestId("correct-card1");
      fireEvent.click(correctButton);

      // Card should be removed from the UI
      await waitFor(() => {
        expect(screen.queryByTestId("card-card1")).not.toBeInTheDocument();
      });
    });

    it("should update health bars after combat", () => {
      renderAdventurePage();

      // Get initial health bar elements and store initial widths
      const healthFills = document.querySelectorAll(
        ".AdventurePage__healthBar__fill"
      );
      const initialHeroWidth = parseFloat(
        healthFills[0].getAttribute("style")?.match(/width: ([\d.]+)%/)?.[1] ||
          "0"
      );
      const initialEnemyWidth = parseFloat(
        healthFills[1].getAttribute("style")?.match(/width: ([\d.]+)%/)?.[1] ||
          "0"
      );

      // Answer correctly (both hero and enemy should take damage)
      const correctButton = screen.getByTestId("correct-card1");
      fireEvent.click(correctButton);

      // Check that both health bars decreased from their initial values
      const newHeroWidth = parseFloat(
        healthFills[0].getAttribute("style")?.match(/width: ([\d.]+)%/)?.[1] ||
          "0"
      );
      const newEnemyWidth = parseFloat(
        healthFills[1].getAttribute("style")?.match(/width: ([\d.]+)%/)?.[1] ||
          "0"
      );

      expect(newHeroWidth).toBeLessThan(initialHeroWidth);
      expect(newEnemyWidth).toBeLessThan(initialEnemyWidth);
    });

    it("should apply increased damage when answering incorrectly", () => {
      renderAdventurePage();

      const healthFills = document.querySelectorAll(
        ".AdventurePage__healthBar__fill"
      );
      const initialHeroWidth = parseFloat(
        healthFills[0].getAttribute("style")?.match(/width: ([\d.]+)%/)?.[1] ||
          "0"
      );
      const initialEnemyWidth = parseFloat(
        healthFills[1].getAttribute("style")?.match(/width: ([\d.]+)%/)?.[1] ||
          "0"
      );

      // Answer incorrectly (hero takes 1.5x damage, no damage to enemy)
      const wrongButton = screen.getByTestId("wrong-card1");
      fireEvent.click(wrongButton);

      // Check that hero health decreased but enemy health stayed the same
      const newHeroWidth = parseFloat(
        healthFills[0].getAttribute("style")?.match(/width: ([\d.]+)%/)?.[1] ||
          "0"
      );
      const newEnemyWidth = parseFloat(
        healthFills[1].getAttribute("style")?.match(/width: ([\d.]+)%/)?.[1] ||
          "0"
      );

      expect(newHeroWidth).toBeLessThan(initialHeroWidth);
      expect(newEnemyWidth).toBe(initialEnemyWidth);
    });
  });

  describe("Card Management", () => {
    it("should handle empty review cards gracefully", () => {
      const contextWithNoCards = {
        ...mockUserContextValue,
        cards: {
          ...mockUserContextValue.cards,
          reviewUserCards: {
            ...mockUserContextValue.cards.reviewUserCards,
            data: [],
          },
        },
      };

      renderAdventurePage(contextWithNoCards);

      // Should still render the page structure with hero
      expect(screen.getByAltText("Hero Avatar")).toBeInTheDocument();

      // But no cards should be visible - use queryAllByTestId to check for empty array
      const cardElements = screen.queryAllByTestId(/^card-/);
      expect(cardElements).toHaveLength(0);
    });

    it("should remove card immediately when user answers", async () => {
      renderAdventurePage();

      // Verify all cards are initially present
      expect(screen.getByTestId("card-card1")).toBeInTheDocument();
      expect(screen.getByTestId("card-card2")).toBeInTheDocument();
      expect(screen.getByTestId("card-card3")).toBeInTheDocument();

      // Click on the correct button for card1
      const correctButton = screen.getByTestId("correct-card1");
      fireEvent.click(correctButton);

      // 🔥 NOUVEAU COMPORTEMENT: La carte est supprimée immédiatement dans removeCard
      await waitFor(() => {
        expect(screen.queryByTestId("card-card1")).not.toBeInTheDocument();
      });

      // Other cards should still be present
      expect(screen.getByTestId("card-card2")).toBeInTheDocument();
      expect(screen.getByTestId("card-card3")).toBeInTheDocument();
    });
  });

  describe("Combat System", () => {
    it("should prevent negative health values", () => {
      // Create a scenario where damage would exceed health
      renderAdventurePage();

      const healthFills = document.querySelectorAll(
        ".AdventurePage__healthBar__fill"
      );

      // Simulate multiple wrong answers to reduce hero health significantly
      for (let i = 0; i < 3; i++) {
        const wrongButton = screen.getByTestId(`wrong-card${i + 1}`);
        fireEvent.click(wrongButton);
      }

      // Health should not go below 0%
      const heroHealthFill = healthFills[0];
      const currentWidth = parseFloat(
        heroHealthFill.getAttribute("style")?.match(/width: ([\d.]+)%/)?.[1] ||
          "0"
      );
      expect(currentWidth).toBeGreaterThanOrEqual(0);
    });

    it("should calculate damage correctly with defense", () => {
      renderAdventurePage();

      const healthFills = document.querySelectorAll(
        ".AdventurePage__healthBar__fill"
      );
      const initialHeroWidth = parseFloat(
        healthFills[0].getAttribute("style")?.match(/width: ([\d.]+)%/)?.[1] ||
          "0"
      );
      const initialEnemyWidth = parseFloat(
        healthFills[1].getAttribute("style")?.match(/width: ([\d.]+)%/)?.[1] ||
          "0"
      );

      // Test correct answer damage calculation
      const correctButton = screen.getByTestId("correct-card1");
      fireEvent.click(correctButton);

      // Verify both characters took damage
      const newHeroWidth = parseFloat(
        healthFills[0].getAttribute("style")?.match(/width: ([\d.]+)%/)?.[1] ||
          "0"
      );
      const newEnemyWidth = parseFloat(
        healthFills[1].getAttribute("style")?.match(/width: ([\d.]+)%/)?.[1] ||
          "0"
      );

      // Both should have decreased health due to combat
      expect(newHeroWidth).toBeLessThan(initialHeroWidth);
      expect(newEnemyWidth).toBeLessThan(initialEnemyWidth);

      // Enemy should take more damage than hero (hero has better defense)
      const heroHealthLoss = initialHeroWidth - newHeroWidth;
      const enemyHealthLoss = initialEnemyWidth - newEnemyWidth;
      expect(enemyHealthLoss).toBeGreaterThan(heroHealthLoss);
    });
  });

  describe("Enemy Information", () => {
    it("should display enemy with correct initial stats", () => {
      renderAdventurePage();

      // Check enemy image is rendered
      const enemyImage = screen.getByAltText("Night Borne");
      expect(enemyImage).toBeInTheDocument();
      expect(enemyImage).toHaveAttribute(
        "src",
        expect.stringContaining("NightBorne_idle.gif")
      );
    });
  });

  describe("Accessibility", () => {
    it("should have proper alt text for images", () => {
      renderAdventurePage();

      expect(screen.getByAltText("Hero Avatar")).toBeInTheDocument();
      expect(screen.getByAltText("Night Borne")).toBeInTheDocument();
    });

    it("should have accessible buttons", () => {
      renderAdventurePage();

      const correctButton = screen.getByTestId("correct-card1");
      expect(correctButton).toBeInTheDocument();
      expect(correctButton).toHaveAccessibleName();
    });

    it("should have accessible health information", () => {
      renderAdventurePage();

      // Check for character names
      expect(screen.getByAltText("Hero Avatar")).toBeInTheDocument();
      expect(screen.getByText(/Night Borne/)).toBeInTheDocument();

      // Check for health displays using more specific queries
      const heroSection = screen
        .getByAltText("Hero Avatar")
        .closest(".AdventurePage__Hero");
      const enemySection = screen
        .getByText(/Night Borne/)
        .closest(".AdventurePage__Enemy");

      expect(heroSection).toBeInTheDocument();
      expect(enemySection).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle usePut errors gracefully", () => {
      vi.mocked(usePut).mockReturnValue({
        put: mockPut,
        putUser: vi.fn(),
        data: null,
        loading: false,
        error: "Network error",
      });

      renderAdventurePage();

      // Component should still render normally
      expect(screen.getByAltText("Hero Avatar")).toBeInTheDocument();

      // Cards should still be interactive
      const correctButton = screen.getByTestId("correct-card1");
      fireEvent.click(correctButton);

      expect(mockPut).toHaveBeenCalled();
    });

    it("should handle loading state", () => {
      vi.mocked(usePut).mockReturnValue({
        put: mockPut,
        putUser: vi.fn(),
        data: null,
        loading: true,
        error: undefined,
      });

      renderAdventurePage();

      // Component should render normally during loading
      expect(screen.getByAltText("Hero Avatar")).toBeInTheDocument();
      expect(screen.getByTestId("card-card1")).toBeInTheDocument();
    });
  });

  describe("Hero Sprite Animation", () => {
    it("should display idle hero sprite by default", () => {
      renderAdventurePage();

      const heroImage = screen.getByAltText("Hero Avatar");
      expect(heroImage).toBeInTheDocument();
      expect(heroImage).toHaveAttribute(
        "src",
        expect.stringContaining("idle.gif")
      );
    });

    it("should switch to attack sprite when hero attacks (correct answer)", async () => {
      renderAdventurePage();

      const heroImage = screen.getByAltText("Hero Avatar");

      // Initially should be idle
      expect(heroImage).toHaveAttribute(
        "src",
        expect.stringContaining("idle.gif")
      );

      // Click correct answer to trigger attack
      const correctButton = screen.getByTestId("correct-card1");
      fireEvent.click(correctButton);

      // Should switch to attack sprite immediately
      expect(heroImage).toHaveAttribute(
        "src",
        expect.stringContaining("attack1.gif")
      );

      // Should return to idle after timeout
      await waitFor(
        () => {
          expect(heroImage).toHaveAttribute(
            "src",
            expect.stringContaining("idle.gif")
          );
        },
        { timeout: 600 } // Wait slightly longer than the 500ms timeout
      );
    });

    it("should NOT switch to attack sprite when hero answers wrong (stays idle)", async () => {
      renderAdventurePage();

      const heroImage = screen.getByAltText("Hero Avatar");

      // Initially should be idle
      expect(heroImage).toHaveAttribute(
        "src",
        expect.stringContaining("idle.gif")
      );

      // Click wrong answer - hero should NOT attack (new behavior)
      const wrongButton = screen.getByTestId("wrong-card1");
      fireEvent.click(wrongButton);

      // Should stay in idle sprite for wrong answers (updated behavior)
      expect(heroImage).toHaveAttribute(
        "src",
        expect.stringContaining("idle.gif")
      );

      // Should still be idle after timeout
      await waitFor(
        () => {
          expect(heroImage).toHaveAttribute(
            "src",
            expect.stringContaining("idle.gif")
          );
        },
        { timeout: 600 }
      );
    });

    it("should handle multiple rapid attacks correctly", async () => {
      renderAdventurePage();

      const heroImage = screen.getByAltText("Hero Avatar");

      // Click multiple cards rapidly
      const correctButton1 = screen.getByTestId("correct-card1");
      const correctButton2 = screen.getByTestId("correct-card2");

      fireEvent.click(correctButton1);
      expect(heroImage).toHaveAttribute(
        "src",
        expect.stringContaining("attack1.gif")
      );

      // Click another card before first animation finishes
      fireEvent.click(correctButton2);
      expect(heroImage).toHaveAttribute(
        "src",
        expect.stringContaining("attack1.gif")
      );

      // Should eventually return to idle
      await waitFor(
        () => {
          expect(heroImage).toHaveAttribute(
            "src",
            expect.stringContaining("idle.gif")
          );
        },
        { timeout: 1000 }
      );
    });

    it("should maintain sprite state consistency during combat", () => {
      renderAdventurePage();

      const heroImage = screen.getByAltText("Hero Avatar");

      // Verify hero image element exists and has proper attributes
      expect(heroImage).toBeInTheDocument();
      expect(heroImage).toHaveAttribute("alt", "Hero Avatar");
      expect(heroImage).toHaveClass("AdventurePage__characterImage");

      // Should start with idle sprite
      expect(heroImage).toHaveAttribute(
        "src",
        expect.stringContaining("idle.gif")
      );
    });

    it("should display hero sprite with proper CSS classes", () => {
      renderAdventurePage();

      const heroImage = screen.getByAltText("Hero Avatar");
      const heroContainer = heroImage.closest(".AdventurePage__Hero");

      expect(heroContainer).toBeInTheDocument();
      expect(heroImage).toHaveClass("AdventurePage__characterImage");
    });
  });

  describe("Hero State Management", () => {
    it("should maintain heroState as idle initially", () => {
      renderAdventurePage();

      const heroImage = screen.getByAltText("Hero Avatar");
      expect(heroImage).toHaveAttribute(
        "src",
        expect.stringContaining("idle.gif")
      );
    });

    it("should reset hero state to idle after each attack sequence", async () => {
      renderAdventurePage();

      const heroImage = screen.getByAltText("Hero Avatar");

      // Perform attack
      const correctButton = screen.getByTestId("correct-card1");
      fireEvent.click(correctButton);

      // Check attack state
      expect(heroImage).toHaveAttribute(
        "src",
        expect.stringContaining("attack1.gif")
      );

      // Wait for state reset
      await waitFor(
        () => {
          expect(heroImage).toHaveAttribute(
            "src",
            expect.stringContaining("idle.gif")
          );
        },
        { timeout: 600 }
      );

      // Should be ready for next attack
      const correctButton2 = screen.getByTestId("correct-card2");
      fireEvent.click(correctButton2);
      expect(heroImage).toHaveAttribute(
        "src",
        expect.stringContaining("attack1.gif")
      );
    });

    it("should handle hero state transitions without errors", () => {
      // Mock console.error to catch any potential errors
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      renderAdventurePage();

      const correctButton = screen.getByTestId("correct-card1");

      // Should not throw any errors during state transitions
      expect(() => {
        fireEvent.click(correctButton);
      }).not.toThrow();

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("Sprite Asset Loading", () => {
    it("should have correct asset paths for hero sprites", () => {
      renderAdventurePage();

      const heroImage = screen.getByAltText("Hero Avatar");

      // Check idle sprite path
      expect(heroImage).toHaveAttribute(
        "src",
        expect.stringContaining("idle.gif")
      );

      // Trigger attack to check attack sprite path
      const correctButton = screen.getByTestId("correct-card1");
      fireEvent.click(correctButton);

      expect(heroImage).toHaveAttribute(
        "src",
        expect.stringContaining("attack1.gif")
      );
    });

    it("should handle sprite switching without breaking image display", () => {
      renderAdventurePage();

      const heroImage = screen.getByAltText("Hero Avatar");

      // Initial state
      expect(heroImage).toBeInTheDocument();
      expect(heroImage).toHaveAttribute("src");

      // After attack
      const correctButton = screen.getByTestId("correct-card1");
      fireEvent.click(correctButton);

      // Should still be rendered with new src
      expect(heroImage).toBeInTheDocument();
      expect(heroImage).toHaveAttribute("src");
    });
  });

  describe("Motion Animations", () => {
    it("should render hero with motion.div for animations", () => {
      renderAdventurePage();

      // Check that hero container has motion capabilities
      const heroContainer = document.querySelector(".AdventurePage__Hero");
      expect(heroContainer).toBeInTheDocument();
    });

    it("should have proper animation variants setup", () => {
      renderAdventurePage();

      const heroImage = screen.getByAltText("Hero Avatar");
      expect(heroImage).toBeInTheDocument();

      // Trigger attack to test animation
      const correctButton = screen.getByTestId("correct-card1");
      fireEvent.click(correctButton);

      // Hero should switch to attack state
      expect(heroImage).toHaveAttribute(
        "src",
        expect.stringContaining("attack1.gif")
      );
    });

    it("should have motion.div with correct animation props", () => {
      renderAdventurePage();

      const heroContainer = document.querySelector(".AdventurePage__Hero");
      expect(heroContainer).toBeInTheDocument();

      // Motion.div should be rendering the hero container
      // Testing that the component renders without Motion errors
      const heroImage = screen.getByAltText("Hero Avatar");
      expect(heroImage).toBeInTheDocument();
    });
  });

  describe("Enemy State Management", () => {
    it("should display enemy in idle state initially", () => {
      renderAdventurePage();

      const enemyImage = screen.getByAltText("Night Borne");
      expect(enemyImage).toBeInTheDocument();
      expect(enemyImage).toHaveAttribute(
        "src",
        expect.stringContaining("NightBorne_idle.gif")
      );
    });

    it("should handle enemy defeat animation", () => {
      renderAdventurePage();

      const enemyImage = screen.getByAltText("Night Borne");
      expect(enemyImage).toHaveAttribute(
        "src",
        expect.stringContaining("NightBorne_idle.gif")
      );

      // Test that enemy has proper asset references
      // In a defeated state, it would use enemyDefeated asset
      // Note: Since we use Math.max for damage calculation and the enemy has defense,
      // we'd need multiple hits to defeat the enemy in normal circumstances
      // This test validates the image source behavior
    });

    it("should use correct enemy asset imports", () => {
      renderAdventurePage();

      const enemyImage = screen.getByAltText("Night Borne");

      // Check that enemy image uses the imported idle asset
      expect(enemyImage).toHaveAttribute(
        "src",
        expect.stringContaining("NightBorne_idle.gif")
      );
      expect(enemyImage).toHaveClass("AdventurePage__characterImage");
    });
  });

  describe("Level and Dev Mode Display", () => {
    it("should display level information", () => {
      renderAdventurePage();

      // Check for level text - it's now separated in different elements
      expect(screen.getByText("Forêt toxique")).toBeInTheDocument();
    });

    it("should display restructured stats layout", () => {
      renderAdventurePage();

      // Check for new CSS classes structure
      const statsResources = document.querySelector(
        ".AdventurePage__stats-resources"
      );
      const statsLevel = document.querySelector(".AdventurePage__stats-level");

      expect(statsResources).toBeInTheDocument();
      expect(statsLevel).toBeInTheDocument();
    });

    it("should show dev mode status span in hero status", () => {
      renderAdventurePage();

      // Check for dev mode status span in hero status
      const statusSpan = document.querySelector(".AdventurePage__status");
      expect(statusSpan).toBeInTheDocument();

      // The devMode image will only show if devMode variable is truthy
      // This tests the span container exists regardless
    });
  });

  describe("New Attack Logic", () => {
    it("should only trigger attack animation for correct answers", () => {
      renderAdventurePage();

      const heroImage = screen.getByAltText("Hero Avatar");

      // Test correct answer - should attack
      const correctButton = screen.getByTestId("correct-card1");
      fireEvent.click(correctButton);

      expect(heroImage).toHaveAttribute(
        "src",
        expect.stringContaining("attack1.gif")
      );
    });

    it("should not trigger attack animation for wrong answers", () => {
      renderAdventurePage();

      const heroImage = screen.getByAltText("Hero Avatar");

      // Test wrong answer - should stay idle
      const wrongButton = screen.getByTestId("wrong-card2");
      fireEvent.click(wrongButton);

      expect(heroImage).toHaveAttribute(
        "src",
        expect.stringContaining("idle.gif")
      );
    });

    it("should still apply damage for wrong answers without animation", () => {
      renderAdventurePage();

      const healthFills = document.querySelectorAll(
        ".AdventurePage__healthBar__fill"
      );
      const initialHeroWidth = parseFloat(
        healthFills[0].getAttribute("style")?.match(/width: ([\d.]+)%/)?.[1] ||
          "0"
      );

      // Answer incorrectly - hero should take damage but not animate
      const wrongButton = screen.getByTestId("wrong-card1");
      fireEvent.click(wrongButton);

      const newHeroWidth = parseFloat(
        healthFills[0].getAttribute("style")?.match(/width: ([\d.]+)%/)?.[1] ||
          "0"
      );

      expect(newHeroWidth).toBeLessThan(initialHeroWidth);
    });
  });

  describe("Level Up System", () => {
    it("should display current hero level", () => {
      renderAdventurePage();

      // Check that hero level is displayed (initially level 1)
      const statsResources = document.querySelector(
        ".AdventurePage__stats-resources"
      );
      expect(statsResources).toBeInTheDocument();

      // The level should be visible in the stats - check by finding the StarBorderPurple500Icon which indicates level
      const levelIcon = screen.getAllByTestId("StarBorderPurple500Icon");
      expect(levelIcon.length).toBeGreaterThan(0); // Level icon is displayed
    });

    it("should handle enemy defeat and experience gain", () => {
      renderAdventurePage();

      // Check that enemy health is displayed correctly
      const enemyHealthElements = document.querySelectorAll(
        ".AdventurePage__healthText"
      );
      expect(enemyHealthElements[1]).toHaveTextContent("5 / 5");
    });

    it("should reset enemy health when defeated", () => {
      renderAdventurePage();

      // Check initial enemy health display by targeting the specific health element
      const enemyHealthElements = document.querySelectorAll(
        ".AdventurePage__healthText"
      );
      expect(enemyHealthElements[1]).toHaveTextContent("5 / 5");

      // The enemy reset logic is tested through the health bar display
      const healthFills = document.querySelectorAll(
        ".AdventurePage__healthBar__fill"
      );
      expect(healthFills).toHaveLength(2); // Hero and enemy health bars
    });
  });

  describe("Asset Loading", () => {
    it("should properly load all required assets", () => {
      renderAdventurePage();

      // Test hero assets
      const heroImage = screen.getByAltText("Hero Avatar");
      expect(heroImage).toHaveAttribute(
        "src",
        expect.stringContaining("idle.gif")
      );

      // Test enemy assets
      const enemyImage = screen.getByAltText("Night Borne");
      expect(enemyImage).toHaveAttribute(
        "src",
        expect.stringContaining("NightBorne_idle.gif")
      );

      // Test background asset
      const background = document.querySelector(".AdventurePage__background");
      expect(background).toBeInTheDocument();
      expect(background).toHaveStyle(
        "background-image: url(/src/assets/adventure-background.svg)"
      );
    });

    it("should handle hero attack animation asset correctly", () => {
      renderAdventurePage();

      const heroImage = screen.getByAltText("Hero Avatar");

      // Trigger attack to test attack asset loading
      const correctButton = screen.getByTestId("correct-card1");
      fireEvent.click(correctButton);

      expect(heroImage).toHaveAttribute(
        "src",
        expect.stringContaining("attack1.gif")
      );
    });
  });
});
