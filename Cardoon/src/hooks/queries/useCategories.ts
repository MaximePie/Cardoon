import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { createAuthenticatedAxios } from "../../services/userCardsApi";
import { extractErrorMessage } from "../../utils";
// Get API URL from environment, with fallback for test environments
const backUrl =
  import.meta.env.VITE_API_URL ||
  (typeof process !== "undefined" ? process.env.VITE_API_URL : undefined);

// During tests we allow backUrl to be undefined (tests should mock API calls)
if (
  !backUrl &&
  typeof process !== "undefined" &&
  process.env.NODE_ENV !== "test"
) {
  throw new Error("VITE_API_URL is not defined. Configure API base URL.");
}

/**
 * Creates an error that preserves HTTP status information for retry logic
 * @param message - Error message
 * @param originalError - Original axios error
 * @returns Error with preserved status information
 */
const createStatusPreservingError = (
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

export interface FetchedCategory {
  category: string;
  count: number;
}
// Manage queries related to categories
export const useCategories = () => {
  const { data, error, isLoading } = useQuery<FetchedCategory[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const response = await axios.get<FetchedCategory[]>(
          `${backUrl}/api/cards/categories`,
          createAuthenticatedAxios()
        );

        const categories = response.data
          .filter(({ category }) => category !== null)
          .sort((a, b) => a.category.localeCompare(b.category));
        return categories;
      } catch (error) {
        const extractedError = extractErrorMessage(error);
        console.error("Error fetching categories:", extractedError);
        // Gestion spécifique des erreurs courantes
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            throw createStatusPreservingError(
              `Aucune catégorie trouvée - 404`,
              error
            );
          } else if (error.response?.status === 401) {
            throw createStatusPreservingError(
              "Session expirée, veuillez vous reconnecter - 401",
              error
            );
          }
        }
        throw createStatusPreservingError("Failed to fetch categories", error);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { data, error, isLoading };
};
