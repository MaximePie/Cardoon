/**
 * @fileoverview Configuration centrale de TanStack Query pour Cardoon
 *
 * Ce fichier configure le QueryClient avec des paramètres optimisés pour :
 * - Cache management intelligent
 * - Retry policies adaptées
 * - Gestion d'erreur globale
 * - Performance optimisée
 *
 * @version 1.0.0
 * @author Cardoon Team
 */

import { QueryClient } from "@tanstack/react-query";

/**
 * Extracts HTTP status code from error objects
 *
 * @param err - The error object to extract status from
 * @returns The HTTP status code if available, undefined otherwise
 */
export const getErrorStatus = (err: unknown): number | undefined => {
  if (typeof err === "object" && err !== null) {
    const maybe = err as {
      response?: { status?: unknown };
      status?: unknown;
    };
    if (typeof maybe.response?.status === "number")
      return maybe.response.status;
    if (typeof maybe.status === "number") return maybe.status;
  }
  return undefined;
};

/**
 * Extracts response headers from error objects
 *
 * @param err - The error object to extract headers from
 * @returns The response headers if available, undefined otherwise
 */
export const getErrorHeaders = (
  err: unknown
): Record<string, string> | undefined => {
  if (typeof err === "object" && err !== null) {
    const maybe = err as {
      response?: { headers?: Record<string, string> };
    };
    return maybe.response?.headers;
  }
  return undefined;
};

/**
 * Determines if a 403 error should be retried based on response headers
 *
 * @param headers - Response headers from the error
 * @returns number of seconds to wait before retry, or null if no retry
 */
export const shouldRetryForbidden = (
  headers?: Record<string, string>
): number | null => {
  if (!headers) return null;

  // Check for Retry-After header (rate limiting)
  const retryAfter = headers["retry-after"] || headers["Retry-After"];
  if (retryAfter) {
    const seconds = parseInt(retryAfter, 10);
    if (!isNaN(seconds) && seconds > 0 && seconds <= 300) {
      // Max 5 minutes
      return seconds * 1000; // Convert to milliseconds
    }
  }

  // Check for rate limit headers
  const rateLimitRemaining =
    headers["x-ratelimit-remaining"] || headers["X-RateLimit-Remaining"];
  const rateLimitReset =
    headers["x-ratelimit-reset"] || headers["X-RateLimit-Reset"];

  if (rateLimitRemaining === "0" && rateLimitReset) {
    const resetTime = parseInt(rateLimitReset, 10);
    if (!isNaN(resetTime)) {
      const now = Math.floor(Date.now() / 1000);
      const waitTime = Math.max(0, resetTime - now);
      if (waitTime <= 300) {
        // Max 5 minutes
        return waitTime * 1000; // Convert to milliseconds
      }
    }
  }

  return null;
};

/**
 * Determines if a failed query should be retried based on failure count and error type
 *
 * @param failureCount - Number of times the query has already failed
 * @param error - The error that caused the failure
 * @returns true if the query should be retried, false otherwise
 */
export const shouldRetryQuery = (
  failureCount: number,
  error: unknown
): boolean => {
  const status = getErrorStatus(error);
  const headers = getErrorHeaders(error);

  // Pas de retry pour les erreurs 404 (ressource introuvable)
  if (status === 404) {
    return false;
  }

  // 401: Disable automatic retries - handle token refresh at higher level
  // TanStack Query's retry function must be synchronous, but token refresh is async.
  // Returning false prevents immediate retry with stale token.
  // Token refresh should be handled by axios interceptors or error boundaries.
  if (status === 401) {
    return false;
  }

  // 403: Only retry if response includes explicit retry guidance
  if (status === 403) {
    if (failureCount === 0) {
      const retryDelay = shouldRetryForbidden(headers);
      return retryDelay !== null; // Only retry if server indicates it's okay
    }
    return false; // Don't retry 403 more than once
  }

  // Retry jusqu'à 3 fois pour les autres erreurs
  return failureCount < 3;
};

/**
 * Calculates retry delay with exponential backoff
 *
 * Special handling for 403 errors with Retry-After headers
 *
 * @param attemptIndex - The current attempt number (0-based)
 * @param error - The error object (optional, for special case handling)
 * @returns Delay in milliseconds before the next retry attempt
 */
export const getRetryDelay = (
  attemptIndex: number,
  error?: unknown
): number => {
  // Handle 403 errors with explicit retry guidance
  if (error) {
    const status = getErrorStatus(error);
    const headers = getErrorHeaders(error);

    if (status === 403 && headers) {
      const retryDelay = shouldRetryForbidden(headers);
      if (retryDelay !== null) {
        return retryDelay; // Use server-specified delay
      }
    }
  }

  // Default exponential backoff with maximum cap
  return Math.min(1000 * 2 ** attemptIndex, 30000);
};

/**
 * Configuration du QueryClient pour l'application Cardoon
 *
 * @description Configuration centralisée avec des paramètres optimisés pour :
 * - **Performance** : Cache intelligent de 5 minutes
 * - **Fiabilité** : Retry automatique avec backoff exponentiel
 * - **UX** : Refetch en arrière-plan pour des données toujours fraîches
 * - **Réseau** : Gestion optimisée des connexions lentes/instables
 *
 * @example
 * ```tsx
 * import { queryClient } from '@/lib/queryClient';
 *
 * // Utilisation dans l'app
 * <QueryClientProvider client={queryClient}>
 *   <App />
 * </QueryClientProvider>
 * ```
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 📋 Cache Strategy
      staleTime: 5 * 60 * 1000, // 5 minutes - données considérées comme fraîches
      gcTime: 10 * 60 * 1000, // 10 minutes - temps avant garbage collection

      // 🔄 Background Updates
      refetchOnWindowFocus: true, // Refetch quand l'utilisateur revient sur l'onglet
      refetchOnReconnect: true, // Refetch après reconnexion réseau
      refetchOnMount: true, // Refetch au montage du composant

      // 🚫 Error Handling
      retry: shouldRetryQuery,
      retryDelay: getRetryDelay,
    },
    mutations: {
      // 🔄 Mutation Strategy
      retry: false,
      retryDelay: 1000, // 1 seconde de délai

      // 📝 Logging des erreurs de mutation
      onError: (error) => {
        console.error("Mutation failed:", error);
      },
    },
  },
});

/**
 * Clés de requêtes standardisées pour l'application
 *
 * @description Centralisation des query keys pour :
 * - **Consistance** : Éviter les erreurs de frappe
 * - **Invalidation** : Faciliter les invalidations partielles
 * - **Maintenance** : Point unique pour les modifications
 *
 * @example
 * ```tsx
 * // Utilisation des query keys
 * useQuery({
 *   queryKey: QueryKeys.userCards(userId),
 *   queryFn: () => fetchUserCards(userId)
 * });
 *
 * // Invalidation ciblée
 * queryClient.invalidateQueries({
 *   queryKey: QueryKeys.userCards(userId)
 * });
 * ```
 */
export const QueryKeys = {
  // 👤 Requêtes utilisateur
  users: ["users"] as const,
  user: (id: string | number) => ["users", id] as const,

  // 🃏 Requêtes cartes
  cards: ["cards"] as const,
  userCards: (userId: string | number) => ["users", userId, "cards"] as const,
  reviewUserCards: (userId: string | number) =>
    ["users", userId, "reviewCards"] as const, // To review cards
  card: (id: string | number) => ["cards", id] as const,

  // 🎯 Requêtes objectifs quotidiens
  dailyGoals: ["dailyGoals"] as const,
  userDailyGoal: (userId: string | number) =>
    ["users", userId, "dailyGoal"] as const,

  // 🏆 Requêtes progression/stats
  userStats: (userId: string | number) => ["users", userId, "stats"] as const,

  // 🛍️ Requêtes boutique/items
  items: ["items"] as const,
  userItems: (userId: string | number) => ["users", userId, "items"] as const,
} as const;

/**
 * Types helper pour TypeScript
 *
 * @description Types utilitaires pour une meilleure expérience développeur
 */
type _KeyValue<K extends keyof typeof QueryKeys> =
  (typeof QueryKeys)[K] extends (...args: unknown[]) => infer R
    ? R
    : (typeof QueryKeys)[K];
export type QueryKey = _KeyValue<keyof typeof QueryKeys>;
