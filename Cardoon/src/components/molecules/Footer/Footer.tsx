import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { ConfettiContext } from "../../../context/ConfettiContext/ConfettiContext";
import { SnackbarContext } from "../../../context/SnackbarContext";
import { useUser } from "../../../context/UserContext/useUserContext";
import goldIcon from "../../../images/coin.png";
import { formattedNumber } from "../../../utils/numbers";
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
  const lastProcessedGoal = useRef<string | null>(null);
  const isInitialMount = useRef(true);
  const previousStatus = useRef<string | null>(null);

  // Mémoriser les valeurs importantes pour éviter les re-calculs
  const goalTrackingData = useMemo(
    () => ({
      userId: user._id,
      status: user?.currentDailyGoal?.status,
      closedAt: user?.currentDailyGoal?.closedAt,
      multiplier: user.currentGoldMultiplier ?? 1,
      streak: user.streak ?? 1,
      dailyGoal: user.dailyGoal ?? 1,
      currentGold: user.gold ?? 0,
    }),
    [
      user._id,
      user?.currentDailyGoal?.status,
      user?.currentDailyGoal?.closedAt,
      user.currentGoldMultiplier,
      user.streak,
      user.dailyGoal,
      user.gold,
    ]
  );

  // Fonction stabilisée pour gérer la récompense
  const handleReward = useCallback(
    (questReward: number) => {
      showConfetti();
      openSnackbarWithMessage(
        `Bravo ! Vous avez atteint votre objectif quotidien. Vous avez gagné ${questReward} pièces d'or !`
      );

      setUser({
        ...user,
        gold: (user.gold ?? 0) + questReward,
      });
    },
    [user, showConfetti, openSnackbarWithMessage, setUser]
  );

  useEffect(() => {
    // Vérifications de sécurité pour éviter les erreurs undefined
    if (!user?.currentDailyGoal) return;

    const currentStatus = goalTrackingData.status;

    // Si c'est le montage initial, on enregistre juste le statut actuel sans déclencher de récompense
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousStatus.current = currentStatus;

      // Si le goal est déjà complété au montage, on le marque comme déjà traité
      if (currentStatus === "COMPLETED" && progress >= target) {
        const goalCompletionId = `${goalTrackingData.userId}-${goalTrackingData.closedAt}-${currentStatus}`;
        lastProcessedGoal.current = goalCompletionId;
      }
      return;
    }

    // Create unique ID for this specific goal completion
    const goalCompletionId = `${goalTrackingData.userId}-${goalTrackingData.closedAt}-${currentStatus}`;

    // Only trigger if:
    // 1. Progress meets target
    // 2. Status is COMPLETED
    // 3. We haven't processed this exact completion before
    // 4. Le statut a vraiment changé (pas juste un re-render)
    const statusChanged = previousStatus.current !== currentStatus;
    const shouldTriggerReward =
      progress >= target &&
      currentStatus === "COMPLETED" &&
      lastProcessedGoal.current !== goalCompletionId &&
      statusChanged && // Nouveau: s'assurer que c'est un vrai changement
      previousStatus.current === "PENDING"; // Nouveau: vérifier qu'on venait bien de PENDING

    if (shouldTriggerReward) {
      // Mark this completion as processed to prevent re-execution
      lastProcessedGoal.current = goalCompletionId;

      const questReward =
        goalTrackingData.multiplier *
        10 *
        goalTrackingData.streak *
        goalTrackingData.dailyGoal;

      handleReward(questReward);
    }

    // Toujours mettre à jour le statut précédent
    previousStatus.current = currentStatus;

    // Reset when a new day starts (status goes back to PENDING)
    if (currentStatus === "PENDING") {
      lastProcessedGoal.current = null;
    }
  }, [
    progress,
    target,
    goalTrackingData,
    handleReward,
    user?.currentDailyGoal, // Ajouté pour satisfaire ESLint
  ]);

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
    return; // Temporarly disabled
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

  return (
    <div className="Footer">
      <span className="Footer__element">
        <img
          className="GamePage__icon"
          src={goldIcon}
          alt="Gold"
          id="Footer__coins"
        />{" "}
        {formattedNumber(user?.gold || 0)}
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
            variant={isFlashModeOn ? "secondary" : undefined}
          >
            <ElectricBoltIcon />
          </Button>
        </span>
      )}
    </div>
  );
};
