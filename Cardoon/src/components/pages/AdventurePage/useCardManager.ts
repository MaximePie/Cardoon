import { useCallback, useEffect, useState } from "react";
import { PopulatedUserCard } from "../../../types/common";

const MAX_CARDS_IN_HAND = 5;

/**
 * Hook to manage card hand state and synchronization
 */
export function useCardManager(availableCards: PopulatedUserCard[]) {
  const [cardsInHand, setCardsInHand] = useState<PopulatedUserCard[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const syncCards = useCallback(() => {
    if (availableCards.length === 0) return;

    // Initialize once
    if (!isInitialized) {
      setCardsInHand(availableCards.slice(0, MAX_CARDS_IN_HAND));
      setIsInitialized(true);
      return;
    }

    // Add cards only if we have less than max
    setCardsInHand((currentCards) => {
      if (currentCards.length >= MAX_CARDS_IN_HAND) return currentCards;

      const currentCardIds = new Set(currentCards.map((c) => c._id));
      const cardsNotInHand = availableCards.filter(
        (card) => !currentCardIds.has(card._id)
      );

      if (cardsNotInHand.length > 0) {
        const cardsToAdd = cardsNotInHand.slice(
          0,
          MAX_CARDS_IN_HAND - currentCards.length
        );
        return [...currentCards, ...cardsToAdd];
      }

      return currentCards;
    });
  }, [availableCards, isInitialized]);

  useEffect(() => {
    syncCards();
  }, [syncCards]);

  const removeCardFromHand = useCallback(
    (cardId: string) => {
      setCardsInHand((prev) => {
        const remainingCards = prev.filter((c) => c._id !== cardId);

        const currentCardIds = new Set(remainingCards.map((c) => c._id));
        const cardsNotInHand = availableCards.filter(
          (card) => !currentCardIds.has(card._id) && card._id !== cardId
        );

        if (
          cardsNotInHand.length > 0 &&
          remainingCards.length < MAX_CARDS_IN_HAND
        ) {
          return [...remainingCards, cardsNotInHand[0]];
        }

        return remainingCards;
      });
    },
    [availableCards]
  );

  return {
    cardsInHand,
    removeCardFromHand,
  };
}
