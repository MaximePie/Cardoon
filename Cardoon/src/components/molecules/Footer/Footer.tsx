import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import Button from "../../atoms/Button/Button";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../context/UserContext";
import goldIcon from "../../../images/coin.png";
import { SnackbarContext } from "../../../context/SnackbarContext";
import { useWindowSize } from "@uidotdev/usehooks";
import { ConfettiContext } from "../../../App";

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
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    const todayDateString = new Date().toISOString().split("T")[0];
    const isAlreadyCompletedToday =
      user.currentDailyGoal &&
      user.currentDailyGoal.closedAt.split("T")[0] === todayDateString;
    console.log(user.currentDailyGoal.closedAt.split("T")[0]);
    console.log(todayDateString);
    if (progress >= target && !isAlreadyCompletedToday) {
      showConfetti();
      const questReward = user.currentGoldMultiplier * 100 * user.streak;
      openSnackbarWithMessage(
        `Bravo ! Vous avez atteint votre objectif quotidien. Vous avez gagné ${questReward} pièces d'or !`
      );
      setUser({
        ...user,
        gold: user.gold + questReward,
      });
    }
  }, [progress, target]);

  const progressPercentage = (progress / target) * 100;
  const fillClassName = `Footer__progress-bar__fill ${
    progressPercentage >= 100 ? "Footer__progress-bar__fill--completed" : ""
  }`;
  return (
    <>
      <span className="Footer__progress-bar__title">Objectif quotidien</span>
      <div className="Footer__progress-bar">
        <span className="Footer__progress-bar__text">
          {progress} / {target}
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
  const { user } = useContext(UserContext);
  const { setFlash, isFlashModeOn, currentPage } = props;
  return (
    <div className="Footer">
      <span className="Footer__element">
        <img
          className="GamePage__icon"
          src={goldIcon}
          alt="Gold"
          id="Footer__coins"
        />{" "}
        {user.gold || 0}
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
