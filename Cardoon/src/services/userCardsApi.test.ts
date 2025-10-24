/**
 * @fileoverview Tests for userCardsApi error handling
 *
 * Tests verify that HTTP status codes are preserved in errors
 * for proper retry logic integration with QueryClient
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock environment variable BEFORE any imports
vi.stubEnv("VITE_API_URL", "http://localhost:3000");

import axios from "axios";
import { deleteUserCard } from "./userCardsApi";

// Mock axios module
vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
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
  delete: ReturnType<typeof vi.fn>;
  isAxiosError: ReturnType<typeof vi.fn>;
}

const mockedAxios = axios as unknown as MockedAxios;

interface ErrorWithStatus extends Error {
  status?: number;
  response?: { status?: number };
}

describe("userCardsApi Error Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("HTTP Status Code Preservation", () => {
    it("should preserve 404 status in deleteUserCard errors", async () => {
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
        expect(errorWithStatus.response?.status).toBe(404);
      }
    });

    it("should preserve 403 status in deleteUserCard errors", async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 403 },
        message: "Request failed with status code 403",
      };

      mockedAxios.delete.mockRejectedValue(axiosError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      try {
        await deleteUserCard("test-card-id");
        expect.fail("Should have thrown an error");
      } catch (error) {
        const errorWithStatus = error as ErrorWithStatus;
        expect(errorWithStatus.status).toBe(403);
        expect(errorWithStatus.response?.status).toBe(403);
      }
    });

    it("should preserve 401 status in deleteUserCard errors", async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 401 },
        message: "Request failed with status code 401",
      };

      mockedAxios.delete.mockRejectedValue(axiosError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      try {
        await deleteUserCard("test-card-id");
        expect.fail("Should have thrown an error");
      } catch (error) {
        const errorWithStatus = error as ErrorWithStatus;
        expect(errorWithStatus.status).toBe(401);
        expect(errorWithStatus.response?.status).toBe(401);
      }
    });

    it("should handle non-axios errors gracefully", async () => {
      const regularError = new Error("Regular error");

      mockedAxios.delete.mockRejectedValue(regularError);
      mockedAxios.isAxiosError.mockReturnValue(false);

      try {
        await deleteUserCard("test-card-id");
        expect.fail("Should have thrown an error");
      } catch (error) {
        const errorWithStatus = error as ErrorWithStatus;
        expect(errorWithStatus.message).toContain(
          "Impossible de supprimer la carte"
        );
        // Non-axios errors won't have status
        expect(errorWithStatus.status).toBeUndefined();
      }
    });
  });

  describe("Error Message Quality", () => {
    it("should include meaningful error messages for 404 in deleteUserCard", async () => {
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
        expect(errorWithStatus.message).toContain("Carte introuvable");
        expect(errorWithStatus.message).toContain("test-card-id");
        expect(errorWithStatus.message).toContain("404");
      }
    });

    it("should include meaningful error messages for 403 in deleteUserCard", async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 403 },
        message: "Request failed with status code 403",
      };

      mockedAxios.delete.mockRejectedValue(axiosError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      try {
        await deleteUserCard("test-card-id");
        expect.fail("Should have thrown an error");
      } catch (error) {
        const errorWithStatus = error as ErrorWithStatus;
        expect(errorWithStatus.message).toContain("pas autorisé");
        expect(errorWithStatus.message).toContain("403");
      }
    });

    it("should include meaningful error messages for 401 in deleteUserCard", async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 401 },
        message: "Request failed with status code 401",
      };

      mockedAxios.delete.mockRejectedValue(axiosError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      try {
        await deleteUserCard("test-card-id");
        expect.fail("Should have thrown an error");
      } catch (error) {
        const errorWithStatus = error as ErrorWithStatus;
        expect(errorWithStatus.message).toContain("Session expirée");
        expect(errorWithStatus.message).toContain("401");
      }
    });
  });
});
