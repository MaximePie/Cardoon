import FavoriteIcon from "@mui/icons-material/Favorite";
import StarBorderPurple500Icon from "@mui/icons-material/StarBorderPurple500";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import adventureBackground from "../../../assets/adventure-background.svg";
import enemyDefeated from "../../../assets/Enemies/NightBorne_death..gif";
import enemyIdle from "../../../assets/Enemies/NightBorne_idle.gif";
import heroAttack from "../../../assets/Hero/attack1.gif";
import devMode from "../../../assets/Hero/devmode.svg";
import heroIdle from "../../../assets/Hero/idle.gif";
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
  attackDamage: process.env.NODE_ENV === "development" ? 1000 : 25,
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
  const [heroState, setHeroState] = useState<"idle" | "attacking">("idle");
  const [enemyState, setEnemyState] = useState<"idle" | "defeated">("idle");

  const [currentEnemy, setCurrentEnemy] = useState<Enemy>(enemies[0]);

  const { put: updateUserCard, data: updateCardResponse } = usePut<PutResult>(
    ACTIONS.UPDATE_INTERVAL
  );

  const attack = (enemy: Enemy, isCorrect: boolean) => {
    if (isCorrect) {
      // Hero only performs attack animation when answer is correct for visual feedback
      setHeroState("attacking");
      setTimeout(() => {
        setHeroState("idle");
      }, 500);
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
    if (hero.currentHealth <= 0) {
      // Reset hero and enemy
      setHero(baseHero);
      setCurrentEnemy(enemies[0]);
    }
  }, [hero.currentHealth]);

  const onEnemyDefeated = useCallback(() => {
    setEnemyState("defeated");
    setTimeout(() => {
      setEnemyState("idle");
    }, 1000);
    setHero((prev) => ({
      ...prev,
      experience: prev.experience + currentEnemy.experience,
    }));
    // Check for level up
    if (
      hero.experience + currentEnemy.experience >=
      hero.experienceToNextLevel
    ) {
      levelUp();
    }
    // Reset enemy
    setCurrentEnemy(enemies[0]);
  }, [currentEnemy.experience, hero.experience, hero.experienceToNextLevel]);

  useEffect(() => {
    if (currentEnemy.currentHealth <= 0) {
      onEnemyDefeated();
    }
  }, [currentEnemy.currentHealth, onEnemyDefeated]);

  useEffect(() => {
    setCardsInHand(
      reviewUserCards
        .filter((card) => updateCardResponse?.userCard._id !== card._id)
        .slice(0, 5)
    );
  }, [reviewUserCards, updateCardResponse]);

  const levelUp = () => {
    setHero((prev) => ({
      ...prev,
      level: prev.level + 1,
      maxHealth: prev.maxHealth + 20,
      currentHealth: prev.maxHealth + 20,
      attackDamage: prev.attackDamage + 5,
      defense: prev.defense + 2,
      experience: 0,
      experienceToNextLevel: Math.floor(prev.experienceToNextLevel * 1.5),
    }));
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
        <div className="AdventurePage__stats">
          <div className="AdventurePage__stats-resources">
            <span>
              <FavoriteIcon color="error" fontSize="small" />{" "}
              {hero.currentHealth} / {hero.maxHealth}
            </span>
            <span>
              <WhatshotIcon color="error" fontSize="small" />{" "}
              {hero.attackDamage}
            </span>
            <span>
              <StarBorderPurple500Icon color="warning" fontSize="small" />{" "}
              {hero.level}
            </span>
          </div>
          <div className="AdventurePage__stats-level">
            <p>Forêt toxique - Niveau 1</p>
          </div>
          <div className="AdventurePage__stats-expBar">
            <ExpBar
              currentExp={hero.experience}
              maxExp={hero.experienceToNextLevel}
            />
          </div>
        </div>
      </div>
      <div className="AdventurePage__body">
        <div
          className="AdventurePage__background"
          style={{ backgroundImage: `url(${adventureBackground})` }}
        ></div>
        <div className="AdventurePage__characters">
          <motion.div
            className="AdventurePage__Hero"
            initial="idle"
            animate={heroState}
            variants={{
              attacking: { x: [0, 30, 0], transition: { duration: 0.3 } },
              idle: { x: 0 },
            }}
            transition={{ ease: "easeInOut" }}
          >
            <img
              src={heroState === "idle" ? heroIdle : heroAttack}
              alt="Hero Avatar"
              className="AdventurePage__characterImage"
            />
            <p>{hero.name}</p>
            <p>
              HP: {hero.currentHealth} / {hero.maxHealth}{" "}
              <span className="AdventurePage__status">
                {devMode && <img src={devMode} alt="Dev Mode" />}
              </span>
            </p>
            <div className="AdventurePage__healthBar">
              <div
                className="AdventurePage__healthBar__fill"
                style={{
                  width: `${(hero.currentHealth / hero.maxHealth) * 100}%`,
                }}
              ></div>
            </div>
          </motion.div>
          <div className="AdventurePage__Enemy">
            <img
              src={enemyState === "idle" ? enemyIdle : enemyDefeated}
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
