/**
 * @fileoverview Services API pour la gestion des cartes utilisateur
 *
 * Ce module centralise toutes les interactions avec l'API backend pour :
 * - Récupération des cartes utilisateur
 * - Suppression de cartes
 * - Mise à jour des intervalles
 * - Gestion des erreurs réseau
 *
 * @version 1.0.0
 * @author Cardoon Team
 */

import axios from "axios";
import Cookies from "js-cookie";
import { PopulatedUserCard } from "../types/common";
import { extractErrorMessage } from "../utils";

// Get API URL from environment, with fallback for test environments
const backUrl = import.meta.env.VITE_API_URL || process.env.VITE_API_URL;

// During tests we allow backUrl to be undefined (tests should mock API calls)
if (!backUrl && process.env.NODE_ENV !== "test") {
  throw new Error("VITE_API_URL is not defined. Configure API base URL.");
}

/**
 * Creates an error that preserves HTTP status information for retry logic
 * @param message - Error message
 * @param originalError - Original axios error
 * @returns Error with preserved status information
 */
const createStatusPreservingError = (
  message: string,
  originalError: unknown
): Error => {
  const error = new Error(message) as Error & {
    status?: number;
    response?: { status?: number };
  };

  if (axios.isAxiosError(originalError)) {
    const status = originalError.response?.status;
    if (status) {
      error.status = status;
      error.response = { status };
    }
  }

  return error;
};

/**
 * Configuration axios pour les requêtes authentifiées
 */
const createAuthenticatedAxios = () => {
  const token = Cookies.get("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return { headers };
};
/**
 * Récupère toutes les cartes d'un utilisateur
 *
 * @param userId - ID de l'utilisateur (optionnel, utilise l'utilisateur connecté si non fourni)
 * @returns Promise<PopulatedUserCard[]> - Liste des cartes utilisateur
 *
 * @throws {Error} Erreur réseau ou d'authentification
 *
 * @example
 * ```typescript
 * try {
 *   const cards = await getUserCards();
 *   console.log(`${cards.length} cartes récupérées`);
 * } catch (error) {
 *   console.error('Erreur:', error.message);
 * }
 * ```
 */
export const getUserCards = async (
  _userId?: string | number
): Promise<PopulatedUserCard[]> => {
  try {
    // L'endpoint backend utilise l'authentification pour déterminer l'utilisateur
    // Pas besoin de passer l'userId dans l'URL
    const url = `${backUrl}/api/userCards/all`;

    // Debug logging for production troubleshooting
    console.log("🔍 getUserCards Debug:", {
      backUrl,
      fullUrl: url,
      environment: import.meta.env.MODE,
      production: import.meta.env.PROD,
    });

    const response = await axios.get(url, createAuthenticatedAxios());

    // Le backend retourne un objet avec une propriété userCards
    const cards = response.data.userCards;

    if (!Array.isArray(cards)) {
      throw new Error("Format de réponse inattendu du serveur");
    }

    // Tri des cartes : cartes avec parentId en premier
    return cards.sort((a, b) => {
      if (a.card.parentId && !b.card.parentId) return -1;
      if (!a.card.parentId && b.card.parentId) return 1;
      return 0;
    });
  } catch (error) {
    const errorMessage = extractErrorMessage(error);
    console.error(
      "Erreur lors de la récupération des cartes utilisateur:",
      errorMessage
    );
    throw createStatusPreservingError(
      `Impossible de récupérer les cartes: ${errorMessage}`,
      error
    );
  }
};

/**
 * Supprime une carte utilisateur
 *
 * @param cardId - ID de la carte à supprimer
 * @returns Promise<void>
 *
 * @throws {Error} Erreur réseau, d'authentification ou si la carte n'existe pas
 *
 * @example
 * ```typescript
 * try {
 *   await deleteUserCard('card123');
 *   console.log('Carte supprimée avec succès');
 * } catch (error) {
 *   if (error.message.includes('404')) {
 *     console.error('Carte introuvable');
 *   } else {
 *     console.error('Erreur:', error.message);
 *   }
 * }
 * ```
 */
export const deleteUserCard = async (cardId: string): Promise<void> => {
  try {
    if (!cardId || typeof cardId !== "string") {
      throw new Error("ID de carte invalide");
    }

    const url = `${backUrl}/api/userCards/${cardId}`;
    await axios.delete(url, createAuthenticatedAxios());

    // La suppression a réussi (pas de contenu retourné normalement)
  } catch (error) {
    const errorMessage = extractErrorMessage(error);

    // Gestion spécifique des erreurs courantes
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw createStatusPreservingError(
          `Carte introuvable (ID: ${cardId}) - 404`,
          error
        );
      } else if (error.response?.status === 403) {
        throw createStatusPreservingError(
          "Vous n'êtes pas autorisé à supprimer cette carte - 403",
          error
        );
      } else if (error.response?.status === 401) {
        throw createStatusPreservingError(
          "Session expirée, veuillez vous reconnecter - 401",
          error
        );
      }
    }

    console.error("Erreur lors de la suppression de carte:", {
      cardId,
      error: errorMessage,
    });

    throw createStatusPreservingError(
      `Impossible de supprimer la carte: ${errorMessage}`,
      error
    );
  }
};

/**
 * Met à jour l'intervalle d'une carte utilisateur
 *
 * @param cardId - ID de la carte
 * @param newInterval - Nouvel intervalle en jours
 * @returns Promise<PopulatedUserCard> - Carte mise à jour
 *
 * @throws {Error} Erreur réseau ou d'authentification
 *
 * @example
 * ```typescript
 * try {
 *   const updatedCard = await updateCardInterval('card123', 7);
 *   console.log(`Nouvel intervalle: ${updatedCard.interval} jours`);
 * } catch (error) {
 *   console.error('Erreur mise à jour:', error.message);
 * }
 * ```
 */
export const updateCardInterval = async (
  cardId: string,
  newInterval: number
): Promise<PopulatedUserCard> => {
  try {
    if (!cardId || typeof cardId !== "string") {
      throw new Error("ID de carte invalide");
    }

    if (!Number.isInteger(newInterval) || newInterval < 0) {
      throw new Error(
        "Intervalle invalide (doit être un entier strictement positif)"
      );
    }

    const url = `${backUrl}/api/userCards/updateInterval/${cardId}`;
    const payload = { interval: newInterval };

    const response = await axios.put(url, payload, createAuthenticatedAxios());

    if (!response.data) {
      throw new Error("Aucune donnée retournée par le serveur");
    }

    return response.data;
  } catch (error) {
    const errorMessage = extractErrorMessage(error);
    console.error("Erreur lors de la mise à jour de l'intervalle:", {
      cardId,
      newInterval,
      error: errorMessage,
    });

    throw createStatusPreservingError(
      `Impossible de mettre à jour l'intervalle: ${errorMessage}`,
      error
    );
  }
};

/**
 * Récupère les statistiques d'un utilisateur (nombre de cartes, progression, etc.)
 *
 * @param userId - ID de l'utilisateur
 * @returns Promise<UserStats> - Statistiques utilisateur
 *
 * @throws {Error} Erreur réseau ou d'authentification
 */
export interface UserStats {
  totalCards: number;
  reviewedToday: number;
  streak: number;
  nextReviewCount: number;
}

export const getUserStats = async (
  userId: string | number
): Promise<UserStats> => {
  try {
    const url = `${backUrl}/api/users/${userId}/stats`;
    const response = await axios.get(url, createAuthenticatedAxios());

    return response.data;
  } catch (error) {
    const errorMessage = extractErrorMessage(error);
    console.error(
      "Erreur lors de la récupération des statistiques:",
      errorMessage
    );
    throw createStatusPreservingError(
      `Impossible de récupérer les statistiques: ${errorMessage}`,
      error
    );
  }
};

/**
 * Types pour TypeScript
 */
export type { PopulatedUserCard } from "../types/common";
