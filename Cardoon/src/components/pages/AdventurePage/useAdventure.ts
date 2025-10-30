import { useCallback, useEffect, useState } from "react";
import { useUser } from "../../../context/UserContext";
import { ACTIONS, usePut } from "../../../hooks/server";
import { PopulatedUserCard, User } from "../../../types/common";
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

export default function useAdventure() {
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
  return {
    cardsInHand,
    hero,
    heroState,
    enemyState,
    currentEnemy,
    attack,
    levelUp,
    removeCard,
  };
}
