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
      retry: (failureCount, error: unknown) => {
        const getStatus = (err: unknown): number | undefined => {
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

        const status = getStatus(error);
        // Pas de retry pour les erreurs 404 (ressource introuvable)
        if (status === 404) {
          return false;
        }
        // Retry jusqu'à 3 fois pour les autres erreurs
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Backoff exponentiel
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
