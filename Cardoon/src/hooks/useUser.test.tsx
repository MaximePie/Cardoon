import { renderHook } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { UserContext, emptyUser } from "../context/UserContext/UserContext";
import { useUser } from "./useUser";

// Mock du UserContext
const mockUserContextValue = {
  user: {
    ...emptyUser,
    _id: "123",
    username: "testuser",
    score: 100,
    gold: 50,
    streak: 5,
  },
  setUser: vi.fn(),
  logout: vi.fn(),
  addScore: vi.fn(),
  earnGold: vi.fn(),
  removeGold: vi.fn(),
  hasItem: vi.fn(() => false),
  refresh: vi.fn(),
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

      expect(result.current.user._id).toBe("123");
      expect(result.current.user.username).toBe("testuser");
      expect(result.current.user.score).toBe(100);
      expect(result.current.user.gold).toBe(50);
      expect(result.current.user.streak).toBe(5);
    });

    it("should provide access to user methods", () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserContextProvider,
      });

      expect(result.current.setUser).toBe(mockUserContextValue.setUser);
      expect(result.current.logout).toBe(mockUserContextValue.logout);
      expect(result.current.addScore).toBe(mockUserContextValue.addScore);
      expect(result.current.earnGold).toBe(mockUserContextValue.earnGold);
      expect(result.current.removeGold).toBe(mockUserContextValue.removeGold);
      expect(result.current.hasItem).toBe(mockUserContextValue.hasItem);
      expect(result.current.refresh).toBe(mockUserContextValue.refresh);
    });
  });

  describe("Different user states", () => {
    it("should handle different user with different properties", () => {
      const differentUserContextValue = {
        ...mockUserContextValue,
        user: {
          ...emptyUser,
          _id: "456",
          username: "anotheruser",
          score: 200,
          gold: 100,
          streak: 10,
          role: "admin" as const,
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

      expect(result.current.user._id).toBe("456");
      expect(result.current.user.username).toBe("anotheruser");
      expect(result.current.user.score).toBe(200);
      expect(result.current.user.role).toBe("admin");
    });

    it("should handle empty user state", () => {
      const emptyUserContextValue = {
        ...mockUserContextValue,
        user: emptyUser,
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

      expect(result.current.user).toEqual(emptyUser);
    });
  });

  describe("Method functionality", () => {
    it("should call addScore method when invoked", () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserContextProvider,
      });

      result.current.addScore(50);

      expect(mockUserContextValue.addScore).toHaveBeenCalledWith(50);
    });

    it("should call earnGold method when invoked", () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserContextProvider,
      });

      result.current.earnGold(25);

      expect(mockUserContextValue.earnGold).toHaveBeenCalledWith(25);
    });

    it("should call removeGold method when invoked", () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserContextProvider,
      });

      result.current.removeGold(10);

      expect(mockUserContextValue.removeGold).toHaveBeenCalledWith(10);
    });

    it("should call hasItem method when invoked", () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserContextProvider,
      });

      const hasItem = result.current.hasItem("item123");

      expect(mockUserContextValue.hasItem).toHaveBeenCalledWith("item123");
      expect(hasItem).toBe(false);
    });

    it("should call logout method when invoked", () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserContextProvider,
      });

      result.current.logout();

      expect(mockUserContextValue.logout).toHaveBeenCalled();
    });

    it("should call refresh method when invoked", () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserContextProvider,
      });

      result.current.refresh();

      expect(mockUserContextValue.refresh).toHaveBeenCalled();
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

      expect(result.current.user.username).toBe("testuser");

      // Simulate context update
      contextValue = {
        ...mockUserContextValue,
        user: {
          ...mockUserContextValue.user,
          username: "updateduser",
        },
      };

      rerender();

      expect(result.current.user.username).toBe("updateduser");
    });
  });

  describe("Edge cases", () => {
    it("should handle undefined context gracefully", () => {
      // Test without provider to see if it handles default context
      const { result } = renderHook(() => useUser());

      // The hook should return the default context value
      expect(result.current.user).toEqual(emptyUser);
      expect(typeof result.current.setUser).toBe("function");
      expect(typeof result.current.logout).toBe("function");
    });

    it("should handle items array correctly", () => {
      const userWithItemsContextValue = {
        ...mockUserContextValue,
        user: {
          ...mockUserContextValue.user,
          items: [
            { base: { _id: "item1" }, quantity: 1 },
            { base: { _id: "item2" }, quantity: 2 },
          ] as unknown as typeof emptyUser.items,
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

      expect(result.current.user.items).toHaveLength(2);
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
