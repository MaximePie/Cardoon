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
  _id: string;
  username: string;
  score: number;
  role: "admin" | "user";
  gold: number;
  items: UserItem[];
  currentGoldMultiplier: number;
  currentDailyGoal: {
    target: number;
    progress: number;
  };
}
