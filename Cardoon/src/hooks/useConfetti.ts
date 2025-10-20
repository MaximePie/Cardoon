import { useContext } from "react";
import { ConfettiContext } from "../context/ConfettiContext";
/**
 * Hook personnalisé pour utiliser le ConfettiContext
 * Fournit une meilleure expérience développeur avec vérification d'erreur
 */
export const useConfetti = () => {
  const context = useContext(ConfettiContext);
  return context;
};
