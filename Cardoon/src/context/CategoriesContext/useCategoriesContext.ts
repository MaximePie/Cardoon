import { useContext } from "react";
import { CategoriesContext, CategoriesContextType } from "./CategoriesContext";

/**
 * Hook personnalisé pour utiliser le UserContext
 * Fournit une meilleure expérience développeur avec vérification d'erreur
 */
export const useCategoriesContext = (): CategoriesContextType => {
  const context = useContext(CategoriesContext);
  return context;
};
