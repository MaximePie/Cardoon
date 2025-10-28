import { useEffect, useState } from "react";
import enemy from "../../../assets/Enemies/NightBorne_idle.gif";
import { useUser } from "../../../hooks/contexts/useUser";
import { ACTIONS, usePut } from "../../../hooks/server";
import { PopulatedUserCard, User } from "../../../types/common";
import Card from "../../molecules/Card/Card";
interface PutResult {
  user: User;
  userCard: PopulatedUserCard;
}

interface Enemy {
  name: string;
  maxHealth: number;
  currentHealth: number;
  attackDamage: number;
  defense: number;
}

const enemies = [
  {
    name: "Night Borne",
    maxHealth: 100,
    currentHealth: 100,
    attackDamage: 15,
    defense: 5,
  },
  // Ajoutez plus d'ennemis ici si nécessaire
];

const hero = {
  name: "Hero",
  maxHealth: 120,
  currentHealth: 120,
  attackDamage: 20,
  defense: 10,
  attack(enemy: Enemy, isCorrect: boolean) {
    if (isCorrect) {
      const heroDamange = Math.max(0, this.attackDamage - enemy.defense);
      const enemyDamage = Math.max(0, enemy.attackDamage - this.defense);
      enemy.currentHealth = Math.max(0, enemy.currentHealth - heroDamange);
      this.currentHealth = Math.max(0, this.currentHealth - enemyDamage);
    } else {
      const damage = Math.max(0, enemy.attackDamage - this.defense);
      this.currentHealth = Math.max(0, this.currentHealth - damage * 1.5);
    }
  },
};

const AdventurePage = () => {
  const { reviewUserCards, getReviewUserCards } = useUser();
  const [cardsInHand, setCardsInHand] = useState<PopulatedUserCard[]>(
    reviewUserCards.slice(0, 5)
  );

  const [currentEnemy] = useState<Enemy>(enemies[0]);

  const { put: updateUserCard, data: updateCardResponse } = usePut<PutResult>(
    ACTIONS.UPDATE_INTERVAL
  );

  useEffect(() => {
    setCardsInHand(
      reviewUserCards
        .filter((card) => updateCardResponse?.userCard._id !== card._id)
        .slice(0, 5)
    );
  }, [reviewUserCards, updateCardResponse]);

  const removeCard = (card: PopulatedUserCard, isCorrect: boolean) => {
    hero.attack(currentEnemy, isCorrect);
    updateUserCard(card._id, { isCorrectAnswer: isCorrect });
    setCardsInHand((prev) => prev.filter((c) => c._id !== card._id));
    getReviewUserCards();
  };
  return (
    <div>
      <h1>Adventure Page</h1>
      <p>
        Bienvenue, valeureux aventurier ! Prête à devenir une héroïne ? Allons-y
        !
      </p>
      <div className="AdventurePage__characters">
        <div className="AdventurePage__background"></div>
        <div className="AdventurePage__Hero">
          <img src="https://picsum.photos/200" alt="Hero Avatar" />
          <div className="AdventurePage__healthBar">
            <div
              className="AdventurePage__healthBar__fill"
              style={{
                width: `${(hero.currentHealth / hero.maxHealth) * 100}%`,
              }}
            ></div>
          </div>
        </div>
        <div className="AdventurePage__Enemy">
          <img src={enemy} alt="Idle Enemy" />
          <div className="AdventurePage__healthBar">
            <div
              className="AdventurePage__healthBar__fill"
              style={{
                width: `${(currentEnemy.currentHealth / currentEnemy.maxHealth) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
      <div className="AdventurePage__Cards">
        {cardsInHand.map((userCard: PopulatedUserCard) => (
          <Card
            key={userCard._id}
            card={userCard}
            onUpdate={removeCard}
            isFlashModeOn={false}
            onEditClick={() => {}}
          />
        ))}
      </div>
    </div>
  );
};

export default AdventurePage;
