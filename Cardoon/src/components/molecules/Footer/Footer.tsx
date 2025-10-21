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
  const previousProgress = useRef(user.currentDailyGoal?.status || "PENDING");
  console.log(user);

  useEffect(() => {
    // Vérifications de sécurité pour éviter les erreurs undefined
    if (!user?.currentDailyGoal) return;

    const shouldShowConfetti =
      progress >= target &&
      previousProgress.current === "PENDING" &&
      user.currentDailyGoal.status === "COMPLETED";
    if (shouldShowConfetti) {
      showConfetti();
      const questReward =
        (user.currentGoldMultiplier ?? 1) *
        10 *
        (user.streak ?? 1) *
        (user.dailyGoal ?? 1);
      openSnackbarWithMessage(
        `Bravo ! Vous avez atteint votre objectif quotidien. Vous avez gagné ${questReward} pièces d'or !`
      );
      setUser({
        ...user,
        gold: (user.gold ?? 0) + questReward,
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
  const previousStatus = useRef(user.currentDailyGoal?.status || "PENDING");

  useEffect(() => {
    // Vérifications de sécurité pour éviter les erreurs undefined
    if (!user?.currentDailyGoal) return;

    if (
      previousStatus.current === "PENDING" &&
      user.currentDailyGoal.status === "COMPLETED"
    ) {
      showConfetti();
      const questReward =
        (user.currentGoldMultiplier ?? 1) *
        10 *
        (user.streak ?? 1) *
        (user.dailyGoal ?? 1);
      openSnackbarWithMessage(
        `Bravo ! Vous avez atteint votre objectif quotidien. Vous avez gagné ${questReward} pièces d'or !`
      );
      setUser({
        ...user,
        gold: (user.gold ?? 0) + questReward,
      });
    }
    previousStatus.current = user.currentDailyGoal?.status || "PENDING";
  }, [
    user.currentDailyGoal?.status,
    showConfetti,
    openSnackbarWithMessage,
    setUser,
    user,
  ]);

  const formattedUserGold = () => {
    // Vérification de sécurité pour éviter l'erreur undefined
    const goldAmount = user?.gold ?? 0;

    if (goldAmount >= 1000000) {
      return (goldAmount / 1000000).toFixed(1) + "M";
    } else if (goldAmount >= 1000) {
      return (goldAmount / 1000).toFixed(1) + "K";
    } else {
      return goldAmount.toString();
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
      {user?.currentDailyGoal && (
        <span className="Footer__element">
          <DailyGoalProgressBar
            progress={user.currentDailyGoal.progress ?? 0}
            target={user.currentDailyGoal.target ?? 1}
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
