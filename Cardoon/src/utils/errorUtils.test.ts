import { describe, expect, it } from "vitest";
import {
  extractErrorMessage,
  extractErrorStatus,
  isAxiosError,
} from "../utils/errorUtils";

describe("errorUtils", () => {
  describe("extractErrorMessage", () => {
    it('should return "Unknown error" for non-Error objects', () => {
      expect(extractErrorMessage(null)).toBe("Unknown error");
      expect(extractErrorMessage(undefined)).toBe("Unknown error");
      expect(extractErrorMessage("string error")).toBe("Unknown error");
      expect(extractErrorMessage(123)).toBe("Unknown error");
      expect(extractErrorMessage({})).toBe("Unknown error");
    });

    it("should return error message for basic Error objects", () => {
      const error = new Error("Basic error message");
      expect(extractErrorMessage(error)).toBe("Basic error message");
    });

    it("should prioritize API errorMessage over other messages", () => {
      const axiosError = new Error("Axios error") as Error & {
        response: {
          data: {
            errorMessage: "API specific error";
            message: "API general message";
          };
        };
      };
      axiosError.response = {
        data: {
          errorMessage: "API specific error",
          message: "API general message",
        },
      };

      expect(extractErrorMessage(axiosError)).toBe("API specific error");
    });

    it("should fall back to API message when errorMessage is not available", () => {
      const axiosError = new Error("Axios error") as Error & {
        response: {
          data: {
            message: "API general message";
          };
        };
      };
      axiosError.response = {
        data: {
          message: "API general message",
        },
      };

      expect(extractErrorMessage(axiosError)).toBe("API general message");
    });

    it("should fall back to axios error message when API data is not available", () => {
      const axiosError = new Error("Network Error") as Error & {
        response: object;
      };
      axiosError.response = {};

      expect(extractErrorMessage(axiosError)).toBe("Network Error");
    });

    it("should handle axios errors with empty response data", () => {
      const axiosError = new Error("Connection timeout") as Error & {
        response: {
          data: object;
        };
      };
      axiosError.response = {
        data: {},
      };

      expect(extractErrorMessage(axiosError)).toBe("Connection timeout");
    });

    it("should handle axios errors with null response data", () => {
      const axiosError = new Error("Request failed") as Error & {
        response: {
          data: null;
        };
      };
      axiosError.response = {
        data: null,
      };

      expect(extractErrorMessage(axiosError)).toBe("Request failed");
    });
  });

  describe("isAxiosError", () => {
    it("should return false for non-Error objects", () => {
      expect(isAxiosError(null)).toBe(false);
      expect(isAxiosError(undefined)).toBe(false);
      expect(isAxiosError("string")).toBe(false);
      expect(isAxiosError(123)).toBe(false);
      expect(isAxiosError({})).toBe(false);
    });

    it("should return false for basic Error objects", () => {
      const error = new Error("Basic error");
      expect(isAxiosError(error)).toBe(false);
    });

    it("should return true for axios-like errors", () => {
      const axiosError = new Error("Axios error") as Error & {
        response: {
          data?: { errorMessage?: string; message?: string };
          status?: number;
        };
      };
      axiosError.response = {
        data: { message: "API error" },
        status: 500,
      };

      expect(isAxiosError(axiosError)).toBe(true);
    });

    it("should return true even with minimal axios error structure", () => {
      const axiosError = new Error("Minimal axios error") as Error & {
        response: object;
      };
      axiosError.response = {};

      expect(isAxiosError(axiosError)).toBe(true);
    });
  });

  describe("extractErrorStatus", () => {
    it("should return null for non-axios errors", () => {
      expect(extractErrorStatus(null)).toBe(null);
      expect(extractErrorStatus(new Error("Basic error"))).toBe(null);
      expect(extractErrorStatus("string error")).toBe(null);
    });

    it("should return status code for axios errors", () => {
      const axiosError = new Error("Axios error") as Error & {
        response: {
          data?: { errorMessage?: string; message?: string };
          status: number;
        };
      };
      axiosError.response = {
        status: 404,
        data: { message: "Not found" },
      };

      expect(extractErrorStatus(axiosError)).toBe(404);
    });

    it("should return null when status is not available in axios error", () => {
      const axiosError = new Error("Axios error") as Error & {
        response: {
          data?: { errorMessage?: string; message?: string };
        };
      };
      axiosError.response = {
        data: { message: "Error without status" },
      };

      expect(extractErrorStatus(axiosError)).toBe(null);
    });

    it("should handle various HTTP status codes", () => {
      const statusCodes = [200, 400, 401, 403, 404, 500, 502, 503];

      statusCodes.forEach((status) => {
        const axiosError = new Error(`HTTP ${status}`) as Error & {
          response: {
            status: number;
            data?: { message?: string };
          };
        };
        axiosError.response = {
          status,
          data: { message: `Error ${status}` },
        };

        expect(extractErrorStatus(axiosError)).toBe(status);
      });
    });
  });

  describe("Real-world axios error scenarios", () => {
    it("should handle typical 404 API response", () => {
      const error = new Error(
        "Request failed with status code 404"
      ) as Error & {
        response: {
          status: number;
          data: {
            errorMessage: string;
            timestamp: string;
          };
        };
      };
      error.response = {
        status: 404,
        data: {
          errorMessage: "User not found",
          timestamp: "2025-01-01T00:00:00Z",
        },
      };

      expect(extractErrorMessage(error)).toBe("User not found");
      expect(extractErrorStatus(error)).toBe(404);
      expect(isAxiosError(error)).toBe(true);
    });

    it("should handle validation errors with multiple messages", () => {
      const error = new Error(
        "Request failed with status code 400"
      ) as Error & {
        response: {
          status: number;
          data: {
            message: string;
            errors: string[];
          };
        };
      };
      error.response = {
        status: 400,
        data: {
          message: "Validation failed",
          errors: ["Email is required", "Password too short"],
        },
      };

      expect(extractErrorMessage(error)).toBe("Validation failed");
      expect(extractErrorStatus(error)).toBe(400);
    });

    it("should handle network timeout errors", () => {
      const error = new Error("Network Error: timeout of 5000ms exceeded");

      expect(extractErrorMessage(error)).toBe(
        "Network Error: timeout of 5000ms exceeded"
      );
      expect(extractErrorStatus(error)).toBe(null);
      expect(isAxiosError(error)).toBe(false);
    });
  });
});
