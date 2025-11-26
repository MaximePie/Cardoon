import FavoriteIcon from "@mui/icons-material/Favorite";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import { SvgIconProps } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAdventureContext } from "../../../context/AdventureContext";
import { useUser } from "../../../context/UserContext";
import { ACTIONS, usePut } from "../../../hooks/server";
import { QueryKeys } from "../../../lib/queryClient";
import { PopulatedUserCard, User } from "../../../types/common";
interface PutResult {
  user: User;
  userCard: PopulatedUserCard;
}

export type EnemyType = "NightBorne" | "Skeleton" | "Goblin";

interface Enemy {
  id: EnemyType;
  name: string;
  maxHealth: number;
  currentHealth: number;
  attackDamage: number;
  defense: number;
  experience: number; // Given exp when defeated
  bonus: {
    type: "hp" | "attack" | "regeneration" | "defense";
    amount: number;
    icon: React.ComponentType<SvgIconProps>;
    iconColor: SvgIconProps["color"];
  };
}

// Helper function to get icon and color for bonus type
const getBonusIcon = (type: "hp" | "attack" | "regeneration" | "defense") => {
  switch (type) {
    case "hp":
      return { icon: FavoriteIcon, iconColor: "primary" as const };
    case "attack":
      return { icon: WhatshotIcon, iconColor: "error" as const };
    case "regeneration":
      return { icon: HealthAndSafetyIcon, iconColor: "success" as const };
    case "defense":
      return { icon: HealthAndSafetyIcon, iconColor: "info" as const };
  }
};

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

export default function useAdventureGame() {
  const { cards, user } = useUser();
  const { adventureData } = useAdventureContext();

  const queryClient = useQueryClient();
  const reviewUserCards = useMemo(
    () => cards.reviewUserCards.data || [],
    [cards.reviewUserCards.data]
  );

  // Get current level enemies from adventure data
  // For now, use the first level (Dark Forest) - later can be based on user progress
  const currentLevelEnemies = useMemo(() => {
    if (!adventureData?.levels || adventureData.levels.length === 0) {
      return [];
    }

    // Find the first unlocked level or default to first level
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
    type: "hp" | "attack" | "regeneration" | "defense";
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
  const [enemyState, setEnemyState] = useState<
    "idle" | "attacking" | "defeated"
  >("idle");

  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);

  // Refs to store timeout IDs for cleanup
  const heroAttackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enemyAttackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enemyDefeatedTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const enemySpawnTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { put: updateUserCard } = usePut<PutResult>(ACTIONS.UPDATE_INTERVAL);

  const attack = (enemy: Enemy, isCorrect: boolean) => {
    if (!currentEnemy) return;

    if (isCorrect) {
      // Hero only performs attack animation when answer is correct for visual feedback
      setHeroState("attacking");
      setEnemyState("attacking");
      // Clear any existing timeout
      if (heroAttackTimeout.current) {
        clearTimeout(heroAttackTimeout.current);
      }
      heroAttackTimeout.current = setTimeout(() => {
        setHeroState("idle");
      }, 500);

      if (enemyAttackTimeout.current) {
        clearTimeout(enemyAttackTimeout.current);
      }
      enemyAttackTimeout.current = setTimeout(() => {
        setEnemyState("idle");
      }, 500);

      const heroDamange = Math.max(0, hero.attackDamage - enemy.defense);
      const enemyDamage = Math.max(0, enemy.attackDamage - hero.defense);
      setCurrentEnemy((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentHealth: Math.max(0, prev.currentHealth - heroDamange),
        };
      });
      setHero((prev) => ({
        ...prev,
        currentHealth: prev.currentHealth - enemyDamage,
      }));
    } else {
      const damage = enemy.attackDamage - hero.defense;
      setHero((prev) => ({
        ...prev,
        currentHealth: prev.currentHealth - damage * 1.5,
      }));
    }
    if (hero.currentHealth > 0) {
      setHero((prev) => ({
        ...prev,
        currentHealth: Math.min(
          prev.maxHealth,
          prev.currentHealth + prev.regenerationRate
        ),
      }));
    }
  };

  // Initialize enemy when enemies are loaded
  useEffect(() => {
    if (currentLevelEnemies.length > 0 && !currentEnemy) {
      setCurrentEnemy(currentLevelEnemies[0]);
    }
  }, [currentLevelEnemies, currentEnemy]);

  // Lose condition
  useEffect(() => {
    if (hero.currentHealth <= 0 && currentLevelEnemies.length > 0) {
      // Reset ONLY health, keep all accumulated bonuses (maxHealth, attack, etc.)
      setHero((prev) => ({
        ...prev,
        currentHealth: prev.maxHealth, // Use current maxHealth (which includes bonuses)
      }));
      setCurrentEnemy(currentLevelEnemies[0]);
    }
  }, [hero.currentHealth, currentLevelEnemies]);

  const onEnemyDefeated = useCallback(() => {
    if (!currentEnemy) return;

    // Capture enemy data before state changes
    const defeatedEnemy = currentEnemy;

    setEnemyState("defeated");
    // Clear any existing timeout
    if (enemyDefeatedTimeout.current) {
      clearTimeout(enemyDefeatedTimeout.current);
    }
    enemyDefeatedTimeout.current = setTimeout(() => {
      const newExperience = hero.experience + defeatedEnemy.experience;

      // Apply bonus based on type
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

      // Trigger bonus animation
      setBonusAnimation({
        type: defeatedEnemy.bonus.type,
        amount: defeatedEnemy.bonus.amount,
      });

      setTimeout(() => {
        setBonusAnimation(null);
      }, 1000);

      // 🎮 Envoyer le bonus au serveur
      user.addHeroBonus({
        type: defeatedEnemy.bonus.type,
        amount: defeatedEnemy.bonus.amount,
      });

      // Reset enemy state to idle first, then pick new enemy
      setEnemyState("idle");

      // Small delay to ensure state is settled before changing enemy
      if (enemySpawnTimeout.current) {
        clearTimeout(enemySpawnTimeout.current);
      }
      enemySpawnTimeout.current = setTimeout(() => {
        if (currentLevelEnemies.length > 0) {
          const randomEnemy =
            currentLevelEnemies[
              Math.floor(Math.random() * currentLevelEnemies.length)
            ];
          setCurrentEnemy(randomEnemy);
        }
      }, 50);
    }, 1000);
  }, [currentEnemy, currentLevelEnemies, hero, user]);
  useEffect(() => {
    if (currentEnemy && currentEnemy.currentHealth <= 0) {
      onEnemyDefeated();
    }
  }, [currentEnemy, onEnemyDefeated]);

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

  const removeCard = async (card: PopulatedUserCard, isCorrect: boolean) => {
    if (!currentEnemy) return;

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

  useEffect(() => {
    if (user.data.hero) {
      setHero({
        ...user.data.hero,
        currentHealth: user.data.hero.currentHealth ?? user.data.hero.maxHealth,
        defense: user.data.hero.defense ?? 0,
      });
    }
  }, [user.data.hero]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (heroAttackTimeout.current) clearTimeout(heroAttackTimeout.current);
      if (enemyAttackTimeout.current) clearTimeout(enemyAttackTimeout.current);
      if (enemyDefeatedTimeout.current)
        clearTimeout(enemyDefeatedTimeout.current);
      if (enemySpawnTimeout.current) clearTimeout(enemySpawnTimeout.current);
    };
  }, []);

  return {
    cardsInHand,
    hero,
    heroState,
    enemyState,
    currentEnemy,
    attack,
    removeCard,
    bonusAnimation,
  };
}
