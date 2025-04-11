import { useContext, useEffect, useState } from "react";
import bossImage from "../../../images/boss_image_test.png";
import { useUserCards } from "../../../hooks/usercards";
import { PopulatedUserCard } from "../../../types/common";
import { SnackbarContext } from "../../../context/SnackbarContext";
import Card from "../../molecules/Card/Card";
type GameState = "started" | "stopped";

export default () => {
  const [gameState, setGameState] = useState<GameState>("started");
  const [timer, setTimer] = useState<number>(60);
  const [healthPoints, setHealthPoints] = useState<number>(350);
  const { userCards, removeCard } = useUserCards();
  const { openSnackbarWithMessage } = useContext(SnackbarContext);

  useEffect(() => {
    if (gameState === "started") {
      const interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  const onUpdate = async (id: string, interval: number, isCorrect: boolean) => {
    // Remove the card from the list
    removeCard(id);
    if (isCorrect) {
      openSnackbarWithMessage(
        `Score + ${Math.floor(interval).toLocaleString("fr-FR")} !`
      );

      setHealthPoints((prev) => prev - 1);
      if (healthPoints <= 0) {
        openSnackbarWithMessage("Boss defeated !");
        setGameState("stopped");
      }
    }
  };

  return (
    <div>
      {gameState === "stopped" && (
        <div>
          <p>
            To defeat the boss Inflict damage to the boss by playing you cards
            Boss has armor and health points And there is a timer
            <br />
            You can increase timer by buying gears in the shop
          </p>
          <button onClick={() => setGameState("started")}>Start</button>
        </div>
      )}
      {gameState === "started" && (
        <div className="BossPage">
          <div className="BossPage__Boss-part">
            <img src={bossImage} alt="Boss" />
            <h2>Chouettix le malicieux</h2>
            <div className="BossPage__healthbar-container">
              <div className="BossPage__healthbar-background"></div>
              <div
                className="BossPage__healthbar"
                style={{ width: `${healthPoints}%` }}
              ></div>
            </div>

            <p>Armor: 20</p>
            <p>Health Points: {healthPoints}</p>
            <p>Temps restant: {timer}s</p>
            <button onClick={() => setGameState("stopped")}>Stop</button>
          </div>
          <div className="BossPage__Cards-part">
            {userCards.map((userCard: PopulatedUserCard) => (
              <Card
                key={userCard._id}
                card={userCard}
                onUpdate={onUpdate}
                isFlashModeOn={false}
                onEditClick={() => {}}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
