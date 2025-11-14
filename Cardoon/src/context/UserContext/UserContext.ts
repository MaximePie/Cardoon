import { createContext } from "react";
import { Card, PopulatedUserCard, User } from "../../types/common";

export interface UserContextType {
  cards: {
    reviewUserCards: {
      data: PopulatedUserCard[];
      isLoading: boolean;
      error: Error | null;
      getReviewUserCards: () => Promise<void>;
    };
    allUserCards: {
      data: PopulatedUserCard[];
      isLoading: boolean;
      error: Error | null;
      deleteCard: (cardId: string) => Promise<void>;
      deleteCards: (cardIds: string[]) => Promise<void>;
      isDeletingCard: boolean;
      isEditingCard: boolean;
      cardsError: Error | null;
      editCard: (updatedCard: Partial<Card>) => Promise<void>;
      invertCard: (cardId: string) => Promise<void>;
      isInvertingCard: boolean;
    };
  };
  user: {
    data: User;
    isLoading: boolean;
    error: Error | null;
    hasItem: (itemId: string) => boolean;
    setUser: (user: User) => void;
    logout: () => void;
    login: () => void;
    addScore: (score: number) => void;
    earnGold: (gold: number) => void;
    removeGold: (gold: number) => void;
    refresh: () => void;
    updateImage: (imageFile: File) => Promise<void>;
    updateDailyGoal: (newDailyGoal: number) => Promise<void>;
  };
  clearAllErrors: () => void;
}

export const emptyUser: User = {
  _id: "",
  username: "",
  score: 0,
  dailyGoal: 10,
  gold: 0,
  role: "user",
  items: [],
  currentGoldMultiplier: 1,
  currentDailyGoal: {
    target: 0,
    progress: 0,
    closedAt: "",
    status: "PENDING", // PENDING, COMPLETED, FAILED
  },
  streak: 0,
};

export const UserContext = createContext<UserContextType>({
  cards: {
    reviewUserCards: {
      data: [],
      isLoading: false,
      error: null,
      getReviewUserCards: async () => {},
    },
    allUserCards: {
      data: [],
      isLoading: false,
      error: null,
      deleteCard: async (_cardId: string) => {},
      deleteCards: async (_cardIds: string[]) => {},
      isDeletingCard: false,
      isEditingCard: false,
      cardsError: null,
      editCard: async (_updatedCard: Partial<Card>) => {},
      invertCard: async (_cardId: string) => {},
      isInvertingCard: false,
    },
  },
  user: {
    data: emptyUser,
    isLoading: false,
    error: null,
    hasItem: (_itemId: string) => false,
    setUser: (_user: User) => {},
    logout: () => {},
    login: () => {},
    addScore: (_score: number) => {},
    earnGold: (_gold: number) => {},
    removeGold: (_gold: number) => {},
    refresh: () => {},
    updateImage: async (_imageFile: File) => {},
    updateDailyGoal: async (_newDailyGoal: number) => {},
  },
  clearAllErrors: () => {},
});
