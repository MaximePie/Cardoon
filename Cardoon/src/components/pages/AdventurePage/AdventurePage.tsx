import FavoriteIcon from "@mui/icons-material/Favorite";
import StarBorderPurple500Icon from "@mui/icons-material/StarBorderPurple500";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import { useEffect, useState } from "react";
import enemy from "../../../assets/Enemies/NightBorne_idle.gif";
import { useUser } from "../../../hooks/contexts/useUser";
import { ACTIONS, usePut } from "../../../hooks/server";
import { PopulatedUserCard, User } from "../../../types/common";
import ExpBar from "../../atoms/ExpBar/ExpBar";
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
  experience: number; // Given exp when defeated
}

const enemies = [
  {
    name: "Night Borne",
    maxHealth: 100,
    currentHealth: 100,
    attackDamage: 15,
    defense: 5,
    experience: 50,
  },
  // Ajoutez plus d'ennemis ici si nécessaire
];

interface Hero {
  name: string;
  maxHealth: number;
  currentHealth: number;
  attackDamage: number;
  defense: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
}

const baseHero = {
  name: "Hero",
  maxHealth: 120,
  currentHealth: 120,
  attackDamage: 20,
  defense: 10,
  level: 1,
  experience: 0,
  experienceToNextLevel: 100,
};

const AdventurePage = () => {
  const { reviewUserCards, getReviewUserCards } = useUser();
  const [cardsInHand, setCardsInHand] = useState<PopulatedUserCard[]>(
    reviewUserCards.slice(0, 5)
  );
  const [hero, setHero] = useState<Hero>(baseHero);

  const [currentEnemy, setCurrentEnemy] = useState<Enemy>(enemies[0]);

  const { put: updateUserCard, data: updateCardResponse } = usePut<PutResult>(
    ACTIONS.UPDATE_INTERVAL
  );

  const attack = (enemy: Enemy, isCorrect: boolean) => {
    if (isCorrect) {
      const heroDamange = Math.max(0, hero.attackDamage - enemy.defense);
      const enemyDamage = Math.max(0, enemy.attackDamage - hero.defense);
      setCurrentEnemy((prev) => ({
        ...prev,
        currentHealth: Math.max(0, prev.currentHealth - heroDamange),
      }));
      setHero((prev) => ({
        ...prev,
        currentHealth: Math.max(0, prev.currentHealth - enemyDamage),
      }));
    } else {
      const damage = Math.max(0, enemy.attackDamage - hero.defense);
      setHero((prev) => ({
        ...prev,
        currentHealth: Math.max(0, prev.currentHealth - damage * 1.5),
      }));
    }
  };

  useEffect(() => {
    setCardsInHand(
      reviewUserCards
        .filter((card) => updateCardResponse?.userCard._id !== card._id)
        .slice(0, 5)
    );
  }, [reviewUserCards, updateCardResponse]);

  const onEnemyDefeated = () => {
    alert("Vous avez vaincu l'ennemi !");
    currentEnemy.currentHealth = currentEnemy.maxHealth;
    hero.currentHealth = hero.maxHealth;
  };

  const removeCard = (card: PopulatedUserCard, isCorrect: boolean) => {
    attack(currentEnemy, isCorrect);
    if (currentEnemy.currentHealth <= 0) {
      onEnemyDefeated();
    }
    updateUserCard(card._id, { isCorrectAnswer: isCorrect });
    setCardsInHand((prev) => prev.filter((c) => c._id !== card._id));
    getReviewUserCards();
  };
  return (
    <div>
      <div className="AdventurePage__profile">
        <p>
          Bienvenue, valeureux aventurier ! Prête à devenir une héroïne ?
          Allons-y !
        </p>
        <div className="AdventurePage__stats">
          <FavoriteIcon color="error" fontSize="small" /> {hero.currentHealth} /{" "}
          {hero.maxHealth} &nbsp; &nbsp;
          {hero.attackDamage} <WhatshotIcon color="error" fontSize="small" />
          <StarBorderPurple500Icon color="warning" fontSize="small" />
          {hero.level}
          <ExpBar
            currentExp={hero.experience}
            maxExp={hero.experienceToNextLevel}
          />
        </div>
      </div>
      <div className="AdventurePage__body">
        <div className="AdventurePage__characters">
          <div className="AdventurePage__background"></div>
          <div className="AdventurePage__Hero">
            <img
              src="https://picsum.photos/200"
              alt="Hero Avatar"
              className="AdventurePage__characterImage"
            />
            <p>{hero.name}</p>
            <p>
              HP: {hero.currentHealth} / {hero.maxHealth}
            </p>
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
            <img
              src={enemy}
              alt="Idle Enemy"
              className="AdventurePage__characterImage"
            />
            <p>{currentEnemy.name}</p>
            <p>
              HP: {currentEnemy.currentHealth} / {currentEnemy.maxHealth}
            </p>
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
    </div>
  );
};

export default AdventurePage;
