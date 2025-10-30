export interface PopulatedUserCard {
  card: Card;
  interval: number;
  lastReviewed: string;
  nextReview: string;
  _id: string;
}

export interface Card {
  _id: string;
  question: string;
  answer: string;
  interval: number;
  imageLink: string;
  category: string;
  parentId?: string;
  expectedAnswers?: string[];
  createdAt: string;
  ownedBy: string;
  isInverted: boolean;
  hasInvertedChild: boolean;
  originalCardId?: string;
}
export interface UserItem {
  base: Item;
  level: number;
  currentCost: number;
}
export type Item = {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  type: "head" | "weapon" | "armor" | "accessory";
  effect: {
    type: "gold";
    value: number;
  };
};

export interface User {
  streak: number;
  _id: string;
  username: string;
  score: number;
  role: "admin" | "user";
  gold: number;
  items: UserItem[];
  dailyGoal: number;
  currentGoldMultiplier: number;
  currentDailyGoal: {
    target: number;
    progress: number;
    closedAt: string;
    status: "PENDING" | "COMPLETED" | "FAIL";
  };
  image?: string; // URL de l'image de profil
}
