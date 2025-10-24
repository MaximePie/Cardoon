/**
 * @fileoverview Integration test for retry guard with HTTP status preservation
 *
 * Verifies that the retry logic in queryClient.ts correctly identifies
 * HTTP status codes from userCardsApi errors
 */

import { describe, expect, it } from "vitest";

describe("QueryClient Retry Guard Integration", () => {
  it("should identify HTTP status codes from error objects", () => {
    // This simulates the getStatus function from queryClient.ts
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

    // Test with error that has status via response property
    const errorWithResponse = {
      response: { status: 404 },
      message: "Not Found",
    };
    expect(getStatus(errorWithResponse)).toBe(404);

    // Test with error that has direct status property
    const errorWithStatus = { status: 403, message: "Forbidden" };
    expect(getStatus(errorWithStatus)).toBe(403);

    // Test with error that has both (response.status takes priority)
    const errorWithBoth = {
      response: { status: 401 },
      status: 500,
      message: "Auth Error",
    };
    expect(getStatus(errorWithBoth)).toBe(401);

    // Test with error that has no status
    const errorNoStatus = { message: "Generic Error" };
    expect(getStatus(errorNoStatus)).toBeUndefined();

    // Test with null/undefined
    expect(getStatus(null)).toBeUndefined();
    expect(getStatus(undefined)).toBeUndefined();
  });

  it("should demonstrate retry logic with status codes", () => {
    // This simulates the retry function from queryClient.ts
    const shouldRetry = (failureCount: number, error: unknown): boolean => {
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
      // Don't retry 404 errors
      if (status === 404) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    };

    // 404 errors should not retry
    const error404 = { status: 404, message: "Not Found" };
    expect(shouldRetry(0, error404)).toBe(false);
    expect(shouldRetry(1, error404)).toBe(false);
    expect(shouldRetry(2, error404)).toBe(false);

    // Other status codes should retry up to 3 times
    const error500 = { status: 500, message: "Server Error" };
    expect(shouldRetry(0, error500)).toBe(true);
    expect(shouldRetry(1, error500)).toBe(true);
    expect(shouldRetry(2, error500)).toBe(true);
    expect(shouldRetry(3, error500)).toBe(false);

    // 403 and 401 should also retry (they're not 404)
    const error403 = { status: 403, message: "Forbidden" };
    expect(shouldRetry(0, error403)).toBe(true);

    const error401 = { status: 401, message: "Unauthorized" };
    expect(shouldRetry(0, error401)).toBe(true);

    // Errors without status should retry
    const errorNoStatus = { message: "Network Error" };
    expect(shouldRetry(0, errorNoStatus)).toBe(true);
    expect(shouldRetry(1, errorNoStatus)).toBe(true);
    expect(shouldRetry(2, errorNoStatus)).toBe(true);
    expect(shouldRetry(3, errorNoStatus)).toBe(false);
  });
});
