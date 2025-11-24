/**
 * @fileoverview API service for hero management
 *
 * Handles all hero-related API calls including bonus management
 *
 * @version 1.0.0
 * @author Cardoon Team
 */

import axios from "axios";
import Cookies from "js-cookie";

const backUrl = import.meta.env.VITE_API_URL;

export interface AddHeroBonusParams {
  type: "hp" | "attack" | "regeneration";
  amount: number;
}

import { User } from "../types/common";

export interface AddHeroBonusResponse {
  user: User;
}

/**
 * Add a bonus to the user's hero
 *
 * @param params - Bonus parameters (type and amount)
 * @returns Promise with updated user data
 *
 * @throws Error if request fails or user is not authenticated
 *
 * @example
 * ```typescript
 * const result = await addHeroBonus({ type: "attack", amount: 1 });
 * console.log(result.user.hero.attackDamage); // Updated attack damage
 * ```
 */
export const addHeroBonus = async (
  params: AddHeroBonusParams
): Promise<AddHeroBonusResponse> => {
  const token = Cookies.get("token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await axios.post<AddHeroBonusResponse>(
      `${backUrl}/api/users/addHeroBonus`,
      params,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Failed to add hero bonus";
      throw new Error(message);
    }
    throw error;
  }
};
