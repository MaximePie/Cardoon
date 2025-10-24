import { useCallback } from "react";
import { User } from "../../../../types/common";

interface DailyGoalFormProps {
  user: User;
  draftDailyGoal: number;
  onDraftChange: (value: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const DailyGoalForm = ({
  user,
  draftDailyGoal,
  onDraftChange,
  onSubmit,
}: DailyGoalFormProps) => {
  const { role, currentDailyGoal } = user;

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value);
      onDraftChange(!isNaN(value) ? value : 0);
    },
    [onDraftChange]
  );

  return (
    <div className="UserPage__tab-content">
      <h3>Informations du compte</h3>
      <p>Rôle : {role}</p>

      {currentDailyGoal && (
        <div>
          <h4>Objectif quotidien actuel</h4>
          <p>
            Progrès : {currentDailyGoal.progress} / {currentDailyGoal.target}
          </p>
        </div>
      )}

      <form onSubmit={onSubmit}>
        <h4>Modifier l&apos;objectif quotidien</h4>
        <input
          type="number"
          min="0"
          max="100"
          value={draftDailyGoal}
          onChange={handleInputChange}
          placeholder="Objectif quotidien"
          aria-label="Objectif quotidien"
        />
        <button type="submit" aria-label="Enregistrer l'objectif quotidien">
          Enregistrer
        </button>
      </form>
    </div>
  );
};
