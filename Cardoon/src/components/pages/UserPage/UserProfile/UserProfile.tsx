import CircularProgress from "@mui/joy/CircularProgress";
import { Card } from "@mui/material";
import { useUser } from "../../../../context/UserContext";
import coinImage from "../../../../images/coin.png";
import { formattedNumber } from "../../../../utils/numbers";
import DailyGoalForm from "../DailGoalForm";

export default function UserProfile() {
  const { user } = useUser();
  if (!user.data) return null;
  const { gold, currentDailyGoal } = user.data;

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
        <Card variant="outlined" className="UserProfile__daily-goal-progress">
          <h4>Objectif quotidien actuel</h4>
          <p>
            <CircularProgress
              determinate
              value={
                currentDailyGoal.target > 0
                  ? (currentDailyGoal.progress / currentDailyGoal.target) * 100
                  : 0
              }
              size="lg"
            >
              {currentDailyGoal.progress} / {currentDailyGoal.target}
            </CircularProgress>
          </p>
          <DailyGoalForm />
        </Card>
      )}
    </section>
  );
}
