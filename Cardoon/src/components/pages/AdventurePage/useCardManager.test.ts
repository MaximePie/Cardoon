import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { PopulatedUserCard } from "../../../types/common";
import { useCardManager } from "./useCardManager";

describe("useCardManager", () => {
  const createMockCard = (id: string): PopulatedUserCard => ({
    _id: id,
    card: {
      _id: `cardId${id}`,
      question: `Question ${id}`,
      answer: `Answer ${id}`,
      interval: 1,
      imageLink: "",
      category: "category1",
      createdAt: new Date().toISOString(),
      ownedBy: "user123",
      isInverted: false,
      hasInvertedChild: false,
    },
    interval: 1,
    lastReviewed: new Date().toISOString(),
    nextReview: new Date().toISOString(),
  });

  let mockCards: PopulatedUserCard[];

  beforeEach(() => {
    mockCards = Array.from({ length: 10 }, (_, i) =>
      createMockCard(`card${i + 1}`)
    );
  });

  describe("Initialization", () => {
    it("should initialize with first 5 cards", () => {
      const { result } = renderHook(() => useCardManager(mockCards));

      expect(result.current.cardsInHand).toHaveLength(5);
      expect(result.current.cardsInHand[0]._id).toBe("card1");
      expect(result.current.cardsInHand[4]._id).toBe("card5");
    });

    it("should handle empty card list", () => {
      const { result } = renderHook(() => useCardManager([]));

      expect(result.current.cardsInHand).toHaveLength(0);
    });

    it("should handle less than 5 cards", () => {
      const fewCards = mockCards.slice(0, 3);
      const { result } = renderHook(() => useCardManager(fewCards));

      expect(result.current.cardsInHand).toHaveLength(3);
    });
  });

  describe("Card Removal", () => {
    it("should remove card from hand", () => {
      const { result } = renderHook(() => useCardManager(mockCards));

      act(() => {
        result.current.removeCardFromHand("card1");
      });

      expect(result.current.cardsInHand).toHaveLength(5);
      expect(
        result.current.cardsInHand.find((c) => c._id === "card1")
      ).toBeUndefined();
    });

    it("should replace removed card with next available card", () => {
      const { result } = renderHook(() => useCardManager(mockCards));

      act(() => {
        result.current.removeCardFromHand("card1");
      });

      expect(result.current.cardsInHand).toHaveLength(5);
      expect(
        result.current.cardsInHand.find((c) => c._id === "card6")
      ).toBeDefined();
    });

    it("should not replace card if no more cards available", () => {
      const fewCards = mockCards.slice(0, 5);
      const { result } = renderHook(() => useCardManager(fewCards));

      act(() => {
        result.current.removeCardFromHand("card1");
      });

      expect(result.current.cardsInHand).toHaveLength(4);
    });

    it("should handle multiple removals", () => {
      const { result } = renderHook(() => useCardManager(mockCards));

      act(() => {
        result.current.removeCardFromHand("card1");
      });

      act(() => {
        result.current.removeCardFromHand("card2");
      });

      act(() => {
        result.current.removeCardFromHand("card3");
      });

      expect(result.current.cardsInHand).toHaveLength(5);
      // After removing card1, card2, card3, we should have card4, card5, and the replacements
      expect(
        result.current.cardsInHand.find((c) => c._id === "card4")
      ).toBeDefined();
      expect(
        result.current.cardsInHand.find((c) => c._id === "card5")
      ).toBeDefined();
      // At least one replacement card should be present
      const hasReplacementCard = result.current.cardsInHand.some((c) =>
        ["card6", "card7", "card8"].includes(c._id)
      );
      expect(hasReplacementCard).toBe(true);
    });
  });

  describe("Synchronization", () => {
    it("should sync when available cards change", () => {
      const { result, rerender } = renderHook(
        ({ cards }) => useCardManager(cards),
        {
          initialProps: { cards: mockCards.slice(0, 5) },
        }
      );

      expect(result.current.cardsInHand).toHaveLength(5);

      rerender({ cards: mockCards.slice(0, 8) });

      expect(result.current.cardsInHand).toHaveLength(5);
    });

    it("should not add cards if hand is already full", () => {
      const { result, rerender } = renderHook(
        ({ cards }) => useCardManager(cards),
        {
          initialProps: { cards: mockCards.slice(0, 5) },
        }
      );

      expect(result.current.cardsInHand).toHaveLength(5);

      rerender({ cards: mockCards });

      expect(result.current.cardsInHand).toHaveLength(5);
    });

    it("should add cards after removal to maintain 5 cards", () => {
      const { result } = renderHook(() => useCardManager(mockCards));

      act(() => {
        result.current.removeCardFromHand("card1");
        result.current.removeCardFromHand("card2");
      });

      expect(result.current.cardsInHand).toHaveLength(5);
    });
  });

  describe("Edge Cases", () => {
    it("should not duplicate cards in hand", () => {
      const { result } = renderHook(() => useCardManager(mockCards));

      const cardIds = result.current.cardsInHand.map((c) => c._id);
      const uniqueIds = new Set(cardIds);

      expect(cardIds.length).toBe(uniqueIds.size);
    });

    it("should handle removing non-existent card gracefully", () => {
      const { result } = renderHook(() => useCardManager(mockCards));

      act(() => {
        result.current.removeCardFromHand("nonexistent");
      });

      expect(result.current.cardsInHand).toHaveLength(5);
    });

    it("should maintain card order after removal", () => {
      const { result } = renderHook(() => useCardManager(mockCards));
      const initialIds = result.current.cardsInHand.map((c) => c._id);

      act(() => {
        result.current.removeCardFromHand("card3");
      });

      const remainingInitialCards = initialIds.filter((id) => id !== "card3");
      const currentIds = result.current.cardsInHand
        .map((c) => c._id)
        .filter((id) => remainingInitialCards.includes(id));

      expect(currentIds).toEqual(remainingInitialCards);
    });
  });
});
