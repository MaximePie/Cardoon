import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { createAuthenticatedAxios } from "../../services/userCardsApi";
// Get API URL from environment, with fallback for test environments
const backUrl = import.meta.env.VITE_API_URL || process.env.VITE_API_URL;

// During tests we allow backUrl to be undefined (tests should mock API calls)
if (!backUrl && process.env.NODE_ENV !== "test") {
  throw new Error("VITE_API_URL is not defined. Configure API base URL.");
}

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

        const categories = response.data;
        categories.sort((a, b) => a.category.localeCompare(b.category));
        return categories;
      } catch (error) {
        throw new Error("Failed to fetch categories");
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { data, error, isLoading };
};
