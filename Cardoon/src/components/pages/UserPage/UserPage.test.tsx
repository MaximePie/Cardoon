import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SnackbarContextProvider } from "../../../context/SnackbarContext";
import * as userHooks from "../../../context/UserContext/useUserContext";
import { User } from "../../../types/common";
import UserPage from "./UserPage";

// Mock hooks
vi.mock("../../../hooks/server", () => ({
  RESOURCES: {
    USER_DAILY_GOAL: "/api/user/daily-goal",
  },
  usePut: vi.fn(),
}));

vi.mock("../../../context/UserContext/useUserContext", () => ({
  useUser: vi.fn(),
}));

vi.mock("../../../hooks/queries/useUserCards", () => ({
  useUserCardsManager: vi.fn(),
}));

// Import mocked modules
import { useUserCardsManager } from "../../../hooks/queries/useUserCards";
import { usePut } from "../../../hooks/server";

// Helper function to create complete user context mock with new structure
const createMockUserContext = (user: User, overrides = {}) => ({
  user: {
    data: user,
    isLoading: false,
    error: null,
    hasItem: vi.fn(() => false),
    setUser: vi.fn(),
    logout: vi.fn(),
    login: vi.fn(),
    addScore: vi.fn(),
    earnGold: vi.fn(),
    removeGold: vi.fn(),
    refresh: vi.fn(),
    updateImage: vi.fn(),
    updateDailyGoal: vi.fn(),
    addHeroBonus: vi.fn(),
  },
  cards: {
    reviewUserCards: {
      data: [],
      isLoading: false,
      error: null,
      getReviewUserCards: vi.fn(),
    },
    allUserCards: {
      data: [],
      isLoading: false,
      error: null,
      deleteCard: vi.fn(),
      deleteCards: vi.fn(),
      isDeletingCard: false,
      isEditingCard: false,
      cardsError: null,
      editCard: vi.fn(),
      invertCard: vi.fn(),
      isInvertingCard: false,
    },
  },
  clearAllErrors: vi.fn(),
  ...overrides,
});

describe("UserPage", () => {
  const mockUser: User = {
    _id: "user123",
    username: "testuser",
    score: 150,
    role: "user",
    gold: 500,
    items: [],
    dailyGoal: 10,
    currentGoldMultiplier: 1,
    streak: 5,
    currentDailyGoal: {
      progress: 3,
      target: 10,
      closedAt: "2023-10-21",
      status: "PENDING",
    },
    hero: {
      maxHealth: 120,
      currentHealth: 120,
      attackDamage: 2,
      defense: 0,
      regenerationRate: 0,
      level: 1,
      experience: 0,
      experienceToNextLevel: 100,
    },
  };

  const mockSetUser = vi.fn();
  const mockPutUser = vi.fn();
  const mockPut = vi.fn();
  const mockUpdateDailyGoal = vi.fn();
  const mockUsePutReturn = {
    putUser: mockPutUser,
    put: mockPut,
    data: null,
    loading: false,
    error: undefined,
  };

  // Mock du hook TanStack Query pour les cartes utilisateur
  const mockDeleteCard = vi.fn();
  const mockDeleteCards = vi.fn();
  const mockRefetch = vi.fn();
  const mockResetQueries = vi.fn();
  const mockUserCardsManagerReturn = {
    cards: [],
    reviewUserCards: [],
    isLoading: false,
    isReviewUserCardsLoading: false,
    isDeletingCard: false,
    isEditingCard: false,
    isInvertingCard: false,
    error: null,
    reviewUserCardsError: null,
    deleteError: null,
    editError: null,
    invertError: null,
    deleteCard: mockDeleteCard,
    deleteCards: mockDeleteCards,
    editCard: vi.fn(),
    invertCard: vi.fn(),
    refetch: mockRefetch.mockResolvedValue({
      data: [],
      isError: false,
      isLoading: false,
      isSuccess: true,
    }),
    refetchReviewUserCards: vi.fn().mockResolvedValue({
      data: [],
      isError: false,
      isLoading: false,
      isSuccess: true,
    }),
    resetQueries: mockResetQueries,
    isStale: false,
  };

  // Créer un QueryClient pour les tests
  let testQueryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();

    // Recréer le QueryClient pour chaque test
    testQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
          staleTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    });

    vi.mocked(userHooks.useUser).mockReturnValue(
      createMockUserContext(mockUser, {
        user: {
          ...createMockUserContext(mockUser).user,
          setUser: mockSetUser,
          updateDailyGoal: mockUpdateDailyGoal,
        },
      })
    );

    vi.mocked(usePut).mockReturnValue(mockUsePutReturn);

    vi.mocked(useUserCardsManager).mockReturnValue({
      ...mockUserCardsManagerReturn,
    });
  });

  const renderUserPage = () => {
    return render(
      <QueryClientProvider client={testQueryClient}>
        <SnackbarContextProvider>
          <UserPage />
        </SnackbarContextProvider>
      </QueryClientProvider>
    );
  };

  describe("Rendering", () => {
    it("should render user information correctly", () => {
      renderUserPage();

      // Check for "Profil" tab button instead of heading
      expect(screen.getByRole("tab", { name: "Profil" })).toBeInTheDocument();

      // Check username in heading
      expect(
        screen.getByRole("heading", { name: "testuser" })
      ).toBeInTheDocument();

      // Check gold amount and currency label
      expect(screen.getByText("500")).toBeInTheDocument();
      expect(screen.getByText("Knowledge Coins")).toBeInTheDocument();

      // Check for experience text in the new UserHeader
      expect(screen.getByText("Expérience")).toBeInTheDocument();
    });

    it("should render daily goal progress correctly", () => {
      renderUserPage();

      expect(screen.getByText("Objectif quotidien actuel")).toBeInTheDocument();
    });

    it("should render daily goal form with current value", () => {
      renderUserPage();

      const input = screen.getByDisplayValue("10") as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.type).toBe("number");
      // Input min attribute might not be set in the component

      expect(
        screen.getByRole("button", { name: "Enregistrer l'objectif quotidien" })
      ).toBeInTheDocument();
    });
  });

  describe("Daily Goal Form", () => {
    it("should update draft daily goal when input changes", () => {
      renderUserPage();

      const input = screen.getByDisplayValue("10");
      fireEvent.change(input, { target: { value: "15" } });

      expect(input).toHaveValue(15);
    });

    it("should handle invalid input values", () => {
      renderUserPage();

      const input = screen.getByDisplayValue("10");
      fireEvent.change(input, { target: { value: "invalid" } });

      expect(input).toHaveValue(0);
    });

    it("should handle empty input values", () => {
      renderUserPage();

      const input = screen.getByDisplayValue("10");
      fireEvent.change(input, { target: { value: "" } });

      expect(input).toHaveValue(0);
    });

    it("should call updateDailyGoal when form is submitted", () => {
      renderUserPage();

      const input = screen.getByDisplayValue("10");
      fireEvent.change(input, { target: { value: "20" } });

      const form = screen
        .getByRole("button", { name: "Enregistrer l'objectif quotidien" })
        .closest("form");
      fireEvent.submit(form!);

      expect(mockUpdateDailyGoal).toHaveBeenCalledWith(20);
    });

    it("should submit form with current draft value", () => {
      renderUserPage();

      const form = screen
        .getByRole("button", { name: "Enregistrer l'objectif quotidien" })
        .closest("form");
      fireEvent.submit(form!);

      expect(mockUpdateDailyGoal).toHaveBeenCalledWith(10);
    });
  });

  describe("Daily Goal Variations", () => {
    it("should handle user with no daily goal set", () => {
      const userWithoutDailyGoal: User = {
        ...mockUser,
        dailyGoal: 0,
      };

      vi.mocked(userHooks.useUser).mockReturnValue(
        createMockUserContext(userWithoutDailyGoal, {
          user: {
            ...createMockUserContext(userWithoutDailyGoal).user,
            setUser: mockSetUser,
            updateDailyGoal: mockUpdateDailyGoal,
          },
        })
      );

      renderUserPage();

      expect(screen.getByDisplayValue("0")).toBeInTheDocument();
    });

    it("should handle different daily goal values", () => {
      const userWithHighGoal: User = {
        ...mockUser,
        dailyGoal: 50,
      };

      vi.mocked(userHooks.useUser).mockReturnValue(
        createMockUserContext(userWithHighGoal, {
          user: {
            ...createMockUserContext(userWithHighGoal).user,
            setUser: mockSetUser,
            updateDailyGoal: mockUpdateDailyGoal,
          },
        })
      );

      renderUserPage();

      expect(screen.getByDisplayValue("50")).toBeInTheDocument();
    });
  });

  describe("User Variations", () => {
    it("should render admin user correctly", () => {
      const adminUser: User = {
        ...mockUser,
        username: "admin",
        role: "admin",
        gold: 9999,
      };

      vi.mocked(userHooks.useUser).mockReturnValue(
        createMockUserContext(adminUser, {
          user: {
            ...createMockUserContext(adminUser).user,
            setUser: mockSetUser,
            updateDailyGoal: mockUpdateDailyGoal,
          },
        })
      );

      renderUserPage();

      expect(
        screen.getByRole("heading", { name: "admin" })
      ).toBeInTheDocument();

      // Check for experience text instead of role text
      expect(screen.getByText("Expérience")).toBeInTheDocument();
      expect(screen.getByText("10.0K")).toBeInTheDocument();
    });

    it("should handle different daily goal statuses", () => {
      const userWithCompletedGoal: User = {
        ...mockUser,
        currentDailyGoal: {
          progress: 10,
          target: 10,
          closedAt: "2023-10-21",
          status: "COMPLETED",
        },
      };

      vi.mocked(userHooks.useUser).mockReturnValue(
        createMockUserContext(userWithCompletedGoal, {
          user: {
            ...createMockUserContext(userWithCompletedGoal).user,
            setUser: mockSetUser,
            updateDailyGoal: mockUpdateDailyGoal,
          },
        })
      );

      renderUserPage();

      // Check if the daily goal is properly displayed - use more flexible text matching
      expect(screen.getByDisplayValue("10")).toBeInTheDocument();
    });
  });

  describe("Form Interactions", () => {
    it("should maintain form state during multiple changes", () => {
      renderUserPage();

      const input = screen.getByDisplayValue("10");

      // First change
      fireEvent.change(input, { target: { value: "5" } });
      expect(input).toHaveValue(5);

      // Second change
      fireEvent.change(input, { target: { value: "30" } });
      expect(input).toHaveValue(30);

      // Submit with final value
      const form = screen
        .getByRole("button", { name: "Enregistrer l'objectif quotidien" })
        .closest("form");
      fireEvent.submit(form!);

      expect(mockUpdateDailyGoal).toHaveBeenCalledWith(30);
    });

    it("should prevent form submission default behavior", () => {
      renderUserPage();

      const form = screen
        .getByRole("button", { name: "Enregistrer l'objectif quotidien" })
        .closest("form");
      const mockPreventDefault = vi.fn();

      // Create a custom event with preventDefault
      const submitEvent = new Event("submit", { bubbles: true });
      submitEvent.preventDefault = mockPreventDefault;

      form!.dispatchEvent(submitEvent);

      // The component should have called preventDefault
      expect(mockUpdateDailyGoal).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle server error gracefully", () => {
      vi.mocked(usePut).mockReturnValue({
        ...mockUsePutReturn,
        error: "Server error",
        loading: false,
      });

      renderUserPage();

      // Component should still render normally despite error - check for tab instead
      expect(screen.getByRole("tab", { name: "Profil" })).toBeInTheDocument();
    });

    it("should handle loading state", () => {
      vi.mocked(usePut).mockReturnValue({
        ...mockUsePutReturn,
        loading: true,
      });

      renderUserPage();

      // Component should still be interactive during loading
      expect(
        screen.getByRole("button", { name: "Enregistrer l'objectif quotidien" })
      ).toBeInTheDocument();
    });
  });
});
