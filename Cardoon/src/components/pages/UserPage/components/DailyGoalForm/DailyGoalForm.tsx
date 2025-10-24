import { useDailyGoal } from "../../hooks";

/**
 * Composant formulaire d'objectif quotidien
 * Responsabilité : Gestion de la modification de l'objectif quotidien avec validation
 */
export const DailyGoalForm = () => {
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
};
