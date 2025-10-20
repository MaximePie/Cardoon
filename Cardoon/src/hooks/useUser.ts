import { useContext } from "react";
import {
  UserContext,
  UserContextType,
} from "../context/UserContext/UserContext";

/**
 * Hook personnalisé pour utiliser le UserContext
 * Fournit une meilleure expérience développeur avec vérification d'erreur
 */
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  return context;
};
