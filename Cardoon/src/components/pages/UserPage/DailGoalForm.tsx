import { useContext, useEffect, useState } from "react";
import { SnackbarContext } from "../../../context/SnackbarContext";
import { useUser } from "../../../context/UserContext/useUserContext";
import { RESOURCES, usePut } from "../../../hooks/server";
import { User } from "../../../types/common";

// 📝 Hook personnalisé pour la gestion de l'objectif quotidien
const useDailyGoal = () => {
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

  // 📝 Gestionnaire de changement avec validation
  const handleDraftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = parseInt(rawValue, 10);
    setDraftDailyGoal(!isNaN(numericValue) ? numericValue : 0);
  };

  // ✅ Gestionnaire de soumission avec validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
    draftDailyGoal,
    isSubmitting: loading,
    currentDailyGoal: user.currentDailyGoal,
    handleDraftChange,
    handleSubmit,
  };
};

// 📝 Composant formulaire d'objectif quotidien
export default function DailyGoalForm() {
  const { draftDailyGoal, isSubmitting, handleDraftChange, handleSubmit } =
    useDailyGoal();

  return (
    <form onSubmit={handleSubmit}>
      <h4>Modifier l&apos;objectif quotidien</h4>
      <input
        type="number"
        min="0"
        max="100"
        value={draftDailyGoal}
        onChange={handleDraftChange}
        placeholder="Objectif quotidien (0-100)"
        aria-label="Objectif quotidien"
        disabled={isSubmitting}
      />
      <button
        type="submit"
        aria-label="Enregistrer l'objectif quotidien"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
