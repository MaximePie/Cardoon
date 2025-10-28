import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserContext } from "../../../context/UserContext";
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

// Import the mocked hook
import { usePut } from "../../../hooks/server";

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

  const mockUserContextValue = {
    user: mockUser,
    reviewUserCards: mockCards,
    allUserCards: [],
    setUser: vi.fn(),
    logout: vi.fn(),
    addScore: vi.fn(),
    earnGold: vi.fn(),
    removeGold: vi.fn(),
    hasItem: vi.fn(),
    refresh: vi.fn(),
    getAllUserCards: vi.fn(),
    getReviewUserCards: mockGetReviewUserCards,
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
  });

  const renderAdventurePage = (contextValue = mockUserContextValue) => {
    return render(
      <UserContext.Provider value={contextValue}>
        <AdventurePage />
      </UserContext.Provider>
    );
  };

  describe("Initial Rendering", () => {
    it("should render the welcome message and hero stats", () => {
      renderAdventurePage();

      expect(
        screen.getByText(
          "Bienvenue, valeureux aventurier ! Prête à devenir une héroïne ? Allons-y !"
        )
      ).toBeInTheDocument();

      // Check hero stats display (text is split by whitespace in profile stats)
      const statsSection = document.querySelector(".AdventurePage__stats");
      expect(statsSection).toBeInTheDocument();

      // Check for Material-UI icons to verify stats display
      expect(screen.getByTestId("FavoriteIcon")).toBeInTheDocument();
      expect(screen.getByTestId("WhatshotIcon")).toBeInTheDocument();
      expect(screen.getByTestId("StarBorderPurple500Icon")).toBeInTheDocument();
    });

    it("should render hero and enemy characters with health bars and names", () => {
      renderAdventurePage();

      // Check for hero avatar and info
      expect(screen.getByAltText("Hero Avatar")).toBeInTheDocument();
      expect(screen.getByText("Hero")).toBeInTheDocument();
      expect(screen.getByText("HP: 120 / 120")).toBeInTheDocument();

      // Check for enemy image and info
      expect(screen.getByAltText("Idle Enemy")).toBeInTheDocument();
      expect(screen.getByText("Night Borne")).toBeInTheDocument();
      expect(screen.getByText("HP: 100 / 100")).toBeInTheDocument();

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
        reviewUserCards: manyCards,
      };

      renderAdventurePage(contextWithManyCards);

      // Should only show 5 cards
      for (let i = 1; i <= 5; i++) {
        expect(screen.getByTestId(`card-card${i}`)).toBeInTheDocument();
      }
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
    it("should display hero experience bar", () => {
      renderAdventurePage();

      // Check for experience bar component
      const expBar = document.querySelector(".ExpBar");
      expect(expBar).toBeInTheDocument();

      // Check for XP text within the ExpBar
      const expBarText = expBar?.querySelector(".ExpBar__text");
      expect(expBarText).toHaveTextContent("0 / 100 XP");
    });

    it("should display hero stats with icons", () => {
      renderAdventurePage();

      // Check for Material-UI icons
      expect(
        document.querySelector('[data-testid="FavoriteIcon"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-testid="WhatshotIcon"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-testid="StarBorderPurple500Icon"]')
      ).toBeInTheDocument();
    });
  });

  describe("Card Interactions", () => {
    it("should call updateUserCard when answering correctly", async () => {
      renderAdventurePage();

      const correctButton = screen.getByTestId("correct-card1");
      fireEvent.click(correctButton);

      expect(mockPut).toHaveBeenCalledWith("card1", { isCorrectAnswer: true });
      expect(mockGetReviewUserCards).toHaveBeenCalled();
    });

    it("should call updateUserCard when answering incorrectly", async () => {
      renderAdventurePage();

      const wrongButton = screen.getByTestId("wrong-card2");
      fireEvent.click(wrongButton);

      expect(mockPut).toHaveBeenCalledWith("card2", { isCorrectAnswer: false });
      expect(mockGetReviewUserCards).toHaveBeenCalled();
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
        reviewUserCards: [],
      };

      renderAdventurePage(contextWithNoCards);

      // Should still render the page structure
      expect(
        screen.getByText(
          "Bienvenue, valeureux aventurier ! Prête à devenir une héroïne ? Allons-y !"
        )
      ).toBeInTheDocument();

      // But no cards should be visible
      expect(screen.queryByTestId(/^card-/)).not.toBeInTheDocument();
    });

    it("should update cards when usePut returns data", () => {
      const updatedCard = {
        user: mockUser,
        userCard: mockCards[0],
      };

      // Mock usePut to return data
      vi.mocked(usePut).mockReturnValue({
        put: mockPut,
        putUser: vi.fn(),
        data: updatedCard,
        loading: false,
        error: undefined,
      });

      renderAdventurePage();

      // The updated card should be filtered out from cardsInHand
      // This tests the useEffect that filters cards based on updateCardResponse
      expect(screen.queryByTestId("card-card1")).not.toBeInTheDocument();
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
      const enemyImage = screen.getByAltText("Idle Enemy");
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
      expect(screen.getByAltText("Idle Enemy")).toBeInTheDocument();
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
      expect(screen.getByText("Hero")).toBeInTheDocument();
      expect(screen.getByText("Night Borne")).toBeInTheDocument();

      // Check for health displays using more specific queries
      const heroSection = screen
        .getByText("Hero")
        .closest(".AdventurePage__Hero");
      const enemySection = screen
        .getByText("Night Borne")
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
      expect(
        screen.getByText(
          "Bienvenue, valeureux aventurier ! Prête à devenir une héroïne ? Allons-y !"
        )
      ).toBeInTheDocument();
      expect(screen.getByText("Hero")).toBeInTheDocument();

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
      expect(
        screen.getByText(
          "Bienvenue, valeureux aventurier ! Prête à devenir une héroïne ? Allons-y !"
        )
      ).toBeInTheDocument();
      expect(screen.getByTestId("card-card1")).toBeInTheDocument();
    });
  });
});
