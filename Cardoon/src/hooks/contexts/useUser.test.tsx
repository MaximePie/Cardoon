import { renderHook } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { UserContext, emptyUser } from "../../context/UserContext/UserContext";
import { useUser } from "../../context/UserContext/useUserContext";

// Mock du UserContext avec la nouvelle structure
const mockUserContextValue = {
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
  user: {
    data: {
      ...emptyUser,
      _id: "123",
      username: "testuser",
      score: 100,
      gold: 50,
      streak: 5,
    },
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
  },
  clearAllErrors: vi.fn(),
};

const UserContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <UserContext.Provider value={mockUserContextValue}>
    {children}
  </UserContext.Provider>
);

describe("useUser", () => {
  describe("Basic functionality", () => {
    it("should return the UserContext value", () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserContextProvider,
      });

      expect(result.current).toBe(mockUserContextValue);
    });

    it("should return user data correctly", () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserContextProvider,
      });

      expect(result.current.user.data._id).toBe("123");
      expect(result.current.user.data.username).toBe("testuser");
      expect(result.current.user.data.score).toBe(100);
      expect(result.current.user.data.gold).toBe(50);
      expect(result.current.user.data.streak).toBe(5);
    });

    it("should provide access to user methods", () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserContextProvider,
      });

      expect(result.current.user.setUser).toBe(
        mockUserContextValue.user.setUser
      );
      expect(result.current.user.logout).toBe(mockUserContextValue.user.logout);
      expect(result.current.user.addScore).toBe(
        mockUserContextValue.user.addScore
      );
      expect(result.current.user.earnGold).toBe(
        mockUserContextValue.user.earnGold
      );
      expect(result.current.user.removeGold).toBe(
        mockUserContextValue.user.removeGold
      );
      expect(result.current.user.hasItem).toBe(
        mockUserContextValue.user.hasItem
      );
      expect(result.current.user.refresh).toBe(
        mockUserContextValue.user.refresh
      );
    });

    it("should provide access to user cards", () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserContextProvider,
      });

      expect(result.current.cards.allUserCards.data).toBe(
        mockUserContextValue.cards.allUserCards.data
      );
      expect(result.current.cards.allUserCards.data).toEqual([]);
    });
  });

  describe("Different user states", () => {
    it("should handle different user with different properties", () => {
      const mockUserCards = [
        {
          _id: "card1",
          card: {
            _id: "1",
            question: "Test question 1",
            answer: "Test answer 1",
            interval: 1,
            imageLink: "",
            category: "test",
            createdAt: "2023-01-01",
            ownedBy: "456",
            isInverted: false,
            hasInvertedChild: false,
          },
          interval: 1,
          lastReviewed: "2023-01-01",
          nextReview: "2023-01-02",
        },
        {
          _id: "card2",
          card: {
            _id: "2",
            question: "Test question 2",
            answer: "Test answer 2",
            interval: 2,
            imageLink: "",
            category: "test",
            createdAt: "2023-01-02",
            ownedBy: "456",
            isInverted: false,
            hasInvertedChild: false,
          },
          interval: 2,
          lastReviewed: "2023-01-02",
          nextReview: "2023-01-04",
        },
      ];

      const differentUserContextValue = {
        ...mockUserContextValue,
        user: {
          ...mockUserContextValue.user,
          data: {
            ...emptyUser,
            _id: "456",
            username: "anotheruser",
            score: 200,
            gold: 100,
            streak: 10,
            role: "admin" as const,
          },
        },
        cards: {
          ...mockUserContextValue.cards,
          allUserCards: {
            ...mockUserContextValue.cards.allUserCards,
            data: mockUserCards,
          },
        },
      };

      const DifferentUserProvider: React.FC<{ children: React.ReactNode }> = ({
        children,
      }) => (
        <UserContext.Provider value={differentUserContextValue}>
          {children}
        </UserContext.Provider>
      );

      const { result } = renderHook(() => useUser(), {
        wrapper: DifferentUserProvider,
      });

      expect(result.current.user.data._id).toBe("456");
      expect(result.current.user.data.username).toBe("anotheruser");
      expect(result.current.user.data.score).toBe(200);
      expect(result.current.user.data.role).toBe("admin");
      expect(result.current.cards.allUserCards.data).toHaveLength(2);
      expect(result.current.cards.allUserCards.data[0].card.question).toBe(
        "Test question 1"
      );
    });

    it("should handle empty user state", () => {
      const emptyUserContextValue = {
        ...mockUserContextValue,
        user: {
          ...mockUserContextValue.user,
          data: emptyUser,
        },
      };

      const EmptyUserProvider: React.FC<{ children: React.ReactNode }> = ({
        children,
      }) => (
        <UserContext.Provider value={emptyUserContextValue}>
          {children}
        </UserContext.Provider>
      );

      const { result } = renderHook(() => useUser(), {
        wrapper: EmptyUserProvider,
      });

      expect(result.current.user.data).toEqual(emptyUser);
    });
  });

  describe("Method functionality", () => {
    it("should call addScore method when invoked", () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserContextProvider,
      });

      result.current.user.addScore(50);

      expect(mockUserContextValue.user.addScore).toHaveBeenCalledWith(50);
    });

    it("should call earnGold method when invoked", () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserContextProvider,
      });

      result.current.user.earnGold(25);

      expect(mockUserContextValue.user.earnGold).toHaveBeenCalledWith(25);
    });

    it("should call removeGold method when invoked", () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserContextProvider,
      });

      result.current.user.removeGold(10);

      expect(mockUserContextValue.user.removeGold).toHaveBeenCalledWith(10);
    });

    it("should call hasItem method when invoked", () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserContextProvider,
      });

      const hasItem = result.current.user.hasItem("item123");

      expect(mockUserContextValue.user.hasItem).toHaveBeenCalledWith("item123");
      expect(hasItem).toBe(false);
    });

    it("should call logout method when invoked", () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserContextProvider,
      });

      result.current.user.logout();

      expect(mockUserContextValue.user.logout).toHaveBeenCalled();
    });

    it("should call refresh method when invoked", () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserContextProvider,
      });

      result.current.user.refresh();

      expect(mockUserContextValue.user.refresh).toHaveBeenCalled();
    });
  });

  describe("Context updates", () => {
    it("should react to context changes", () => {
      let contextValue = { ...mockUserContextValue };

      const DynamicProvider: React.FC<{ children: React.ReactNode }> = ({
        children,
      }) => (
        <UserContext.Provider value={contextValue}>
          {children}
        </UserContext.Provider>
      );

      const { result, rerender } = renderHook(() => useUser(), {
        wrapper: DynamicProvider,
      });

      expect(result.current.user.data.username).toBe("testuser");

      // Simulate context update
      contextValue = {
        ...mockUserContextValue,
        user: {
          ...mockUserContextValue.user,
          data: {
            ...mockUserContextValue.user.data,
            username: "updateduser",
          },
        },
      };

      rerender();

      expect(result.current.user.data.username).toBe("updateduser");
    });
  });

  describe("Edge cases", () => {
    it("should handle undefined context gracefully", () => {
      // Test without provider to see if it handles default context
      const { result } = renderHook(() => useUser());

      // The hook should return the default context value
      expect(result.current.user.data).toEqual(emptyUser);
      expect(typeof result.current.user.setUser).toBe("function");
      expect(typeof result.current.user.logout).toBe("function");
    });

    it("should handle items array correctly", () => {
      const userWithItemsContextValue = {
        ...mockUserContextValue,
        user: {
          ...mockUserContextValue.user,
          data: {
            ...mockUserContextValue.user.data,
            items: [
              { base: { _id: "item1" }, quantity: 1 },
              { base: { _id: "item2" }, quantity: 2 },
            ] as unknown as typeof emptyUser.items,
          },
        },
      };

      const UserWithItemsProvider: React.FC<{ children: React.ReactNode }> = ({
        children,
      }) => (
        <UserContext.Provider value={userWithItemsContextValue}>
          {children}
        </UserContext.Provider>
      );

      const { result } = renderHook(() => useUser(), {
        wrapper: UserWithItemsProvider,
      });

      expect(result.current.user.data.items).toHaveLength(2);
    });
  });

  describe("Hook stability", () => {
    it("should be stable across re-renders", () => {
      const { result, rerender } = renderHook(() => useUser(), {
        wrapper: UserContextProvider,
      });

      const firstCall = result.current;

      rerender();

      const secondCall = result.current;

      // The hook should return the same context value
      expect(secondCall).toBe(firstCall);
    });
  });
});
