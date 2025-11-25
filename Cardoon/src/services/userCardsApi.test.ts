/**
 * @fileoverview Tests for userCardsApi
 *
 * Tests verify API calls, error handling, and data transformations
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock environment variable BEFORE any imports
vi.stubEnv("VITE_API_URL", "http://localhost:3000");

import axios from "axios";
import {
  deleteUserCard,
  editUserCard,
  getReviewUserCards,
  getUserCards,
  getUserStats,
  invertCard,
  updateCardInterval,
} from "./userCardsApi";

// Mock axios module
vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    isAxiosError: vi.fn(),
  },
}));

// Mock Cookies
vi.mock("js-cookie", () => ({
  default: {
    get: vi.fn(() => "mock-token"),
  },
}));

// Mock environment
vi.mock("../utils", () => ({
  extractErrorMessage: vi.fn((error: unknown) => {
    if (error instanceof Error) return error.message;
    return "Unknown error";
  }),
}));

interface MockedAxios {
  get: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  isAxiosError: ReturnType<typeof vi.fn>;
}

const mockedAxios = axios as unknown as MockedAxios;

interface ErrorWithStatus extends Error {
  status?: number;
  response?: { status?: number };
}

describe("userCardsApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserCards", () => {
    it("should fetch and sort user cards", async () => {
      const mockCards = [
        { _id: "1", card: { parentId: null } },
        { _id: "2", card: { parentId: "parent1" } },
        { _id: "3", card: { parentId: null } },
      ];

      mockedAxios.get.mockResolvedValue({
        data: { userCards: mockCards },
      });

      const result = await getUserCards();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:3000/api/userCards/all",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        })
      );

      // Cards with parentId should be first
      expect(result[0]._id).toBe("2");
      expect(result.length).toBe(3);
    });

    it("should throw error if response is not an array", async () => {
      mockedAxios.get.mockResolvedValue({
        data: { userCards: "not an array" },
      });

      await expect(getUserCards()).rejects.toThrow(
        "Format de réponse inattendu du serveur"
      );
    });

    it("should handle network errors", async () => {
      mockedAxios.get.mockRejectedValue(new Error("Network error"));

      await expect(getUserCards()).rejects.toThrow(
        "Impossible de récupérer les cartes"
      );
    });
  });

  describe("getReviewUserCards", () => {
    it("should fetch review cards", async () => {
      const mockCards = [
        { _id: "1", nextReviewDate: new Date() },
        { _id: "2", nextReviewDate: new Date() },
      ];

      mockedAxios.get.mockResolvedValue({
        data: { cards: mockCards },
      });

      const result = await getReviewUserCards();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:3000/api/userCards",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        })
      );

      expect(result).toEqual(mockCards);
    });

    it("should throw error if response is not an array", async () => {
      mockedAxios.get.mockResolvedValue({
        data: { cards: null },
      });

      await expect(getReviewUserCards()).rejects.toThrow(
        "Format de réponse inattendu du serveur"
      );
    });
  });

  describe("deleteUserCard", () => {
    it("should delete a card successfully", async () => {
      mockedAxios.delete.mockResolvedValue({ data: {} });

      await deleteUserCard("test-card-id");

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        "http://localhost:3000/api/userCards/test-card-id",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        })
      );
    });

    it("should throw error for invalid cardId", async () => {
      await expect(deleteUserCard("")).rejects.toThrow("ID de carte invalide");
    });

    it("should preserve 404 status in errors", async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 404 },
        message: "Request failed with status code 404",
      };

      mockedAxios.delete.mockRejectedValue(axiosError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      try {
        await deleteUserCard("test-card-id");
        expect.fail("Should have thrown an error");
      } catch (error) {
        const errorWithStatus = error as ErrorWithStatus;
        expect(errorWithStatus.status).toBe(404);
        expect(errorWithStatus.message).toContain("Carte introuvable");
      }
    });

    it("should preserve 403 status in errors", async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 403 },
        message: "Forbidden",
      };

      mockedAxios.delete.mockRejectedValue(axiosError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      try {
        await deleteUserCard("test-card-id");
        expect.fail("Should have thrown an error");
      } catch (error) {
        const errorWithStatus = error as ErrorWithStatus;
        expect(errorWithStatus.status).toBe(403);
        expect(errorWithStatus.message).toContain("pas autorisé");
      }
    });

    it("should preserve 401 status in errors", async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 401 },
        message: "Unauthorized",
      };

      mockedAxios.delete.mockRejectedValue(axiosError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      try {
        await deleteUserCard("test-card-id");
        expect.fail("Should have thrown an error");
      } catch (error) {
        const errorWithStatus = error as ErrorWithStatus;
        expect(errorWithStatus.status).toBe(401);
        expect(errorWithStatus.message).toContain("Session expirée");
      }
    });
  });

  describe("updateCardInterval", () => {
    it("should update card interval successfully", async () => {
      const mockCard = { _id: "test-id", interval: 7 };
      mockedAxios.put.mockResolvedValue({ data: mockCard });

      const result = await updateCardInterval("test-id", 7);

      expect(mockedAxios.put).toHaveBeenCalledWith(
        "http://localhost:3000/api/userCards/updateInterval/test-id",
        { interval: 7 },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        })
      );

      expect(result).toEqual(mockCard);
    });

    it("should throw error for invalid cardId", async () => {
      await expect(updateCardInterval("", 7)).rejects.toThrow(
        "ID de carte invalide"
      );
    });

    it("should throw error for invalid interval", async () => {
      await expect(updateCardInterval("test-id", -1)).rejects.toThrow(
        "Intervalle invalide"
      );
    });

    it("should throw error for non-integer interval", async () => {
      await expect(updateCardInterval("test-id", 3.5)).rejects.toThrow(
        "Intervalle invalide"
      );
    });

    it("should throw error if no data returned", async () => {
      mockedAxios.put.mockResolvedValue({ data: null });

      await expect(updateCardInterval("test-id", 7)).rejects.toThrow(
        "Aucune donnée retournée par le serveur"
      );
    });
  });

  describe("invertCard", () => {
    it("should invert a card successfully", async () => {
      const mockCard = { _id: "test-id", question: "Q", answer: "A" };
      mockedAxios.post.mockResolvedValue({ data: mockCard });

      const result = await invertCard("test-id");

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:3000/api/cards/invert",
        { cardId: "test-id" },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        })
      );

      expect(result).toEqual(mockCard);
    });

    it("should throw error for invalid cardId", async () => {
      await expect(invertCard("")).rejects.toThrow("ID de carte invalide");
    });

    it("should throw error if no data returned", async () => {
      mockedAxios.post.mockResolvedValue({ data: null });

      await expect(invertCard("test-id")).rejects.toThrow(
        "Aucune donnée retournée par le serveur"
      );
    });
  });

  describe("editUserCard", () => {
    it("should edit a card with text fields", async () => {
      const mockCard = { _id: "test-id", question: "New Q" };
      mockedAxios.put.mockResolvedValue({ data: mockCard });

      const result = await editUserCard("test-id", {
        question: "New Q",
        answer: "New A",
      });

      expect(mockedAxios.put).toHaveBeenCalledWith(
        "http://localhost:3000/api/cards/test-id",
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        })
      );

      expect(result).toEqual(mockCard);
    });

    it("should handle image file upload", async () => {
      const mockCard = { _id: "test-id" };
      const mockFile = new File(["content"], "test.jpg", {
        type: "image/jpeg",
      });

      mockedAxios.put.mockResolvedValue({ data: mockCard });

      await editUserCard("test-id", { image: mockFile });

      expect(mockedAxios.put).toHaveBeenCalled();
      const formData = mockedAxios.put.mock.calls[0][1] as FormData;
      expect(formData.get("image")).toBe(mockFile);
    });

    it("should throw error for invalid cardId", async () => {
      await expect(editUserCard("", { question: "Q" })).rejects.toThrow(
        "ID de carte invalide"
      );
    });

    it("should throw error if no data returned", async () => {
      mockedAxios.put.mockResolvedValue({ data: null });

      await expect(editUserCard("test-id", { question: "Q" })).rejects.toThrow(
        "Aucune donnée retournée par le serveur"
      );
    });
  });

  describe("getUserStats", () => {
    it("should fetch user stats successfully", async () => {
      const mockStats = {
        totalCards: 100,
        reviewedToday: 10,
        streak: 5,
        nextReviewCount: 20,
      };

      mockedAxios.get.mockResolvedValue({ data: mockStats });

      const result = await getUserStats("user-123");

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:3000/api/users/user-123/stats",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        })
      );

      expect(result).toEqual(mockStats);
    });

    it("should handle errors", async () => {
      mockedAxios.get.mockRejectedValue(new Error("Stats error"));

      await expect(getUserStats("user-123")).rejects.toThrow(
        "Impossible de récupérer les statistiques"
      );
    });
  });
});
