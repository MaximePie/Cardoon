import axios from "axios";
import Cookies from "js-cookie";
import { extractErrorMessage } from "../utils";
import { PopulatedUserCard } from "./userCardsApi";
import { createStatusPreservingError } from "./utils";

// Get API URL from environment, with fallback for test environments
const backUrl = import.meta.env.VITE_API_URL || process.env.VITE_API_URL;

// During tests we allow backUrl to be undefined (tests should mock API calls)
if (!backUrl && process.env.NODE_ENV !== "test") {
  throw new Error("VITE_API_URL is not defined. Configure API base URL.");
}
export const updateUserDailyGoal = async (
  userId: string | number,
  newDailyGoal: number
): Promise<PopulatedUserCard> => {
  try {
    const url = `${backUrl}/api/users/daily-goal`;

    // Configuration des en-têtes pour une requête JSON
    const token = Cookies.get("token");
    const config = {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
    };

    const response = await axios.put(url, { target: newDailyGoal }, config);

    if (!response.data) {
      throw new Error("Aucune donnée retournée par le serveur");
    }

    return response.data;
  } catch (error) {
    const errorMessage = extractErrorMessage(error);
    console.error("Erreur lors de la modification de l'objectif quotidien:", {
      userId,
      newDailyGoal,
      error: errorMessage,
    });

    throw createStatusPreservingError(
      `Impossible de modifier l'objectif quotidien: ${errorMessage}`,
      error
    );
  }
};
