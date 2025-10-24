import { useCallback, useEffect, useState } from "react";
import { useUser } from "../../../../../hooks/useUser";
import coinImage from "../../../../../images/coin.png";
import { formattedNumber } from "../../../../../utils/numbers";
import { DailyGoalForm } from "../DailyGoalForm";

/**
 * Composant section profil utilisateur
 * Responsabilité : Affichage des informations détaillées du compte et objectif quotidien
 */
export const UserProfile = () => {
  const { user } = useUser();
  const { role, gold, currentDailyGoal } = user;

  // Local draft state for the DailyGoalForm (typed as any to match unknown external prop types)
  const [draftDailyGoal, setDraftDailyGoal] = useState<any>(
    currentDailyGoal ?? { target: 0, progress: 0 }
  );

  // Keep draft in sync when the currentDailyGoal from the user updates
  useEffect(() => {
    setDraftDailyGoal(currentDailyGoal ?? { target: 0, progress: 0 });
  }, [currentDailyGoal]);

  const handleDraftChange = useCallback((next: any) => {
    setDraftDailyGoal(next);
  }, []);

  const handleSubmit = useCallback(
    async (payload?: any) => {
      // Placeholder submit handler — replace with real API call / mutation as needed
      console.log("Submitting daily goal", payload ?? draftDailyGoal);
    },
    [draftDailyGoal]
  );

  return (
    <section className="UserPage__tab-content" aria-labelledby="profile-tab">
      <h3 id="profile-tab">Informations du compte</h3>

      {/* 📊 Informations du rôle */}
      <p>
        <strong>Rôle :</strong> {role}
      </p>

      {/* 💰 Affichage des devises */}
      <section className="UserPage__Currencies">
        <div className="UserPage__currency">
          <img src={coinImage} alt="Pièces de connaissance" />
          <div className="UserPage__currency-info">
            <span className="UserPage__currency-amount">
              {formattedNumber(gold || 0)}
            </span>
            <span className="UserPage__currency-label">Knowledge Coins</span>
          </div>
        </div>
      </section>

      {/* 🎯 Progrès de l'objectif quotidien */}
      {currentDailyGoal && (
        <div className="UserPage__daily-goal-progress">
          <h4>Objectif quotidien actuel</h4>
          <p>
            <strong>Progrès :</strong> {currentDailyGoal.progress} /{" "}
            {currentDailyGoal.target}
          </p>
        </div>
      )}

      {/* 📝 Formulaire de modification de l'objectif */}
      <DailyGoalForm
        user={user}
        draftDailyGoal={draftDailyGoal}
        onDraftChange={handleDraftChange}
        onSubmit={handleSubmit}
      />
    </section>
  );
};
