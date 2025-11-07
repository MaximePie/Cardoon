import { useUser } from "../../../../context/UserContext";
import coinImage from "../../../../images/coin.png";
import { formattedNumber } from "../../../../utils/numbers";
import DailyGoalForm from "../DailGoalForm";

export default function UserProfile() {
  const { user } = useUser();
  const { gold, currentDailyGoal } = user;

  return (
    <section
      className="UserProfile UserPage__tab-content"
      aria-labelledby="profile-tab"
    >
      <section className="UserProfile__Currencies">
        <div className="UserProfile__currency">
          <img
            src={coinImage}
            alt="Pièces de connaissance"
            className="UserProfile__currency-icon"
          />
          <div className="UserProfile__currency-info">
            <span className="UserProfile__currency-amount">
              {formattedNumber(gold || 0)}
            </span>
            <span className="UserProfile__currency-label">Knowledge Coins</span>
          </div>
        </div>
      </section>

      {currentDailyGoal && (
        <div className="UserPage__daily-goal-progress">
          <h4>Objectif quotidien actuel</h4>
          <p>
            <strong>Progrès :</strong> {currentDailyGoal.progress} /{" "}
            {currentDailyGoal.target}
          </p>
        </div>
      )}

      <DailyGoalForm />
    </section>
  );
}
