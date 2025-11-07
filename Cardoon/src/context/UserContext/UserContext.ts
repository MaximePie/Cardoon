import { createContext } from "react";
import { Card, PopulatedUserCard, User } from "../../types/common";

export interface UserContextType {
  user: User;
  userError?: string | undefined;
  allUserCards: PopulatedUserCard[];
  getReviewUserCards: () => Promise<void>;
  reviewUserCards: PopulatedUserCard[];
  isReviewUserCardsLoading: boolean;
  reviewUserCardsError: Error | null;
  setUser: (user: User) => void;
  logout: () => void;
  addScore: (score: number) => void;
  earnGold: (gold: number) => void;
  removeGold: (gold: number) => void;
  hasItem: (itemId: string) => boolean;
  refresh: () => void;
  updateImage: (imageFile: File) => Promise<void>;
  isLoadingCards: boolean;
  deleteCard: (cardId: string) => Promise<void>;
  deleteCards: (cardIds: string[]) => Promise<void>;
  isDeletingCard: boolean;
  isEditingCard: boolean;
  cardsError: Error | null;
  editCard: (updatedCard: Partial<Card>) => Promise<void>;
  invertCard: (cardId: string) => Promise<void>;
  isInvertingCard: boolean;
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
  user: emptyUser,
  reviewUserCards: [],
  isReviewUserCardsLoading: false,
  reviewUserCardsError: null,
  setUser: () => {},
  logout: () => {},
  addScore: () => {},
  clearAllErrors: () => {},
  earnGold: () => {},
  removeGold: () => {},
  hasItem: () => false,
  getReviewUserCards: async () => {},
  refresh: () => {},
  updateImage: async (_imageFile: File) => {},
  allUserCards: [],
  isLoadingCards: false,
  deleteCard: (_cardId: string) => Promise.resolve(),
  deleteCards: (_cardIds: string[]) => Promise.resolve(),
  isDeletingCard: false,
  isEditingCard: false,
  cardsError: null,
  editCard: (_updatedCard: Partial<Card>) => Promise.resolve(),
  invertCard: (_cardId: string) => Promise.resolve(),
  isInvertingCard: false,
});
