/**
 * Utility functions for error handling across the application
 */

/**
 * Extracts user-friendly error messages from axios errors
 *
 * Priority order:
 * 1. API response errorMessage
 * 2. API response message
 * 3. Axios error message
 * 4. "Unknown error" fallback
 *
 * @param err - The error object (typically from axios)
 * @returns A user-friendly error message string
 */
export const extractErrorMessage = (err: unknown): string => {
  if (err instanceof Error) {
    // Handle Axios errors specifically
    if (typeof err === "object" && err !== null && "response" in err) {
      const axiosError = err as {
        response?: {
          data?: { errorMessage?: string; message?: string };
        };
        message: string;
      };

      const errorData = axiosError.response?.data;
      if (errorData?.errorMessage) {
        return errorData.errorMessage;
      } else if (errorData?.message) {
        return errorData.message;
      }
      // If no specific API error message, return the original axios error message
      return err.message;
    }
    return err.message;
  }
  return "Unknown error";
};

/**
 * Type guard to check if an error is an axios error
 * @param err - The error object to check
 * @returns True if the error is an axios error, false otherwise
 */
export const isAxiosError = (
  err: unknown
): err is {
  response?: {
    data?: { errorMessage?: string; message?: string };
    status?: number;
  };
  message: string;
} => {
  return (
    err instanceof Error &&
    typeof err === "object" &&
    err !== null &&
    "response" in err
  );
};

/**
 * Extract HTTP status code from axios errors
 * @param err - The error object (typically from axios)
 * @returns The HTTP status code if available, otherwise null
 */
export const extractErrorStatus = (err: unknown): number | null => {
  if (isAxiosError(err)) {
    return err.response?.status ?? null;
  }
  return null;
};
