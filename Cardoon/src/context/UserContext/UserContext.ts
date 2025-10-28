import { createContext } from "react";
import { PopulatedUserCard, User } from "../../types/common";

export interface UserContextType {
  user: User;
  allUserCards: PopulatedUserCard[];
  getAllUserCards: () => Promise<void>;
  getReviewUserCards: () => Promise<void>;
  reviewUserCards: PopulatedUserCard[];
  setUser: (user: User) => void;
  logout: () => void;
  addScore: (score: number) => void;
  earnGold: (gold: number) => void;
  removeGold: (gold: number) => void;
  hasItem: (itemId: string) => boolean;
  refresh: () => void;
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
  setUser: () => {},
  logout: () => {},
  addScore: () => {},
  earnGold: () => {},
  removeGold: () => {},
  hasItem: () => false,
  getAllUserCards: async () => {},
  getReviewUserCards: async () => {},
  refresh: () => {},
  allUserCards: [],
});
