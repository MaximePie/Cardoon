import axios from "axios";
import Cookies from "js-cookie";

export interface EnemyBonus {
  type: "hp" | "attack" | "regeneration" | "defense";
  amount: number;
}

export interface EnemySprites {
  idle: string;
  attack: string;
  hurt: string;
  defeated: string;
}

export interface Enemy {
  id: string;
  name: string;
  maxHealth: number;
  attackDamage: number;
  defense: number;
  experience: number;
  bonus: EnemyBonus;
  sprites: EnemySprites;
  spawnWeight: number;
}

export interface Level {
  _id: string;
  name: string;
  order: number;
  description: string;
  backgroundImage: string;
  minHeroLevel: number;
  enemies: Enemy[];
}

export interface AdventureData {
  levels: Level[];
}
const backUrl = import.meta.env.VITE_API_URL;

/**
 * Fetch all adventure data (levels with enemies)
 */
export const getAdventureData = async (): Promise<AdventureData> => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("No token found");
  }
  const response = await axios.get<AdventureData>(`${backUrl}/api/adventure`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
