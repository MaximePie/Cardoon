/**
 * Types pour les onglets de la page utilisateur
 */
export type UserPageTab = "profile" | "cards";

/**
 * Configuration des onglets
 */
export const TAB_CONFIG = {
  PROFILE: {
    value: "profile" as const,
    label: "Profil",
  },
  CARDS: {
    value: "cards" as const,
    label: "Cartes",
  },
} as const;

/**
 * Messages de confirmation
 */
export const CONFIRMATION_MESSAGES = {
  DELETE_CARD: (question: string) =>
    `Êtes-vous sûr de vouloir supprimer cette carte ?\n\nQuestion: "${question}"`,
  DELETE_MULTIPLE_CARDS: (count: number) =>
    `Êtes-vous sûr de vouloir supprimer les ${count} cartes sélectionnées ?`,
} as const;

/**
 * Configuration de l'expérience
 */
export const EXP_CONFIG = {
  MAX_EXP_FOR_NEXT_LEVEL: 1000,
} as const;

/**
 * Limites des objectifs quotidiens
 */
export const DAILY_GOAL_LIMITS = {
  MIN: 0,
  MAX: 100,
} as const;
