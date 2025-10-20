import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import { useContext, useEffect, useRef } from "react";
import { ConfettiContext } from "../../../context/ConfettiContext/ConfettiContext";
import { SnackbarContext } from "../../../context/SnackbarContext";
import { useUser } from "../../../hooks/useUser";
import goldIcon from "../../../images/coin.png";
import Button from "../../atoms/Button/Button";

interface GameFooterProps {
  setFlash?: (flash: boolean) => void;
  isFlashModeOn?: boolean;
  currentPage: "shop" | "game";
}

export const DailyGoalProgressBar = ({
  progress,
  target,
}: {
  progress: number;
  target: number;
}) => {
  const { openSnackbarWithMessage } = useContext(SnackbarContext);
  const { showConfetti } = useContext(ConfettiContext);
  const { user, setUser } = useUser();
  const previousProgress = useRef(user.currentDailyGoal.status);

  useEffect(() => {
    const shouldShowConfetti =
      progress >= target &&
      previousProgress.current === "PENDING" &&
      user.currentDailyGoal.status === "COMPLETED";
    if (shouldShowConfetti) {
      showConfetti();
      const questReward =
        user.currentGoldMultiplier * 10 * user.streak * user.dailyGoal;
      openSnackbarWithMessage(
        `Bravo ! Vous avez atteint votre objectif quotidien. Vous avez gagné ${questReward} pièces d'or !`
      );
      setUser({
        ...user,
        gold: user.gold + questReward,
      });
    }
  }, [progress, target, user, showConfetti, openSnackbarWithMessage, setUser]);

  const progressPercentage = (progress / target) * 100;
  const fillClassName = `Footer__progress-bar__fill ${
    progressPercentage >= 100 ? "Footer__progress-bar__fill--completed" : ""
  }`;
  return (
    <>
      <span className="Footer__progress-bar__title">Objectif quotidien</span>
      <div className="Footer__progress-bar">
        <span className="Footer__progress-bar__text">
          {progress > target ? target : progress} / {target || 1}
        </span>
        <div
          className={fillClassName}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </>
  );
};

export const GameFooter = (props: GameFooterProps) => {
  const { user, setUser } = useUser();
  const { openSnackbarWithMessage } = useContext(SnackbarContext);
  const { showConfetti } = useContext(ConfettiContext);
  const { setFlash, isFlashModeOn, currentPage } = props;
  const previousStatus = useRef(user.currentDailyGoal.status);

  useEffect(() => {
    if (
      previousStatus.current === "PENDING" &&
      user.currentDailyGoal.status === "COMPLETED"
    ) {
      showConfetti();
      const questReward =
        user.currentGoldMultiplier * 10 * user.streak * user.dailyGoal;
      openSnackbarWithMessage(
        `Bravo ! Vous avez atteint votre objectif quotidien. Vous avez gagné ${questReward} pièces d'or !`
      );
      setUser({
        ...user,
        gold: user.gold + questReward,
      });
    }
    previousStatus.current = user.currentDailyGoal.status;
  }, [
    user.currentDailyGoal.status,
    showConfetti,
    openSnackbarWithMessage,
    setUser,
    user,
  ]);

  const formattedUserGold = () => {
    if (user.gold >= 1000000) {
      return (user.gold / 1000000).toFixed(1) + "M";
    } else if (user.gold >= 1000) {
      return (user.gold / 1000).toFixed(1) + "K";
    } else {
      return user.gold.toString();
    }
  };

  return (
    <div className="Footer">
      <span className="Footer__element">
        <img
          className="GamePage__icon"
          src={goldIcon}
          alt="Gold"
          id="Footer__coins"
        />{" "}
        {formattedUserGold()}
      </span>
      {user.currentDailyGoal && (
        <span className="Footer__element">
          <DailyGoalProgressBar
            progress={user.currentDailyGoal.progress}
            target={user.currentDailyGoal.target}
          />
        </span>
      )}
      {currentPage !== "shop" && (
        <span className="Footer__element">
          <Button
            customClassName="Footer__flashmode"
            onClick={() => {
              if (setFlash) {
                setFlash(!isFlashModeOn);
              } else {
                console.error("setFlash function is not provided.");
              }
            }}
            variant={isFlashModeOn ? "secondary" : "primary"}
          >
            <ElectricBoltIcon />
          </Button>
        </span>
      )}
    </div>
  );
};
