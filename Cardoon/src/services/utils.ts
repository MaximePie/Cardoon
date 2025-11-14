import axios from "axios";

/**
 * Creates an error that preserves HTTP status information for retry logic
 * @param message - Error message
 * @param originalError - Original axios error
 * @returns Error with preserved status information
 */
export const createStatusPreservingError = (
  message: string,
  originalError: unknown
): Error => {
  const error = new Error(message) as Error & {
    status?: number;
    response?: { status?: number };
  };

  if (axios.isAxiosError(originalError)) {
    const status = originalError.response?.status;
    if (status) {
      error.status = status;
      error.response = { status };
    }
  }

  return error;
};
