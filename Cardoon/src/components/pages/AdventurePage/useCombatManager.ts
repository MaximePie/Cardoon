import { useCallback, useEffect, useRef, useState } from "react";
import { Enemy, EnemyState, Hero, HeroState } from "./adventure.types";
import {
  applyRegeneration,
  calculateEnemyDamage,
  calculateHeroDamage,
  calculatePenaltyDamage,
  selectRandomEnemy,
} from "./combat.utils";

const ANIMATION_DURATION = 500;
const DEFEAT_ANIMATION_DURATION = 500;
const SPAWN_DELAY = 50;

interface UseCombatManagerParams {
  hero: Hero;
  setHero: React.Dispatch<React.SetStateAction<Hero>>;
  availableEnemies: Enemy[];
  onEnemyDefeated: (enemy: Enemy) => void;
}

/**
 * Hook to manage combat state and animations
 */
export function useCombatManager({
  hero,
  setHero,
  availableEnemies,
  onEnemyDefeated,
}: UseCombatManagerParams) {
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [heroState, setHeroState] = useState<HeroState>("idle");
  const [enemyState, setEnemyState] = useState<EnemyState>("idle");
  const [showDamageAnimation, setShowDamageAnimation] = useState(false);
  const [damageAnimationKey, setDamageAnimationKey] = useState(0);
  const [enemyFinalDamage, setEnemyFinalDamage] = useState(0);

  const heroAttackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enemyAttackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enemyDefeatedTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const enemySpawnTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const damageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize enemy when enemies are loaded
  useEffect(() => {
    if (availableEnemies.length > 0 && !currentEnemy) {
      setCurrentEnemy(
        availableEnemies[Math.floor(Math.random() * availableEnemies.length)]
      );
    }
  }, [availableEnemies, currentEnemy]);

  // Show damage animation when enemy attacks
  useEffect(() => {
    if (enemyState === "attacking") {
      setShowDamageAnimation(true);
      setDamageAnimationKey((prev) => prev + 1);

      if (damageTimeoutRef.current) {
        clearTimeout(damageTimeoutRef.current);
      }

      damageTimeoutRef.current = setTimeout(() => {
        setShowDamageAnimation(false);
      }, DEFEAT_ANIMATION_DURATION);
    }
  }, [enemyState]);

  const spawnNewEnemy = useCallback(() => {
    setEnemyState("idle");

    if (enemySpawnTimeout.current) {
      clearTimeout(enemySpawnTimeout.current);
    }

    enemySpawnTimeout.current = setTimeout(() => {
      const newEnemy = selectRandomEnemy(availableEnemies);
      if (newEnemy) {
        setCurrentEnemy(newEnemy);
      }
    }, SPAWN_DELAY);
  }, [availableEnemies]);

  const handleEnemyDefeat = useCallback(
    (defeatedEnemy: Enemy) => {
      setEnemyState("defeated");

      if (enemyDefeatedTimeout.current) {
        clearTimeout(enemyDefeatedTimeout.current);
      }

      enemyDefeatedTimeout.current = setTimeout(() => {
        onEnemyDefeated(defeatedEnemy);
        spawnNewEnemy();
      }, DEFEAT_ANIMATION_DURATION);
    },
    [onEnemyDefeated, spawnNewEnemy]
  );

  const handleEnemyDefeatRef = useRef(handleEnemyDefeat);

  // Update ref when callback changes
  useEffect(() => {
    handleEnemyDefeatRef.current = handleEnemyDefeat;
  }, [handleEnemyDefeat]);

  // Detect when enemy is defeated
  useEffect(() => {
    if (currentEnemy && currentEnemy.currentHealth <= 0) {
      handleEnemyDefeatRef.current(currentEnemy);
    }
  }, [currentEnemy]);

  const performAttack = useCallback(
    (isCorrect: boolean) => {
      if (!currentEnemy) return;

      setEnemyState("attacking");

      let heroSurvived = true;

      if (isCorrect) {
        setHeroState("attacking");

        if (heroAttackTimeout.current) {
          clearTimeout(heroAttackTimeout.current);
        }
        heroAttackTimeout.current = setTimeout(() => {
          setHeroState("idle");
        }, ANIMATION_DURATION);

        const heroDamage = calculateHeroDamage(hero, currentEnemy);
        const enemyDamage = calculateEnemyDamage(currentEnemy, hero);

        setEnemyFinalDamage(enemyDamage);
        setCurrentEnemy((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            currentHealth: Math.max(0, prev.currentHealth - heroDamage),
          };
        });

        setHero((prev) => {
          const newHealth = Math.max(0, prev.currentHealth - enemyDamage);

          // Check if hero died
          if (newHealth <= 0 && availableEnemies.length > 0) {
            if (heroAttackTimeout.current)
              clearTimeout(heroAttackTimeout.current);
            setHeroState("defeated");
            heroSurvived = false;
          }

          return {
            ...prev,
            currentHealth: newHealth,
          };
        });
      } else {
        const penaltyDamage = calculatePenaltyDamage(currentEnemy, hero);
        setEnemyFinalDamage(penaltyDamage);
        setHero((prev) => {
          const newHealth = Math.max(0, prev.currentHealth - penaltyDamage);

          // Check if hero died
          if (newHealth <= 0 && availableEnemies.length > 0) {
            clearTimeout(heroAttackTimeout.current!);
            setHeroState("defeated");
            heroSurvived = false;
          }

          return {
            ...prev,
            currentHealth: newHealth,
          };
        });
      }

      if (enemyAttackTimeout.current) {
        clearTimeout(enemyAttackTimeout.current);
      }
      enemyAttackTimeout.current = setTimeout(() => {
        setEnemyState("idle");
      }, ANIMATION_DURATION);

      // Apply regeneration only if hero survived
      if (heroSurvived) {
        setHero((prev) => ({
          ...prev,
          currentHealth: applyRegeneration(prev),
        }));
      }
    },
    [currentEnemy, hero, setHero, availableEnemies]
  );

  /**
   * Start a new adventure by resetting states and selecting the first enemy
   * Refill hero's health
   * Reset hero and enemy states to idle
   */
  const startNewAdventure = useCallback(() => {
    if (availableEnemies.length > 0) {
      setHero((prev) => ({ ...prev, currentHealth: prev.maxHealth }));
      setCurrentEnemy(
        availableEnemies[Math.floor(Math.random() * availableEnemies.length)]
      );
      setHeroState("idle");
      setEnemyState("idle");
    }
  }, [availableEnemies, setHero]);

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      if (heroAttackTimeout.current) clearTimeout(heroAttackTimeout.current);
      if (enemyAttackTimeout.current) clearTimeout(enemyAttackTimeout.current);
      if (enemyDefeatedTimeout.current)
        clearTimeout(enemyDefeatedTimeout.current);
      if (enemySpawnTimeout.current) clearTimeout(enemySpawnTimeout.current);
      if (damageTimeoutRef.current) clearTimeout(damageTimeoutRef.current);
    };
  }, []);

  return {
    currentEnemy,
    heroState,
    enemyState,
    showDamageAnimation,
    damageAnimationKey,
    enemyFinalDamage,
    performAttack,
    startNewAdventure,
  };
}
