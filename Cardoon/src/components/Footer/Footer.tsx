import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import Button from "../atoms/Button/Button";
import { useContext } from "react";
import { UserContext } from "../../context/UserContext";
import goldIcon from "../../images/coin.png";

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
  const progressPercentage = (progress / target) * 100;
  const fillClassName = `GamePage__footer__progress-bar__fill ${
    progressPercentage >= 100
      ? "GamePage__footer__progress-bar__fill--completed"
      : ""
  }`;
  return (
    <>
      <span className="GamePage__footer__progress-bar__title">
        Objectif quotidien
      </span>
      <div className="GamePage__footer__progress-bar">
        <span className="GamePage__footer__progress-bar__text">
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
    <div className="GamePage__footer">
      <span className="GamePage__footer__element">
        <img
          className="GamePage__icon"
          src={goldIcon}
          alt="Gold"
          id="GamePage__footer__coins"
        />{" "}
        {user.gold || 0}
      </span>
      {user.currentDailyGoal && (
        <span className="GamePage__footer__element">
          <DailyGoalProgressBar
            progress={user.currentDailyGoal.progress}
            target={user.currentDailyGoal.target}
          />
        </span>
      )}
      {currentPage !== "shop" && (
        <span className="GamePage__footer__element">
          <Button
            customClassName="GamePage__footer__flashmode"
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
