/**
 * @fileoverview Integration test for retry guard with HTTP status preservation
 *
 * Verifies that the retry logic in queryClient.ts correctly identifies
 * HTTP status codes from userCardsApi errors
 */

import { describe, expect, it } from "vitest";
import { getErrorStatus, getRetryDelay, shouldRetryQuery } from "./queryClient";

describe("QueryClient Retry Guard Integration", () => {
  describe("getErrorStatus", () => {
    it("should identify HTTP status codes from error objects", () => {
      // Test with error that has status via response property
      const errorWithResponse = {
        response: { status: 404 },
        message: "Not Found",
      };
      expect(getErrorStatus(errorWithResponse)).toBe(404);

      // Test with error that has direct status property
      const errorWithStatus = { status: 403, message: "Forbidden" };
      expect(getErrorStatus(errorWithStatus)).toBe(403);

      // Test with error that has both (response.status takes priority)
      const errorWithBoth = {
        response: { status: 401 },
        status: 500,
        message: "Auth Error",
      };
      expect(getErrorStatus(errorWithBoth)).toBe(401);

      // Test with error that has no status
      const errorNoStatus = { message: "Generic Error" };
      expect(getErrorStatus(errorNoStatus)).toBeUndefined();

      // Test with null/undefined
      expect(getErrorStatus(null)).toBeUndefined();
      expect(getErrorStatus(undefined)).toBeUndefined();

      // Test with non-object values
      expect(getErrorStatus("string error")).toBeUndefined();
      expect(getErrorStatus(42)).toBeUndefined();
      expect(getErrorStatus(true)).toBeUndefined();
    });

    it("should handle edge cases with invalid status values", () => {
      // Test with non-numeric status values
      const errorWithStringStatus = { status: "404", message: "Error" };
      expect(getErrorStatus(errorWithStringStatus)).toBeUndefined();

      const errorWithNullStatus = { status: null, message: "Error" };
      expect(getErrorStatus(errorWithNullStatus)).toBeUndefined();

      const errorWithUndefinedStatus = { status: undefined, message: "Error" };
      expect(getErrorStatus(errorWithUndefinedStatus)).toBeUndefined();

      // Test with non-numeric response.status values
      const errorWithStringResponseStatus = {
        response: { status: "500" },
        message: "Error",
      };
      expect(getErrorStatus(errorWithStringResponseStatus)).toBeUndefined();
    });
  });

  describe("shouldRetryQuery", () => {
    it("should not retry 404 errors regardless of failure count", () => {
      const error404 = { status: 404, message: "Not Found" };
      expect(shouldRetryQuery(0, error404)).toBe(false);
      expect(shouldRetryQuery(1, error404)).toBe(false);
      expect(shouldRetryQuery(2, error404)).toBe(false);
      expect(shouldRetryQuery(10, error404)).toBe(false);

      // Test with 404 via response.status as well
      const error404Response = {
        response: { status: 404 },
        message: "Not Found",
      };
      expect(shouldRetryQuery(0, error404Response)).toBe(false);
    });

    it("should retry other HTTP status codes up to 3 times", () => {
      const error500 = { status: 500, message: "Server Error" };
      expect(shouldRetryQuery(0, error500)).toBe(true);
      expect(shouldRetryQuery(1, error500)).toBe(true);
      expect(shouldRetryQuery(2, error500)).toBe(true);
      expect(shouldRetryQuery(3, error500)).toBe(false);
      expect(shouldRetryQuery(4, error500)).toBe(false);

      // Test other non-special status codes
      const error502 = { status: 502, message: "Bad Gateway" };
      expect(shouldRetryQuery(0, error502)).toBe(true);
      expect(shouldRetryQuery(2, error502)).toBe(true);
      expect(shouldRetryQuery(3, error502)).toBe(false);
    });

    it("should handle 401 errors with token refresh logic", () => {
      // 401 errors should allow one retry attempt (for token refresh)
      const error401 = { status: 401, message: "Unauthorized" };

      // First attempt should allow retry (triggers token refresh)
      expect(shouldRetryQuery(0, error401)).toBe(true);

      // After first failure, should not retry
      expect(shouldRetryQuery(1, error401)).toBe(false);
      expect(shouldRetryQuery(2, error401)).toBe(false);
    });

    it("should handle 403 errors based on retry headers", () => {
      // 403 without retry headers should not retry
      const error403NoHeaders = { status: 403, message: "Forbidden" };
      expect(shouldRetryQuery(0, error403NoHeaders)).toBe(false);
      expect(shouldRetryQuery(1, error403NoHeaders)).toBe(false);

      // 403 with Retry-After header should allow one retry
      const error403WithRetryAfter = {
        status: 403,
        message: "Forbidden",
        response: {
          status: 403,
          headers: {
            "retry-after": "5",
          },
        },
      };
      expect(shouldRetryQuery(0, error403WithRetryAfter)).toBe(true);
      expect(shouldRetryQuery(1, error403WithRetryAfter)).toBe(false);

      // 403 with rate limit headers should allow one retry
      const error403WithRateLimit = {
        status: 403,
        message: "Rate Limited",
        response: {
          status: 403,
          headers: {
            "x-ratelimit-remaining": "0",
            "x-ratelimit-reset": String(Math.floor(Date.now() / 1000) + 10),
          },
        },
      };
      expect(shouldRetryQuery(0, error403WithRateLimit)).toBe(true);
      expect(shouldRetryQuery(1, error403WithRateLimit)).toBe(false);
    });

    it("should retry errors without status codes up to 3 times", () => {
      const errorNoStatus = { message: "Network Error" };
      expect(shouldRetryQuery(0, errorNoStatus)).toBe(true);
      expect(shouldRetryQuery(1, errorNoStatus)).toBe(true);
      expect(shouldRetryQuery(2, errorNoStatus)).toBe(true);
      expect(shouldRetryQuery(3, errorNoStatus)).toBe(false);

      // Test with various non-status error types
      const stringError = "Connection failed";
      expect(shouldRetryQuery(0, stringError)).toBe(true);
      expect(shouldRetryQuery(2, stringError)).toBe(true);
      expect(shouldRetryQuery(3, stringError)).toBe(false);

      const nullError = null;
      expect(shouldRetryQuery(0, nullError)).toBe(true);
      expect(shouldRetryQuery(2, nullError)).toBe(true);
      expect(shouldRetryQuery(3, nullError)).toBe(false);
    });
  });

  describe("getRetryDelay", () => {
    it("should implement exponential backoff with maximum cap", () => {
      // Test exponential backoff: 1000 * 2^attemptIndex
      expect(getRetryDelay(0)).toBe(1000); // 2^0 = 1
      expect(getRetryDelay(1)).toBe(2000); // 2^1 = 2
      expect(getRetryDelay(2)).toBe(4000); // 2^2 = 4
      expect(getRetryDelay(3)).toBe(8000); // 2^3 = 8
      expect(getRetryDelay(4)).toBe(16000); // 2^4 = 16
    });

    it("should cap delay at 30 seconds maximum", () => {
      // Test that delay doesn't exceed 30000ms
      expect(getRetryDelay(10)).toBe(30000); // Would be 1024000 without cap
      expect(getRetryDelay(15)).toBe(30000); // Would be much larger without cap
      expect(getRetryDelay(20)).toBe(30000); // Would be much larger without cap
    });

    it("should handle edge cases", () => {
      // Test with negative values (though not expected in real usage)
      expect(getRetryDelay(-1)).toBeLessThanOrEqual(30000);

      // Test boundary case where it hits the cap
      expect(getRetryDelay(5)).toBe(30000); // 2^5 * 1000 = 32000, capped at 30000
    });

    it("should use custom delay for 403 errors with retry headers", () => {
      // 403 error with Retry-After header should use custom delay
      const error403WithRetryAfter = {
        status: 403,
        response: {
          status: 403,
          headers: {
            "retry-after": "5",
          },
        },
      };
      expect(getRetryDelay(0, error403WithRetryAfter)).toBe(5000); // 5 seconds in ms

      // 403 error with rate limit headers
      const futureTimestamp = Math.floor(Date.now() / 1000) + 10;
      const error403WithRateLimit = {
        status: 403,
        response: {
          status: 403,
          headers: {
            "x-ratelimit-remaining": "0",
            "x-ratelimit-reset": String(futureTimestamp),
          },
        },
      };
      const delay = getRetryDelay(0, error403WithRateLimit);
      expect(delay).toBeGreaterThan(0);
      expect(delay).toBeLessThanOrEqual(10000); // Should be around 10 seconds or less

      // 403 error without retry headers should use normal exponential backoff
      const error403NoHeaders = { status: 403, message: "Forbidden" };
      expect(getRetryDelay(1, error403NoHeaders)).toBe(2000); // Normal exponential backoff
    });
  });
});
