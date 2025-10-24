import { useContext } from "react";
import { SnackbarContext } from "../../context/SnackbarContext";

/**
 * Hook personnalisé pour utiliser le SnackbarContext
 * Fournit une API simplifiée et type-safe pour les snackbars
 */
export const useSnackbar = () => {
  const context = useContext(SnackbarContext);

  // Fonctions utilitaires pour une meilleure DX
  const showSuccess = (message: string) => {
    context.openSnackbarWithMessage(message, "success");
  };

  const showError = (message: string) => {
    context.openSnackbarWithMessage(message, "error");
  };

  return {
    ...context,
    showSuccess,
    showError,
  };
};
