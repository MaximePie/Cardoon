/**
 * @fileoverview Hook TanStack Query pour la gestion des cartes utilisateur
 *
 * Ce hook centralise toute la logique de gestion des cartes utilisateur :
 * - Fetch des cartes avec cache intelligent
 * - Suppression optimiste avec rollback automatique
 * - Synchronisation avec le serveur
 * - Gestion d'erreur robuste
 *
 * @version 1.0.0
 * @author Cardoon Team
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "../lib/queryClient";
import { deleteUserCard, getUserCards } from "../services/userCardsApi";
import { PopulatedUserCard } from "../types/common";

/**
 * Hook pour récupérer les cartes d'un utilisateur
 *
 * @param userId - ID de l'utilisateur
 * @returns Query object avec les cartes utilisateur
 *
 * @example
 * ```tsx
 * const { data: cards, isLoading, error } = useUserCards(userId);
 *
 * if (isLoading) return <Loader />;
 * if (error) return <ErrorMessage />;
 *
 * return <CardsList cards={cards} />;
 * ```
 */
export const useUserCards = (userId: string | number) => {
  return useQuery({
    queryKey: QueryKeys.userCards(userId),
    queryFn: () => getUserCards(userId),
    enabled: !!userId, // Ne lance la requête que si userId existe
    staleTime: 2 * 60 * 1000, // 2 minutes pour les cartes (données fréquemment modifiées)
  });
};

/**
 * Options pour la suppression de carte avec gestion d'erreur
 */
interface DeleteCardOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook pour supprimer une carte avec mise à jour optimiste
 *
 * @description Ce hook implémente une suppression optimiste qui :
 * 1. 🚀 **Retire immédiatement** la carte de l'UI (optimistic update)
 * 2. 📡 **Envoie la requête** de suppression au serveur en arrière-plan
 * 3. ✅ **Confirme** la suppression si le serveur répond OK
 * 4. 🔄 **Rollback** automatique si le serveur renvoie une erreur
 *
 * @param userId - ID de l'utilisateur propriétaire des cartes
 * @param options - Callbacks optionnels pour success/error
 *
 * @example
 * ```tsx
 * const deleteCardMutation = useDeleteCard(userId, {
 *   onSuccess: () => showSnackbar('Carte supprimée avec succès', 'success'),
 *   onError: () => showSnackbar('Erreur lors de la suppression', 'error')
 * });
 *
 * const handleDelete = (cardId: string) => {
 *   deleteCardMutation.mutate(cardId);
 * };
 *
 * return (
 *   <Button
 *     onClick={() => handleDelete(card.id)}
 *     loading={deleteCardMutation.isPending}
 *   >
 *     Supprimer
 *   </Button>
 * );
 * ```
 */
export const useDeleteCard = (
  userId: string | number,
  options: DeleteCardOptions = {}
) => {
  const queryClient = useQueryClient();
  const userCardsQueryKey = QueryKeys.userCards(userId);

  return useMutation<
    void,
    Error,
    string,
    {
      previousCards?: PopulatedUserCard[];
    }
  >({
    mutationKey: ["userCardDelete", userId],
    retry: false, // Pas de retry automatique pour les suppressions
    mutationFn: (cardId: string) => deleteUserCard(cardId),

    // 🚀 OPTIMISTIC UPDATE - Mise à jour immédiate de l'UI
    onMutate: async (cardId: string) => {
      // Annule toutes les requêtes en cours pour éviter les conflits
      await queryClient.cancelQueries({ queryKey: userCardsQueryKey });

      // Sauvegarde l'état précédent pour le rollback
      const previousCards =
        queryClient.getQueryData<PopulatedUserCard[]>(userCardsQueryKey);

      // Met à jour immédiatement le cache (supprime la carte de l'UI)
      queryClient.setQueryData<PopulatedUserCard[]>(
        userCardsQueryKey,
        (oldCards) => {
          if (!oldCards) return [];
          return oldCards.filter((card) => card._id !== cardId);
        }
      );

      // Retourne le contexte pour le rollback potentiel
      return { previousCards };
    },

    // ✅ SUCCESS - La suppression a réussi côté serveur
    onSuccess: () => {
      // Optionnel : Invalider les requêtes liées pour re-fetch les données fraîches
      // queryClient.invalidateQueries({ queryKey: userCardsQueryKey });

      // Callback de succès personnalisé
      options.onSuccess?.();
    },

    // 🔄 ERROR - Rollback en cas d'erreur serveur
    onError: (error, cardId, context) => {
      // Restaure l'état précédent en cas d'erreur
      if (context?.previousCards) {
        queryClient.setQueryData(userCardsQueryKey, context.previousCards);
      }

      // Log de l'erreur pour le debug
      console.error("Échec de la suppression de carte:", {
        cardId,
        error: error.message,
        userId,
      });

      // Callback d'erreur personnalisé
      options.onError?.(error as Error);
    },

    // 🔚 SETTLED - Toujours exécuté après success/error
    onSettled: () => {
      // Invalide et refetch les données pour s'assurer de la cohérence
      queryClient.invalidateQueries({ queryKey: userCardsQueryKey });
    },
  });
};

/**
 * Hook combiné pour la gestion complète des cartes utilisateur
 *
 * @description Hook de commodité qui combine :
 * - La récupération des cartes (useUserCards)
 * - La suppression optimiste (useDeleteCard)
 * - Les états de loading/error unifiés
 *
 * @param userId - ID de l'utilisateur
 * @param options - Options pour les callbacks
 *
 * @example
 * ```tsx
 * const {
 *   cards,
 *   isLoading,
 *   deleteCard,
 *   isDeletingCard
 * } = useUserCardsManager(userId, {
 *   onDeleteSuccess: () => showSuccess('Carte supprimée'),
 *   onDeleteError: () => showError('Erreur suppression')
 * });
 *
 * return (
 *   <div>
 *     {isLoading ? <Loader /> : (
 *       cards.map(card => (
 *         <CardItem
 *           key={card._id}
 *           card={card}
 *           onDelete={() => deleteCard(card._id)}
 *           isDeleting={isDeletingCard}
 *         />
 *       ))
 *     )}
 *   </div>
 * );
 * ```
 */
export const useUserCardsManager = (
  userId: string | number,
  options: {
    onDeleteSuccess?: () => void;
    onDeleteError?: (error: Error) => void;
  } = {}
) => {
  const cardsQuery = useUserCards(userId);
  const deleteCardMutation = useDeleteCard(userId, {
    onSuccess: options.onDeleteSuccess,
    onError: options.onDeleteError,
  });

  return {
    // 📊 Données
    cards: cardsQuery.data || [],

    // 🔄 États de loading
    isLoading: cardsQuery.isLoading,
    isDeletingCard: deleteCardMutation.isPending,

    // ❌ États d'erreur
    error: cardsQuery.error,
    deleteError: deleteCardMutation.error,

    // 🎯 Actions
    deleteCard: deleteCardMutation.mutate,

    // 🔧 Utilitaires
    refetch: cardsQuery.refetch,
    isStale: cardsQuery.isStale,
  };
};
