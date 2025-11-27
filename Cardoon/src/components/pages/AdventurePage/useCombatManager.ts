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
const DEFEAT_ANIMATION_DURATION = 1000;
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
      setCurrentEnemy(availableEnemies[0]);
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

  // Handle lose condition - reset hero health
  useEffect(() => {
    if (hero.currentHealth <= 0 && availableEnemies.length > 0) {
      setHero((prev) => ({
        ...prev,
        currentHealth: prev.maxHealth,
      }));
      setCurrentEnemy(availableEnemies[0]);
    }
  }, [hero.currentHealth, availableEnemies, setHero]);

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

  // Detect when enemy is defeated
  useEffect(() => {
    if (currentEnemy && currentEnemy.currentHealth <= 0) {
      handleEnemyDefeat(currentEnemy);
    }
  }, [currentEnemy, handleEnemyDefeat]);

  const performAttack = useCallback(
    (isCorrect: boolean) => {
      if (!currentEnemy) return;

      setEnemyState("attacking");

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

        setHero((prev) => ({
          ...prev,
          currentHealth: Math.max(0, prev.currentHealth - enemyDamage),
        }));
      } else {
        const penaltyDamage = calculatePenaltyDamage(currentEnemy, hero);
        setEnemyFinalDamage(penaltyDamage);
        setHero((prev) => ({
          ...prev,
          currentHealth: Math.max(0, prev.currentHealth - penaltyDamage),
        }));
      }

      if (enemyAttackTimeout.current) {
        clearTimeout(enemyAttackTimeout.current);
      }
      enemyAttackTimeout.current = setTimeout(() => {
        setEnemyState("idle");
      }, ANIMATION_DURATION);

      // Apply regeneration if hero is alive
      if (hero.currentHealth > 0) {
        setHero((prev) => ({
          ...prev,
          currentHealth: applyRegeneration(prev),
        }));
      }
    },
    [currentEnemy, hero, setHero]
  );

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
  };
}
