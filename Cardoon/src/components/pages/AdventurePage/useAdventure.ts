import FavoriteIcon from "@mui/icons-material/Favorite";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import { SvgIconProps } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "../../../context/UserContext";
import { ACTIONS, usePut } from "../../../hooks/server";
import { QueryKeys } from "../../../lib/queryClient";
import { PopulatedUserCard, User } from "../../../types/common";
interface PutResult {
  user: User;
  userCard: PopulatedUserCard;
}

export type EnemyType = "NightBorne" | "Skeleton";

interface Enemy {
  id: EnemyType;
  name: string;
  maxHealth: number;
  currentHealth: number;
  attackDamage: number;
  defense: number;
  experience: number; // Given exp when defeated
  bonus: {
    type: "hp" | "attack" | "regeneration";
    amount: number;
    icon: React.ComponentType<SvgIconProps>;
    iconColor: SvgIconProps["color"];
  };
}

const enemies: Enemy[] = [
  {
    id: "NightBorne",
    name: "Night Borne",
    maxHealth: 5,
    currentHealth: 5,
    attackDamage: 2,
    defense: 0,
    experience: 50,
    bonus: {
      type: "hp",
      amount: 1,
      icon: FavoriteIcon,
      iconColor: "primary",
    },
  },
  {
    id: "NightBorne",
    name: "Night Borne",
    maxHealth: 5,
    currentHealth: 5,
    attackDamage: 2,
    defense: 0,
    experience: 50,
    bonus: {
      type: "regeneration",
      amount: 1,
      icon: HealthAndSafetyIcon,
      iconColor: "success",
    },
  },
  {
    id: "NightBorne",
    name: "Night Borne",
    maxHealth: 5,
    currentHealth: 5,
    attackDamage: 2,
    defense: 0,
    experience: 50,
    bonus: {
      type: "attack",
      amount: 1,
      icon: WhatshotIcon,
      iconColor: "error",
    },
  },
  {
    id: "Skeleton",
    name: "Skeleton",
    maxHealth: 13,
    currentHealth: 13,
    attackDamage: 3,
    defense: 0,
    experience: 75,
    bonus: {
      type: "attack",
      amount: 1,
      icon: WhatshotIcon,
      iconColor: "error",
    },
  },
  // Ajoutez plus d'ennemis ici si nécessaire
];

interface Hero {
  maxHealth: number;
  currentHealth: number;
  regenerationRate: number;
  attackDamage: number;
  defense: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
}

export default function useAdventure() {
  const { cards, user } = useUser();
  const queryClient = useQueryClient();
  const reviewUserCards = useMemo(
    () => cards.reviewUserCards.data || [],
    [cards.reviewUserCards.data]
  );

  // Safe default hero object to prevent crashes if user.data.hero is missing
  const defaultHero: Hero = {
    maxHealth: 120,
    currentHealth: 120,
    regenerationRate: 0,
    attackDamage: 2,
    defense: 0,
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
  };

  const baseHero = user.data.hero ?? defaultHero;

  const [bonusAnimation, setBonusAnimation] = useState<{
    type: "hp" | "attack" | "regeneration";
    amount: number;
  } | null>(null);
  const [cardsInHand, setCardsInHand] = useState<PopulatedUserCard[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hero, setHero] = useState<Hero>({
    ...baseHero,
    currentHealth: baseHero.currentHealth ?? baseHero.maxHealth,
    defense: baseHero.defense ?? 0,
  });
  const [heroState, setHeroState] = useState<"idle" | "attacking">("idle");
  const [enemyState, setEnemyState] = useState<"idle" | "defeated">("idle");

  const [currentEnemy, setCurrentEnemy] = useState<Enemy>(enemies[0]);

  // Refs to store timeout IDs for cleanup
  const heroAttackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enemyDefeatedTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const { put: updateUserCard } = usePut<PutResult>(ACTIONS.UPDATE_INTERVAL);

  const attack = (enemy: Enemy, isCorrect: boolean) => {
    if (isCorrect) {
      // Hero only performs attack animation when answer is correct for visual feedback
      setHeroState("attacking");
      // Clear any existing timeout
      if (heroAttackTimeout.current) {
        clearTimeout(heroAttackTimeout.current);
      }
      heroAttackTimeout.current = setTimeout(() => {
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
    setHero((prev) => ({
      ...prev,
      currentHealth: Math.min(
        prev.maxHealth,
        prev.currentHealth + prev.regenerationRate
      ),
    }));
  };

  // Loose condition
  useEffect(() => {
    if (hero.currentHealth <= 0) {
      // Reset hero and enemy
      setHero({
        ...baseHero,
        currentHealth: baseHero.maxHealth,
        defense: baseHero.defense ?? 0,
      });
      setCurrentEnemy(enemies[0]);
    }
  }, [hero.currentHealth, baseHero]);
  const onEnemyDefeated = useCallback(() => {
    setEnemyState("defeated");
    // Clear any existing timeout
    if (enemyDefeatedTimeout.current) {
      clearTimeout(enemyDefeatedTimeout.current);
    }
    enemyDefeatedTimeout.current = setTimeout(() => {
      setEnemyState("idle");
    }, 1000);

    const newExperience = hero.experience + currentEnemy.experience;

    // Apply bonus based on type
    const bonusUpdates: Partial<Hero> = {
      experience: newExperience,
    };

    if (currentEnemy.bonus.type === "attack") {
      bonusUpdates.attackDamage = hero.attackDamage + currentEnemy.bonus.amount;
    } else if (currentEnemy.bonus.type === "hp") {
      bonusUpdates.maxHealth = hero.maxHealth + currentEnemy.bonus.amount;
      bonusUpdates.currentHealth =
        hero.currentHealth + currentEnemy.bonus.amount;
    } else if (currentEnemy.bonus.type === "regeneration") {
      bonusUpdates.regenerationRate =
        hero.regenerationRate + currentEnemy.bonus.amount;
    }

    setHero((prev) => ({ ...prev, ...bonusUpdates }));

    // Trigger bonus animation
    setBonusAnimation({
      type: currentEnemy.bonus.type,
      amount: currentEnemy.bonus.amount,
    });

    setTimeout(() => {
      setBonusAnimation(null);
    }, 1000);

    // Check for level up
    if (newExperience >= hero.experienceToNextLevel) {
      levelUp();
    }
    // Reset enemy
    setCurrentEnemy(enemies[Math.floor(Math.random() * enemies.length)]);

    // 🎮 Envoyer le bonus au serveur
    user.addHeroBonus({
      type: currentEnemy.bonus.type,
      amount: currentEnemy.bonus.amount,
    });
  }, [
    currentEnemy.experience,
    currentEnemy.bonus.amount,
    currentEnemy.bonus.type,
    hero,
    user,
  ]);

  useEffect(() => {
    if (currentEnemy.currentHealth <= 0) {
      onEnemyDefeated();
    }
  }, [currentEnemy.currentHealth, onEnemyDefeated]);

  const syncCards = useCallback(() => {
    if (reviewUserCards.length === 0) return;

    // Initialisation une seule fois
    if (!isInitialized) {
      setCardsInHand(reviewUserCards.slice(0, 5));
      setIsInitialized(true);
      return;
    }

    // Ajouter des cartes seulement si on en a moins de 5
    setCardsInHand((currentCards) => {
      if (currentCards.length >= 5) return currentCards;

      const currentCardIds = new Set(currentCards.map((c) => c._id));
      const availableCards = reviewUserCards.filter(
        (card) => !currentCardIds.has(card._id)
      );

      if (availableCards.length > 0) {
        const cardsToAdd = availableCards.slice(0, 5 - currentCards.length);
        return [...currentCards, ...cardsToAdd];
      }

      return currentCards;
    });
  }, [reviewUserCards, isInitialized]);

  // Déclencher la synchronisation quand les données changent
  useEffect(() => {
    syncCards();
  }, [syncCards]);

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

  const removeCard = async (card: PopulatedUserCard, isCorrect: boolean) => {
    attack(currentEnemy, isCorrect);

    setCardsInHand((prev) => {
      // 1. Enlever la carte supprimée
      const remainingCards = prev.filter((c) => c._id !== card._id);

      // 2. Trouver les cartes disponibles (pas déjà en main)
      const currentCardIds = new Set(remainingCards.map((c) => c._id));
      const availableCards = reviewUserCards.filter(
        (availableCard) =>
          !currentCardIds.has(availableCard._id) &&
          availableCard._id !== card._id
      );

      // 3. Ajouter une nouvelle carte si disponible
      if (availableCards.length > 0 && remainingCards.length < 5) {
        const newCard = availableCards[0]; // Prendre la première carte disponible
        return [...remainingCards, newCard];
      }

      return remainingCards;
    });

    try {
      // Mettre à jour sur le serveur
      await updateUserCard(card._id, { isCorrectAnswer: isCorrect });

      // 🚀 SOLUTION: Mise à jour optimiste du cache sans refetch
      // Retirer la carte du cache local des reviewUserCards car elle ne doit plus apparaître
      queryClient.setQueryData(
        QueryKeys.reviewUserCards(user.data?._id),
        (oldCards: PopulatedUserCard[] | undefined) => {
          if (!oldCards) return [];
          // Filtrer la carte qui vient d'être mise à jour
          return oldCards.filter((c) => c._id !== card._id);
        }
      );

      console.log("🎯 Card removed from reviewUserCards cache optimistically");
    } catch (error) {
      console.error("🎯 Error updating card:", error);
      // En cas d'erreur, on pourrait restaurer le cache, mais pour l'instant on laisse comme ça
    }
  };

  // Cleanup timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (heroAttackTimeout.current) {
        clearTimeout(heroAttackTimeout.current);
      }
      if (enemyDefeatedTimeout.current) {
        clearTimeout(enemyDefeatedTimeout.current);
      }
    };
  }, []);

  return {
    cardsInHand,
    hero,
    heroState,
    enemyState,
    currentEnemy,
    attack,
    levelUp,
    removeCard,
    bonusAnimation,
  };
}
