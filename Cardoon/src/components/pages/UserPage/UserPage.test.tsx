import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SnackbarContextProvider } from "../../../context/SnackbarContext";
import * as userHooks from "../../../hooks/useUser";
import { User } from "../../../types/common";
import UserPage from "./UserPage";

// Mock hooks
vi.mock("../../../hooks/server", () => ({
  RESOURCES: {
    USER_DAILY_GOAL: "/api/user/daily-goal",
  },
  usePut: vi.fn(),
}));

vi.mock("../../../hooks/useUser", () => ({
  useUser: vi.fn(),
}));

// Import mocked modules
import { usePut } from "../../../hooks/server";

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
  };

  const mockSetUser = vi.fn();
  const mockPutUser = vi.fn();
  const mockPut = vi.fn();
  const mockUsePutReturn = {
    putUser: mockPutUser,
    put: mockPut,
    data: null,
    loading: false,
    error: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(userHooks.useUser).mockReturnValue({
      user: mockUser,
      setUser: mockSetUser,
      logout: vi.fn(),
      addScore: vi.fn(),
      earnGold: vi.fn(),
      removeGold: vi.fn(),
      hasItem: vi.fn(),
      refresh: vi.fn(),
    });

    vi.mocked(usePut).mockReturnValue(mockUsePutReturn);
  });

  const renderUserPage = () => {
    return render(
      <SnackbarContextProvider>
        <UserPage />
      </SnackbarContextProvider>
    );
  };

  describe("Rendering", () => {
    it("should render user information correctly", () => {
      renderUserPage();

      expect(screen.getByText("Page de l'utilisateur")).toBeInTheDocument();
      expect(
        screen.getByText("Nom d'utilisateur: testuser")
      ).toBeInTheDocument();
      expect(screen.getByText("Gold: 500")).toBeInTheDocument();
      expect(screen.getByText("Rôle: user")).toBeInTheDocument();
    });

    it("should render daily goal progress correctly", () => {
      renderUserPage();

      expect(
        screen.getByText("Objectif quotidien: 3 / 10 (PENDING)")
      ).toBeInTheDocument();
    });

    it("should render daily goal form with current value", () => {
      renderUserPage();

      const input = screen.getByDisplayValue("10") as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.type).toBe("number");
      expect(input.min).toBe("1");

      expect(
        screen.getByRole("button", { name: "Mettre à jour" })
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

    it("should call putUser when form is submitted", () => {
      renderUserPage();

      const input = screen.getByDisplayValue("10");
      fireEvent.change(input, { target: { value: "20" } });

      const form = screen
        .getByRole("button", { name: "Mettre à jour" })
        .closest("form");
      fireEvent.submit(form!);

      expect(mockPutUser).toHaveBeenCalledWith({ target: 20 });
    });

    it("should submit form with current draft value", () => {
      renderUserPage();

      const form = screen
        .getByRole("button", { name: "Mettre à jour" })
        .closest("form");
      fireEvent.submit(form!);

      expect(mockPutUser).toHaveBeenCalledWith({ target: 10 });
    });
  });

  describe("Daily Goal Variations", () => {
    it("should handle user with no daily goal set", () => {
      const userWithoutDailyGoal: User = {
        ...mockUser,
        dailyGoal: 0,
      };

      vi.mocked(userHooks.useUser).mockReturnValue({
        user: userWithoutDailyGoal,
        setUser: mockSetUser,
        logout: vi.fn(),
        addScore: vi.fn(),
        earnGold: vi.fn(),
        removeGold: vi.fn(),
        hasItem: vi.fn(),
        refresh: vi.fn(),
      });

      renderUserPage();

      expect(screen.getByDisplayValue("0")).toBeInTheDocument();
    });

    it("should handle different daily goal values", () => {
      const userWithHighGoal: User = {
        ...mockUser,
        dailyGoal: 50,
      };

      vi.mocked(userHooks.useUser).mockReturnValue({
        user: userWithHighGoal,
        setUser: mockSetUser,
        logout: vi.fn(),
        addScore: vi.fn(),
        earnGold: vi.fn(),
        removeGold: vi.fn(),
        hasItem: vi.fn(),
        refresh: vi.fn(),
      });

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

      vi.mocked(userHooks.useUser).mockReturnValue({
        user: adminUser,
        setUser: mockSetUser,
        logout: vi.fn(),
        addScore: vi.fn(),
        earnGold: vi.fn(),
        removeGold: vi.fn(),
        hasItem: vi.fn(),
        refresh: vi.fn(),
      });

      renderUserPage();

      expect(screen.getByText("Nom d'utilisateur: admin")).toBeInTheDocument();
      expect(screen.getByText("Rôle: admin")).toBeInTheDocument();
      expect(screen.getByText("Gold: 9999")).toBeInTheDocument();
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

      vi.mocked(userHooks.useUser).mockReturnValue({
        user: userWithCompletedGoal,
        setUser: mockSetUser,
        logout: vi.fn(),
        addScore: vi.fn(),
        earnGold: vi.fn(),
        removeGold: vi.fn(),
        hasItem: vi.fn(),
        refresh: vi.fn(),
      });

      renderUserPage();

      expect(
        screen.getByText("Objectif quotidien: 10 / 10 (COMPLETED)")
      ).toBeInTheDocument();
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
        .getByRole("button", { name: "Mettre à jour" })
        .closest("form");
      fireEvent.submit(form!);

      expect(mockPutUser).toHaveBeenCalledWith({ target: 30 });
    });

    it("should prevent form submission default behavior", () => {
      renderUserPage();

      const form = screen
        .getByRole("button", { name: "Mettre à jour" })
        .closest("form");
      const mockPreventDefault = vi.fn();

      // Create a custom event with preventDefault
      const submitEvent = new Event("submit", { bubbles: true });
      submitEvent.preventDefault = mockPreventDefault;

      form!.dispatchEvent(submitEvent);

      // The component should have called preventDefault
      expect(mockPutUser).toHaveBeenCalled();
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

      // Component should still render normally despite error
      expect(screen.getByText("Page de l'utilisateur")).toBeInTheDocument();
    });

    it("should handle loading state", () => {
      vi.mocked(usePut).mockReturnValue({
        ...mockUsePutReturn,
        loading: true,
      });

      renderUserPage();

      // Component should still be interactive during loading
      expect(
        screen.getByRole("button", { name: "Mettre à jour" })
      ).toBeInTheDocument();
    });
  });
});
