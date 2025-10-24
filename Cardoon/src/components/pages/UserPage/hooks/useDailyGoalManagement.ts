import { useCallback, useContext, useEffect, useState } from "react";
import { SnackbarContext } from "../../../../context/SnackbarContext";
import { RESOURCES, usePut } from "../../../../hooks/server";
import { useUser } from "../../../../hooks/useUser";
import { User } from "../../../../types/common";

/**
 * Hook personnalisé pour gérer l'objectif quotidien
 * Centralise la logique de mise à jour de l'objectif quotidien
 */
export const useDailyGoalManagement = () => {
  const { user, setUser } = useUser();
  const { openSnackbarWithMessage } = useContext(SnackbarContext);
  const [draftDailyGoal, setDraftDailyGoal] = useState<number>(
    user.dailyGoal || 0
  );
  const { putUser, data: putResult } = usePut<User>(RESOURCES.USER_DAILY_GOAL);

  // Synchronisation avec les changements de l'utilisateur
  useEffect(() => {
    setDraftDailyGoal(user.dailyGoal || 0);
  }, [user.dailyGoal]);

  // Traitement de la réponse du serveur
  useEffect(() => {
    if (putResult) {
      setUser(putResult);
      setDraftDailyGoal(putResult.dailyGoal);
      openSnackbarWithMessage(
        `Objectif quotidien mis à jour : ${putResult.dailyGoal}`,
        "success"
      );
    }
  }, [putResult, setUser, openSnackbarWithMessage]);

  // Gestion du changement de valeur
  const handleDraftChange = useCallback((value: number) => {
    setDraftDailyGoal(value);
  }, []);

  // Soumission du formulaire
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (draftDailyGoal < 0 || draftDailyGoal > 100) {
        openSnackbarWithMessage(
          "L'objectif quotidien doit être entre 0 et 100",
          "error"
        );
        return;
      }

      putUser({ target: draftDailyGoal });
    },
    [draftDailyGoal, putUser, openSnackbarWithMessage]
  );

  return {
    draftDailyGoal,
    handleDraftChange,
    handleSubmit,
  };
};
