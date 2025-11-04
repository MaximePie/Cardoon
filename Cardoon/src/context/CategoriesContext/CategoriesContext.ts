import { createContext } from "react";
import { FetchedCategory } from "../../hooks/queries/useCategories";

export interface CategoriesContextType {
  categories: FetchedCategory[] | undefined;
  error: unknown;
  isLoading: boolean;
  categoriesWithCount: string[];
}

const defaultValue: CategoriesContextType = {
  categories: undefined,
  error: undefined,
  isLoading: false,
  categoriesWithCount: [],
};

export const CategoriesContext =
  createContext<CategoriesContextType>(defaultValue);
