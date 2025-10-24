import { useContext, useEffect, useState } from "react";
import { SnackbarContext } from "../../../../context/SnackbarContext";
import { RESOURCES, usePut } from "../../../../hooks/server";
import { useUser } from "../../../../hooks/useUser";
import { User } from "../../../../types/common";

/**
 * Hook personnalisé pour gérer la logique de l'objectif quotidien
 * Sépare la logique métier du composant UI
 */
export const useDailyGoal = () => {
  const { user, setUser } = useUser();
  const { openSnackbarWithMessage } = useContext(SnackbarContext);
  const [draftDailyGoal, setDraftDailyGoal] = useState<number>(
    user.dailyGoal || 0
  );
  const {
    putUser,
    data: postResult,
    loading,
  } = usePut<User>(RESOURCES.USER_DAILY_GOAL);

  // 🔄 Synchronisation avec la réponse du serveur
  useEffect(() => {
    if (postResult) {
      setUser(postResult);
      setDraftDailyGoal(postResult.dailyGoal);
      openSnackbarWithMessage(
        `Objectif quotidien mis à jour : ${postResult.dailyGoal}`,
        "success"
      );
    }
  }, [postResult, setUser, openSnackbarWithMessage]);

  // 📝 Gestionnaire de changement de valeur avec validation
  const handleDraftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = parseInt(rawValue, 10);

    // Gestion robuste des valeurs d'entrée
    setDraftDailyGoal(!isNaN(numericValue) ? numericValue : 0);
  };

  // ✅ Gestionnaire de soumission avec validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation simple avant soumission
    if (draftDailyGoal < 0 || draftDailyGoal > 100) {
      openSnackbarWithMessage(
        "L'objectif quotidien doit être entre 0 et 100",
        "error"
      );
      return;
    }

    putUser({ target: draftDailyGoal });
  };

  return {
    // État
    draftDailyGoal,
    isSubmitting: loading,
    currentDailyGoal: user.currentDailyGoal,

    // Actions
    handleDraftChange,
    handleSubmit,
  };
};
