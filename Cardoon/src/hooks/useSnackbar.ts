import { useContext } from "react";
import { SnackbarContext } from "../context/SnackbarContext";

/**
 * Hook personnalisé pour utiliser le SnackbarContext
 * Fournit une meilleure expérience développeur avec vérification d'erreur
 */
export const useSnackbar = () => {
  const context = useContext(SnackbarContext);

  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }

  return context;
};
