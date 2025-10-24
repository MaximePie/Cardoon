import { useCallback, useContext, useState } from "react";
import { SnackbarContext } from "../../../../context/SnackbarContext";
import { useUserCardsManager } from "../../../../hooks/useUserCards";

/**
 * Hook personnalisé pour gérer la logique des cartes utilisateur
 * Centralise la gestion de la sélection, suppression et états des cartes
 */
export const useCardsManagement = (userId: string) => {
  const { openSnackbarWithMessage } = useContext(SnackbarContext);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  // TanStack Query pour la gestion optimiste des cartes
  const cardsQuery = useUserCardsManager(userId, {
    onDeleteSuccess: () => {
      openSnackbarWithMessage("Carte supprimée avec succès !", "success");
    },
    onDeleteError: (error) => {
      openSnackbarWithMessage(
        `Erreur lors de la suppression: ${error.message}`,
        "error"
      );
    },
  });

  // Gestion de la sélection des cartes
  const toggleCardSelection = useCallback((cardId: string) => {
    setSelectedCards((prevSelected) =>
      prevSelected.includes(cardId)
        ? prevSelected.filter((id) => id !== cardId)
        : [...prevSelected, cardId]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCards([]);
  }, []);

  // Suppression d'une carte avec confirmation
  const handleDeleteCard = useCallback(
    (cardId: string, cardQuestion: string) => {
      const confirmDelete = window.confirm(
        `Êtes-vous sûr de vouloir supprimer cette carte ?\n\nQuestion: "${cardQuestion}"`
      );
      if (!confirmDelete) return;

      cardsQuery.deleteCard(cardId);
    },
    [cardsQuery]
  );

  // Suppression de cartes multiples avec confirmation
  const handleDeleteSelectedCards = useCallback(() => {
    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer les ${selectedCards.length} cartes sélectionnées ?`
    );
    if (!confirmDelete) return;

    selectedCards.forEach((cardId) => {
      cardsQuery.deleteCard(cardId);
    });
    clearSelection();
  }, [selectedCards, cardsQuery, clearSelection]);

  // Édition d'une carte (placeholder pour l'implémentation future)
  const handleEditCard = useCallback((cardId: string) => {
    // TODO: Implement card editing logic
    console.log("Edit card with ID:", cardId);
  }, []);

  return {
    // États
    selectedCards,

    // Actions
    toggleCardSelection,
    clearSelection,
    handleDeleteCard,
    handleDeleteSelectedCards,
    handleEditCard,

    // Données et états des requêtes
    ...cardsQuery,
  };
};
