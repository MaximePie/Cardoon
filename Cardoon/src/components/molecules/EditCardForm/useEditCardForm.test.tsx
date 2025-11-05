import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CategoriesContext } from "../../../context/CategoriesContext";
import { SnackbarContext } from "../../../context/SnackbarContext";
import type { PopulatedUserCard } from "../../../types/common";
import useEditCardForm from "./useEditCardForm";

// Mock server hooks
const mockPut = vi.fn();
const mockDeleteResource = vi.fn();
const mockInvertCardPost = vi.fn();

vi.mock("../../../hooks/server", () => ({
  usePut: () => ({
    put: mockPut,
    error: null,
  }),
  useDelete: () => ({
    deleteResource: mockDeleteResource,
  }),
  usePost: () => ({
    post: mockInvertCardPost,
    data: null,
    loading: false,
  }),
  RESOURCES: {
    CARDS: "cards",
  },
  ACTIONS: {
    INVERT_CARD: "cards/invert",
  },
}));

// Mock window.confirm
global.confirm = vi.fn(() => true);

// Mock card data
const mockCard: PopulatedUserCard = {
  _id: "user-card-id",
  card: {
    _id: "card-id",
    question: "What is React?",
    answer: "A JavaScript library",
    imageLink: "https://example.com/image.jpg",
    category: "Technology",
    expectedAnswers: ["Library", "Framework"],
    interval: 1,
    createdAt: "2023-01-01",
    ownedBy: "user-id",
    isInverted: false,
    hasInvertedChild: false,
  },
  interval: 1,
  lastReviewed: "2023-01-01",
  nextReview: "2023-01-02",
};

// Mock context providers
const mockSnackbarContext = {
  openSnackbarWithMessage: vi.fn(),
  handleCloseSnackbar: vi.fn(),
};

const mockCategoriesContext = {
  categories: [
    { category: "Technology", count: 10 },
    { category: "Science", count: 5 },
  ],
  categoriesWithCount: ["Technology (10)", "Science (5)"],
  error: null,
  isLoading: false,
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SnackbarContext.Provider value={mockSnackbarContext}>
    <CategoriesContext.Provider value={mockCategoriesContext}>
      {children}
    </CategoriesContext.Provider>
  </SnackbarContext.Provider>
);

describe("useEditCardForm", () => {
  const mockProps = {
    isOpen: true,
    close: vi.fn(),
    editedCard: mockCard,
    afterDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Hook initialization", () => {
    it("should initialize with correct form values from editedCard", () => {
      const { result } = renderHook(() => useEditCardForm(mockProps), {
        wrapper: TestWrapper,
      });

      expect(result.current.formValues.question).toBe("What is React?");
      expect(result.current.formValues.answer).toBe("A JavaScript library");
      expect(result.current.formValues.imageLink).toBe(
        "https://example.com/image.jpg"
      );
      expect(result.current.formValues.category).toBe("Technology");
      expect(result.current.formValues.expectedAnswers).toEqual([
        "Library",
        "Framework",
        "",
      ]);
    });

    it("should initialize with correct default state", () => {
      const { result } = renderHook(() => useEditCardForm(mockProps), {
        wrapper: TestWrapper,
      });

      expect(result.current.activeTab).toBe("question");
      expect(result.current.invertedCard).toBe(null);
      expect(result.current.invertLoading).toBe(false);
      expect(result.current.categoriesWithCount).toEqual([
        "Technology (10)",
        "Science (5)",
      ]);
    });

    it("should provide all expected functions", () => {
      const { result } = renderHook(() => useEditCardForm(mockProps), {
        wrapper: TestWrapper,
      });

      expect(typeof result.current.updateField).toBe("function");
      expect(typeof result.current.handleClose).toBe("function");
      expect(typeof result.current.onCategoryChange).toBe("function");
      expect(typeof result.current.handleDeleteClick).toBe("function");
      expect(typeof result.current.submit).toBe("function");
      expect(typeof result.current.invertCard).toBe("function");
      expect(typeof result.current.setActiveTab).toBe("function");
    });
  });

  describe("Form field updates", () => {
    it("should update question field via updateField", () => {
      const { result } = renderHook(() => useEditCardForm(mockProps), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.updateField("question", "New question");
      });

      expect(result.current.formValues.question).toBe("New question");
    });

    it("should update answer field via updateField", () => {
      const { result } = renderHook(() => useEditCardForm(mockProps), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.updateField("answer", "New answer");
      });

      expect(result.current.formValues.answer).toBe("New answer");
    });

    it("should update expectedAnswers array via updateField", () => {
      const { result } = renderHook(() => useEditCardForm(mockProps), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.updateField("expectedAnswers", [
          "New",
          "Expected",
          "Answers",
        ]);
      });

      expect(result.current.formValues.expectedAnswers).toEqual([
        "New",
        "Expected",
        "Answers",
      ]);
    });

    it("should update category via onCategoryChange", () => {
      const { result } = renderHook(() => useEditCardForm(mockProps), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.onCategoryChange("Science");
      });

      expect(result.current.formValues.category).toBe("Science");
    });
  });

  describe("Tab management", () => {
    it("should change active tab", () => {
      const { result } = renderHook(() => useEditCardForm(mockProps), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.setActiveTab("subquestions");
      });

      expect(result.current.activeTab).toBe("subquestions");
    });

    it("should handle close with tab reset", () => {
      const { result } = renderHook(() => useEditCardForm(mockProps), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.setActiveTab("subquestions");
      });

      act(() => {
        result.current.handleClose();
      });

      expect(result.current.activeTab).toBe("question");
      expect(mockProps.close).toHaveBeenCalled();
    });
  });

  describe("Form submission", () => {
    it("should validate required category before submission", async () => {
      const { result } = renderHook(() => useEditCardForm(mockProps), {
        wrapper: TestWrapper,
      });

      // Clear category to trigger validation
      act(() => {
        result.current.updateField("category", "");
      });

      await act(async () => {
        await result.current.submit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(result.current.errors.category).toBeDefined();
      expect(result.current.errors.category?.message).toBe(
        "Veuillez sélectionner une catégorie"
      );
      expect(mockPut).not.toHaveBeenCalled();
    });

    it("should submit form data with all fields", async () => {
      const { result } = renderHook(() => useEditCardForm(mockProps), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.submit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(mockPut).toHaveBeenCalledWith("card-id", expect.any(FormData));
    });

    it("should handle successful submission", async () => {
      mockPut.mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useEditCardForm(mockProps), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.submit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      await waitFor(() => {
        expect(
          mockSnackbarContext.openSnackbarWithMessage
        ).toHaveBeenCalledWith("La carte a été mise à jour");
        expect(mockProps.close).toHaveBeenCalled();
      });
    });
  });

  describe("Card deletion", () => {
    it("should confirm before deletion", async () => {
      const { result } = renderHook(() => useEditCardForm(mockProps), {
        wrapper: TestWrapper,
      });

      const mockEvent = {
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent<Element, MouseEvent>;

      await act(async () => {
        await result.current.handleDeleteClick(mockEvent);
      });

      expect(global.confirm).toHaveBeenCalledWith(
        expect.stringContaining(
          "Êtes-vous sûr de vouloir supprimer cette carte ?"
        )
      );
      expect(mockDeleteResource).toHaveBeenCalledWith("card-id");
      expect(mockProps.close).toHaveBeenCalled();
      expect(mockProps.afterDelete).toHaveBeenCalled();
    });

    it("should not delete if confirmation is cancelled", async () => {
      global.confirm = vi.fn(() => false);

      const { result } = renderHook(() => useEditCardForm(mockProps), {
        wrapper: TestWrapper,
      });

      const mockEvent = {
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent<Element, MouseEvent>;

      await act(async () => {
        await result.current.handleDeleteClick(mockEvent);
      });

      expect(mockDeleteResource).not.toHaveBeenCalled();
      expect(mockProps.close).not.toHaveBeenCalled();
      expect(mockProps.afterDelete).not.toHaveBeenCalled();
    });
  });

  describe("Card inversion", () => {
    it("should call invertCard API", async () => {
      const { result } = renderHook(() => useEditCardForm(mockProps), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.invertCard();
      });

      expect(mockInvertCardPost).toHaveBeenCalledWith({ cardId: "card-id" });
    });

    it("should not invert if card is already inverted", async () => {
      const invertedCardProps = {
        ...mockProps,
        editedCard: {
          ...mockCard,
          card: { ...mockCard.card, isInverted: true },
        },
      };

      const { result } = renderHook(() => useEditCardForm(invertedCardProps), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.invertCard();
      });

      expect(mockInvertCardPost).not.toHaveBeenCalled();
    });

    it("should not invert if card has inverted child", async () => {
      const cardWithInvertedChildProps = {
        ...mockProps,
        editedCard: {
          ...mockCard,
          card: { ...mockCard.card, hasInvertedChild: true },
        },
      };

      const { result } = renderHook(
        () => useEditCardForm(cardWithInvertedChildProps),
        {
          wrapper: TestWrapper,
        }
      );

      await act(async () => {
        await result.current.invertCard();
      });

      expect(mockInvertCardPost).not.toHaveBeenCalled();
    });
  });

  describe("Form reset on modal open", () => {
    it("should reset form values when modal opens", () => {
      const { result, rerender } = renderHook(
        (props) => useEditCardForm(props),
        {
          wrapper: TestWrapper,
          initialProps: { ...mockProps, isOpen: false },
        }
      );

      // Update a field
      act(() => {
        result.current.updateField("question", "Modified question");
      });

      // Open modal (should reset form)
      rerender({ ...mockProps, isOpen: true });

      expect(result.current.formValues.question).toBe("What is React?");
    });
  });
});
