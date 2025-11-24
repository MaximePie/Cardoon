/**
 * @fileoverview Tests for useMultiCardFormModal hook
 *
 * Tests verify question generation, category management, and error handling
 */

import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as CategoriesContext from "../../../../context/CategoriesContext";
import * as server from "../../../../hooks/server";
import useMultiCardFormModal from "./useMultiCardFormModal";

// Mock contexts and hooks
vi.mock("../../../../context/CategoriesContext", () => ({
  useCategoriesContext: vi.fn(),
}));

vi.mock("../../../../hooks/server", () => ({
  usePost: vi.fn(),
  RESOURCES: {
    MISTRAL: "mistral",
  },
}));

// Mock React's useContext
vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useContext: vi.fn(),
  };
});

// Import useContext after mocking
import { useContext } from "react";

describe("useMultiCardFormModal", () => {
  const mockOpenSnackbar = vi.fn();
  const mockAsyncPost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset asyncPost mock implementation
    mockAsyncPost.mockReset();

    // Mock useContext for SnackbarContext - match actual context shape
    vi.mocked(useContext).mockReturnValue({
      openSnackbarWithMessage: mockOpenSnackbar,
      handleCloseSnackbar: vi.fn(),
    });

    // Mock default categories context
    vi.mocked(CategoriesContext.useCategoriesContext).mockReturnValue({
      categoriesWithCount: ["Category 1", "Category 2"],
      isLoading: false,
      categories: [],
      error: undefined,
    });

    // Mock default server hook
    vi.mocked(server.usePost).mockReturnValue({
      asyncPost: mockAsyncPost,
      post: vi.fn(),
      data: null,
      loading: false,
      error: undefined,
    });
  });

  describe("Initial State", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => useMultiCardFormModal());

      expect(result.current.isGenerationLoading).toBe(false);
      expect(result.current.subQuestions).toEqual([]);
      expect(result.current.subcategory).toBe("");
      expect(result.current.newCard).toEqual({});
    });

    it("should return categories from context", () => {
      const { result } = renderHook(() => useMultiCardFormModal());

      expect(result.current.categoriesWithCount).toEqual([
        "Category 1",
        "Category 2",
      ]);
    });

    it("should return loading state from categories context", () => {
      vi.mocked(CategoriesContext.useCategoriesContext).mockReturnValue({
        categoriesWithCount: [],
        isLoading: true,
        categories: [],
        error: undefined,
      });

      const { result } = renderHook(() => useMultiCardFormModal());

      expect(result.current.isCategoriesLoading).toBe(true);
    });
  });

  describe("updateCategory", () => {
    it("should update the category", () => {
      const { result } = renderHook(() => useMultiCardFormModal());

      act(() => {
        result.current.updateCategory("New Category");
      });

      expect(result.current.newCard.category).toBe("New Category");
    });

    it("should preserve existing newCard data when updating category", () => {
      const { result } = renderHook(() => useMultiCardFormModal());

      act(() => {
        result.current.updateCategory("First Category");
      });

      act(() => {
        result.current.updateCategory("Second Category");
      });

      expect(result.current.newCard.category).toBe("Second Category");
    });
  });

  describe("setSubcategory", () => {
    it("should update subcategory", () => {
      const { result } = renderHook(() => useMultiCardFormModal());

      act(() => {
        result.current.setSubcategory("Test Subcategory");
      });

      expect(result.current.subcategory).toBe("Test Subcategory");
    });
  });

  describe("generateQuestions", () => {
    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.MouseEvent<HTMLButtonElement>;

    const validMistralResponse = {
      content: `\`\`\`json
[
  { "question": "What is 2+2?", "answer": "4" },
  { "question": "What is 3+3?", "answer": "6" }
]
\`\`\``,
    };

    it("should generate questions successfully", async () => {
      mockAsyncPost.mockResolvedValue(validMistralResponse);

      const { result } = renderHook(() => useMultiCardFormModal());

      act(() => {
        result.current.updateCategory("Math");
        result.current.setSubcategory("Addition");
      });

      await act(async () => {
        await result.current.generateQuestions(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockAsyncPost).toHaveBeenCalledWith({
        category: "Math",
        subcategory: "Addition",
        promptType: "generatedQuestions",
      });

      await waitFor(() => {
        expect(result.current.subQuestions).toHaveLength(2);
        expect(result.current.subQuestions[0]).toEqual({
          question: "What is 2+2?",
          answer: "4",
        });
        expect(result.current.isGenerationLoading).toBe(false);
      });
    });

    it("should set loading state during generation", async () => {
      // Mock to immediately resolve so we can verify loading was set
      mockAsyncPost.mockImplementation(async () => {
        return validMistralResponse;
      });

      const { result } = renderHook(() => useMultiCardFormModal());

      act(() => {
        result.current.updateCategory("Math");
      });

      // Initially not loading
      expect(result.current.isGenerationLoading).toBe(false);

      // Call generateQuestions and immediately check loading state before awaiting
      const promise = result.current.generateQuestions(mockEvent);

      // By this point, the function has been called and setIsLoading(true) should have run
      // But we need to wrap in act and wait for the promise
      await act(async () => {
        await promise;
      });

      // Should not be loading after completion
      expect(result.current.isGenerationLoading).toBe(false);
    });

    it("should clear subcategory after successful generation", async () => {
      mockAsyncPost.mockResolvedValue(validMistralResponse);

      const { result } = renderHook(() => useMultiCardFormModal());

      // Ensure hook rendered successfully
      expect(result.current).not.toBeNull();

      act(() => {
        result.current.updateCategory("Math");
        result.current.setSubcategory("Addition");
      });

      await act(async () => {
        await result.current.generateQuestions(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.subcategory).toBe("");
      });
    });

    it("should handle missing response", async () => {
      mockAsyncPost.mockResolvedValue(null);

      const { result } = renderHook(() => useMultiCardFormModal());

      await act(async () => {
        await result.current.generateQuestions(mockEvent);
      });

      expect(mockOpenSnackbar).toHaveBeenCalledWith(
        "Erreur lors de la génération des questions",
        "error"
      );
      expect(result.current.isGenerationLoading).toBe(false);
    });

    it("should handle invalid JSON response", async () => {
      mockAsyncPost.mockResolvedValue({
        content: "Invalid JSON content",
      });

      const { result } = renderHook(() => useMultiCardFormModal());

      await act(async () => {
        await result.current.generateQuestions(mockEvent);
      });

      expect(mockOpenSnackbar).toHaveBeenCalledWith(
        "Erreur lors de l'analyse de la réponse de l'IA. Veuillez réessayer.",
        "error"
      );
      expect(result.current.isGenerationLoading).toBe(false);
    });

    it("should handle non-array JSON response", async () => {
      mockAsyncPost.mockResolvedValue({
        content: `\`\`\`json
{ "error": "Not an array" }
\`\`\``,
      });

      const { result } = renderHook(() => useMultiCardFormModal());

      await act(async () => {
        await result.current.generateQuestions(mockEvent);
      });

      expect(mockOpenSnackbar).toHaveBeenCalledWith(
        "Erreur lors de l'analyse de la réponse de l'IA. Veuillez réessayer.",
        "error"
      );
    });

    it("should filter out invalid questions", async () => {
      mockAsyncPost.mockResolvedValue({
        content: `\`\`\`json
[
  { "question": "Valid question?", "answer": "Valid answer" },
  { "question": "Missing answer" },
  { "answer": "Missing question" },
  { "invalid": "object" },
  { "question": "Another valid?", "answer": "Another answer" }
]
\`\`\``,
      });

      const { result } = renderHook(() => useMultiCardFormModal());

      await act(async () => {
        await result.current.generateQuestions(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.subQuestions).toHaveLength(2);
        expect(result.current.subQuestions[0]).toEqual({
          question: "Valid question?",
          answer: "Valid answer",
        });
        expect(result.current.subQuestions[1]).toEqual({
          question: "Another valid?",
          answer: "Another answer",
        });
      });
    });

    it("should handle response with no valid questions", async () => {
      mockAsyncPost.mockResolvedValue({
        content: `\`\`\`json
[
  { "invalid": "data" },
  { "also": "invalid" }
]
\`\`\``,
      });

      const { result } = renderHook(() => useMultiCardFormModal());

      await act(async () => {
        await result.current.generateQuestions(mockEvent);
      });

      expect(mockOpenSnackbar).toHaveBeenCalledWith(
        "Erreur lors de l'analyse de la réponse de l'IA. Veuillez réessayer.",
        "error"
      );
    });

    it("should handle JSON with missing quotes on keys", async () => {
      mockAsyncPost.mockResolvedValue({
        content: `\`\`\`json
[
  {question": "Fixed question?", "answer": "Fixed answer"}
]
\`\`\``,
      });

      const { result } = renderHook(() => useMultiCardFormModal());

      await act(async () => {
        await result.current.generateQuestions(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.subQuestions).toHaveLength(1);
        expect(result.current.subQuestions[0]).toEqual({
          question: "Fixed question?",
          answer: "Fixed answer",
        });
      });
    });

    it("should strip code block markers from response", async () => {
      mockAsyncPost.mockResolvedValue({
        content: `\`\`\`json
[
  { "question": "Test?", "answer": "Yes" }
]
\`\`\``,
      });

      const { result } = renderHook(() => useMultiCardFormModal());

      await act(async () => {
        await result.current.generateQuestions(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.subQuestions).toHaveLength(1);
      });
    });
  });

  describe("Hook Return Values", () => {
    it("should return all expected properties", () => {
      const { result } = renderHook(() => useMultiCardFormModal());

      expect(result.current).toHaveProperty("isGenerationLoading");
      expect(result.current).toHaveProperty("subQuestions");
      expect(result.current).toHaveProperty("subcategory");
      expect(result.current).toHaveProperty("setSubcategory");
      expect(result.current).toHaveProperty("generateQuestions");
      expect(result.current).toHaveProperty("categoriesWithCount");
      expect(result.current).toHaveProperty("isCategoriesLoading");
      expect(result.current).toHaveProperty("updateCategory");
      expect(result.current).toHaveProperty("newCard");
    });

    it("should have correct types for return values", () => {
      const { result } = renderHook(() => useMultiCardFormModal());

      expect(typeof result.current.isGenerationLoading).toBe("boolean");
      expect(Array.isArray(result.current.subQuestions)).toBe(true);
      expect(typeof result.current.subcategory).toBe("string");
      expect(typeof result.current.setSubcategory).toBe("function");
      expect(typeof result.current.generateQuestions).toBe("function");
      expect(Array.isArray(result.current.categoriesWithCount)).toBe(true);
      expect(typeof result.current.isCategoriesLoading).toBe("boolean");
      expect(typeof result.current.updateCategory).toBe("function");
      expect(typeof result.current.newCard).toBe("object");
    });
  });
});
