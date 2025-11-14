import { Button, Input } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { SnackbarContext } from "../../../context/SnackbarContext";
import { useUser } from "../../../context/UserContext/useUserContext";

// 📝 Hook personnalisé pour la gestion de l'objectif quotidien
const useDailyGoal = () => {
  const { user } = useUser();
  const { openSnackbarWithMessage } = useContext(SnackbarContext);
  const [draftDailyGoal, setDraftDailyGoal] = useState<number>(
    user.data.dailyGoal || 0
  );

  useEffect(() => {
    setDraftDailyGoal(user.data.dailyGoal || 0);
  }, [user.data.dailyGoal]);

  // 📝 Gestionnaire de changement avec validation
  const handleDraftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = parseInt(rawValue, 10);
    setDraftDailyGoal(!isNaN(numericValue) ? numericValue : 0);
  };

  // ✅ Gestionnaire de soumission avec validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (draftDailyGoal < 0 || draftDailyGoal > 1000) {
      openSnackbarWithMessage(
        "L'objectif quotidien doit être entre 0 et 1000",
        "error"
      );
      return;
    }

    try {
      user.updateDailyGoal(draftDailyGoal);
    } catch (error) {
      openSnackbarWithMessage(
        "Une erreur est survenue lors de la mise à jour de l'objectif quotidien.",
        "error"
      );
    }
  };

  return {
    draftDailyGoal,
    currentDailyGoal: user.data.currentDailyGoal,
    handleDraftChange,
    handleSubmit,
  };
};

// 📝 Composant formulaire d'objectif quotidien
export default function DailyGoalForm() {
  const { draftDailyGoal, handleDraftChange, handleSubmit } = useDailyGoal();

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="number"
        inputProps={{ min: 0, max: 1000 }}
        value={draftDailyGoal}
        onChange={handleDraftChange}
        placeholder="Objectif quotidien (0-1000)"
        aria-label="Objectif quotidien"
      />
      <Button type="submit" aria-label="Enregistrer l'objectif quotidien">
        Enregistrer
      </Button>
    </form>
  );
}
