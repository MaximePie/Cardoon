import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdventureContext } from "../../../context/AdventureContext";
import { useUser } from "../../../context/UserContext";
import { ACTIONS, usePut } from "../../../hooks/server";
import { QueryKeys } from "../../../lib/queryClient";
import { PopulatedUserCard, User } from "../../../types/common";
import {
  BonusType,
  DEFAULT_HERO,
  Enemy,
  EnemyType,
  getBonusIcon,
  Hero,
} from "./adventure.types";
import { useCardManager } from "./useCardManager";
import { useCombatManager } from "./useCombatManager";

interface PutResult {
  user: User;
  userCard: PopulatedUserCard;
}

export default function useAdventureGame() {
  const { cards, user } = useUser();
  const { adventureData } = useAdventureContext();
  const queryClient = useQueryClient();

  const reviewUserCards = useMemo(
    () => cards.reviewUserCards.data || [],
    [cards.reviewUserCards.data]
  );

  const baseHero = user.data.hero ?? DEFAULT_HERO;

  const [hero, setHero] = useState<Hero>({
    ...baseHero,
    currentHealth: baseHero.currentHealth ?? baseHero.maxHealth,
    defense: baseHero.defense ?? 0,
    attackDamage: baseHero.attackDamage ?? 1,
  });

  const [bonusAnimation, setBonusAnimation] = useState<{
    type: BonusType;
    amount: number;
  } | null>(null);

  const { put: updateUserCard } = usePut<PutResult>(ACTIONS.UPDATE_INTERVAL);

  const { cardsInHand, removeCardFromHand } = useCardManager(reviewUserCards);

  const handleEnemyDefeated = useCallback(
    (defeatedEnemy: Enemy) => {
      const newExperience = hero.experience + defeatedEnemy.experience;

      const bonusUpdates: Partial<Hero> = {
        experience: newExperience,
      };

      if (defeatedEnemy.bonus.type === "attack") {
        bonusUpdates.attackDamage =
          hero.attackDamage + defeatedEnemy.bonus.amount;
      } else if (defeatedEnemy.bonus.type === "hp") {
        bonusUpdates.maxHealth = hero.maxHealth + defeatedEnemy.bonus.amount;
        bonusUpdates.currentHealth =
          hero.currentHealth + defeatedEnemy.bonus.amount;
      } else if (defeatedEnemy.bonus.type === "regeneration") {
        bonusUpdates.regenerationRate =
          hero.regenerationRate + defeatedEnemy.bonus.amount;
      }

      setHero((prev) => ({ ...prev, ...bonusUpdates }));

      setBonusAnimation({
        type: defeatedEnemy.bonus.type,
        amount: defeatedEnemy.bonus.amount,
      });

      setTimeout(() => {
        setBonusAnimation(null);
      }, 1000);

      user.addHeroBonus({
        type: defeatedEnemy.bonus.type,
        amount: defeatedEnemy.bonus.amount,
      });
    },
    [hero, user]
  );

  const currentLevelEnemies = useMemo(() => {
    if (!adventureData?.levels || adventureData.levels.length === 0) {
      return [];
    }

    const currentLevel = adventureData.levels[0];

    return currentLevel.enemies.map((enemy) => ({
      id: enemy.id as EnemyType,
      name: enemy.name,
      maxHealth: enemy.maxHealth,
      currentHealth: enemy.maxHealth,
      attackDamage: enemy.attackDamage,
      defense: enemy.defense,
      experience: enemy.experience,
      bonus: {
        type: enemy.bonus.type,
        amount: enemy.bonus.amount,
        ...getBonusIcon(enemy.bonus.type),
      },
    }));
  }, [adventureData]);

  const {
    currentEnemy,
    heroState,
    enemyState,
    showDamageAnimation,
    damageAnimationKey,
    enemyFinalDamage,
    performAttack,
  } = useCombatManager({
    hero,
    setHero,
    availableEnemies: currentLevelEnemies,
    onEnemyDefeated: handleEnemyDefeated,
  });

  const attack = useCallback(
    (_enemy: Enemy, isCorrect: boolean) => {
      if (!currentEnemy) return;
      performAttack(isCorrect);
    },
    [currentEnemy, performAttack]
  );

  const removeCard = async (card: PopulatedUserCard, isCorrect: boolean) => {
    if (!currentEnemy) return;

    performAttack(isCorrect);
    removeCardFromHand(card._id);

    try {
      await updateUserCard(card._id, { isCorrectAnswer: isCorrect });

      queryClient.setQueryData(
        QueryKeys.reviewUserCards(user.data?._id),
        (oldCards: PopulatedUserCard[] | undefined) => {
          if (!oldCards) return [];
          return oldCards.filter((c) => c._id !== card._id);
        }
      );
    } catch (error) {
      console.error("Error updating card:", error);
    }
  };

  useEffect(() => {
    if (user.data.hero) {
      setHero({
        ...user.data.hero,
        currentHealth: user.data.hero.currentHealth ?? user.data.hero.maxHealth,
        defense: user.data.hero.defense ?? 0,
      });
    }
  }, [user.data.hero]);

  return {
    cardsInHand,
    hero,
    heroState,
    enemyState,
    currentEnemy,
    attack,
    removeCard,
    bonusAnimation,
    showDamageAnimation,
    damageAnimationKey,
    enemyFinalDamage,
  };
}
