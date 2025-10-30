import { useUser } from "../../../context/UserContext";
import coinImage from "../../../images/coin.png";
import { formattedNumber } from "../../../utils/numbers";
import DailyGoalForm from "./DailGoalForm";

export default function UserProfile() {
  const { user } = useUser();
  const { gold, currentDailyGoal } = user;

  return (
    <section className="UserPage__tab-content" aria-labelledby="profile-tab">
      <section className="UserPage__Currencies">
        <div className="UserPage__currency">
          <img
            src={coinImage}
            alt="Pièces de connaissance"
            className="UserPage__currency-icon"
          />
          <div className="UserPage__currency-info">
            <span className="UserPage__currency-amount">
              {formattedNumber(gold || 0)}
            </span>
            <span className="UserPage__currency-label">Knowledge Coins</span>
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
