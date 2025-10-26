import { useUser } from "../../../context/UserContext";
import coinImage from "../../../images/coin.png";
import { formattedNumber } from "../../../utils/numbers";
import DailyGoalForm from "./DailGoalForm";

// 📋 Composant profil utilisateur
export default function UserProfile() {
  const { user } = useUser();
  const { role, gold, currentDailyGoal } = user;

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
      <DailyGoalForm />
    </section>
  );
}
