import { useContext } from "react";
import { CategoriesContext, CategoriesContextType } from "./CategoriesContext";

/**
 * Custom hook to access the CategoriesContext
 * @return {CategoriesContextType} The context value
 */
export const useCategoriesContext = (): CategoriesContextType => {
  const context = useContext(CategoriesContext);
  return context;
};
