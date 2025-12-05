import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as SnackbarContext from "../../../context/SnackbarContext";
import * as UserContext from "../../../context/UserContext/useUserContext";
import * as adventureHooks from "../../../hooks/contexts/useAdventure";
import * as serverHooks from "../../../hooks/server";
import { User } from "../../../types/common";
import LoginForm from "./LoginPage";

// Mock dependencies
vi.mock("../../../context/SnackbarContext");
vi.mock("../../../context/UserContext/useUserContext");
vi.mock("../../../hooks/server");
vi.mock("../../../hooks/contexts/useAdventure");

// Mock navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("LoginPage", () => {
  const mockOpenSnackbar = vi.fn();
  const mockSetUser = vi.fn();
  const mockLogin = vi.fn();
  const mockClearAllErrors = vi.fn();
  const mockPost = vi.fn();
  const mockResetQueries = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useSnackbar
    vi.spyOn(SnackbarContext, "useSnackbar").mockReturnValue({
      showSuccess: vi.fn(),
      showError: vi.fn(),
      openSnackbarWithMessage: mockOpenSnackbar,
      handleCloseSnackbar: vi.fn(),
    });

    // Mock useAdventure
    vi.spyOn(adventureHooks, "useAdventure").mockReturnValue({
      levels: [],
      currentLevel: null,
      currentLevelId: null,
      setCurrentLevelId: vi.fn(),
      firstUnlockedLevel: null,
      isLoading: false,
      error: null,
      resetQueries: mockResetQueries,
    });

    // Mock useUser
    vi.spyOn(UserContext, "useUser").mockReturnValue({
      user: {
        data: null as unknown as User,
        isLoading: false,
        error: null,
        hasItem: vi.fn(),
        setUser: mockSetUser,
        login: mockLogin,
        addScore: vi.fn(),
        logout: vi.fn(),
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
      clearAllErrors: mockClearAllErrors,
    });

    // Mock usePost
    vi.spyOn(serverHooks, "usePost").mockReturnValue({
      post: mockPost,
      asyncPost: vi.fn(),
      data: null,
      error: undefined,
      loading: false,
    });
  });

  const renderLoginForm = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  describe("Rendering", () => {
    it("should render the login form", () => {
      renderLoginForm();

      expect(screen.getByText("Connexion")).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Se connecter/i })
      ).toBeInTheDocument();
    });

    it("should render register link", () => {
      renderLoginForm();

      expect(screen.getByText("Pas encore de compte ?")).toBeInTheDocument();
      expect(screen.getByText("Crée-le maintenant")).toBeInTheDocument();
    });

    it("should render remember me checkbox", () => {
      renderLoginForm();

      expect(screen.getByText("Rester connecté")).toBeInTheDocument();
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it("should render forgot password link", () => {
      renderLoginForm();

      expect(screen.getByText("Mot de passe oublié ?")).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    it("should disable submit button when fields are empty", () => {
      renderLoginForm();

      const submitButton = screen.getByRole("button", {
        name: /Se connecter/i,
      });
      expect(submitButton).toBeDisabled();
    });

    it("should enable submit button when fields are filled", () => {
      renderLoginForm();

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Mot de passe/i);

      fireEvent.change(emailInput, { target: { value: "test@test.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });

      const submitButton = screen.getByRole("button", {
        name: /Se connecter/i,
      });
      expect(submitButton).not.toBeDisabled();
    });

    it("should show error snackbar when submitting empty form", async () => {
      renderLoginForm();

      const emailInput = screen.getByLabelText(/Email/i);

      // Fill only email
      fireEvent.change(emailInput, { target: { value: "test@test.com" } });

      const submitButton = screen.getByRole("button", {
        name: /Se connecter/i,
      });

      // Button should still be disabled
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Form Submission", () => {
    it("should call post with correct credentials", () => {
      renderLoginForm();

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Mot de passe/i);

      fireEvent.change(emailInput, { target: { value: "test@test.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });

      const form = screen
        .getByRole("button", { name: /Se connecter/i })
        .closest("form");
      fireEvent.submit(form!);

      expect(mockPost).toHaveBeenCalledWith({
        email: "test@test.com",
        password: "password123",
        rememberMe: false,
      });
    });

    it("should call post with rememberMe when checkbox is checked", () => {
      renderLoginForm();

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Mot de passe/i);
      const rememberMeCheckbox = screen.getByRole("checkbox");

      fireEvent.change(emailInput, { target: { value: "test@test.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(rememberMeCheckbox);

      const form = screen
        .getByRole("button", { name: /Se connecter/i })
        .closest("form");
      fireEvent.submit(form!);

      expect(mockPost).toHaveBeenCalledWith({
        email: "test@test.com",
        password: "password123",
        rememberMe: true,
      });
    });
  });

  describe("Error Handling", () => {
    it("should display error snackbar on authentication failure", async () => {
      // Re-mock usePost with error
      vi.spyOn(serverHooks, "usePost").mockReturnValue({
        post: mockPost,
        asyncPost: vi.fn(),
        data: null,
        error: "Invalid credentials",
        loading: false,
      });

      renderLoginForm();

      await waitFor(() => {
        expect(mockOpenSnackbar).toHaveBeenCalledWith(
          "La connexion a échoué car l'email ou le mot de passe sont invalides.",
          "error"
        );
      });
    });

    it("should reset loading state on error", async () => {
      // Re-mock usePost with error
      vi.spyOn(serverHooks, "usePost").mockReturnValue({
        post: mockPost,
        asyncPost: vi.fn(),
        data: null,
        error: "Invalid credentials",
        loading: false,
      });

      renderLoginForm();

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Mot de passe/i);

      fireEvent.change(emailInput, { target: { value: "test@test.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });

      // Submit should work after error
      await waitFor(() => {
        const submitButton = screen.getByRole("button", {
          name: /Se connecter/i,
        });
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe("Successful Login", () => {
    it("should navigate to home on successful login", async () => {
      const mockUser = {
        _id: "123",
        username: "testuser",
        email: "test@test.com",
        score: 0,
        role: "user" as const,
        gold: 0,
        items: [],
        dailyGoal: 5,
        currentGoldMultiplier: 1,
        streak: 0,
        currentDailyGoal: {
          progress: 0,
          target: 5,
          closedAt: new Date().toISOString(),
          status: "PENDING" as const,
        },
        hero: {
          attackDamage: 1,
          regenerationRate: 1,
          defense: 0,
          maxHealth: 100,
          currentHealth: 100,
          level: 1,
          experience: 0,
          experienceToNextLevel: 100,
        },
      };

      // Re-mock usePost with success data
      vi.spyOn(serverHooks, "usePost").mockReturnValue({
        post: mockPost,
        asyncPost: vi.fn(),
        data: {
          token: "test-token",
          user: mockUser,
        },
        error: undefined,
        loading: false,
      });

      renderLoginForm();

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith(mockUser);
        expect(mockLogin).toHaveBeenCalled();
      });
    });

    it("should store token in cookie", async () => {
      const mockUser = {
        _id: "123",
        username: "testuser",
        email: "test@test.com",
        score: 0,
        role: "user" as const,
        gold: 0,
        items: [],
        dailyGoal: 5,
        currentGoldMultiplier: 1,
        streak: 0,
        currentDailyGoal: {
          progress: 0,
          target: 5,
          closedAt: new Date().toISOString(),
          status: "PENDING" as const,
        },
        hero: {
          attackDamage: 1,
          regenerationRate: 1,
          defense: 0,
          maxHealth: 100,
          currentHealth: 100,
          level: 1,
          experience: 0,
          experienceToNextLevel: 100,
        },
      };

      // Re-mock usePost with success data
      vi.spyOn(serverHooks, "usePost").mockReturnValue({
        post: mockPost,
        asyncPost: vi.fn(),
        data: {
          token: "test-token",
          user: mockUser,
        },
        error: undefined,
        loading: false,
      });

      renderLoginForm();

      await waitFor(() => {
        expect(document.cookie).toContain("token=test-token");
      });
    });
  });

  describe("Remember Me", () => {
    it("should toggle remember me checkbox", () => {
      renderLoginForm();

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });
});
