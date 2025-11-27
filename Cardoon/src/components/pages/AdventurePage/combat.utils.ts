import { Enemy, Hero } from "./adventure.types";

/**
 * Calculate damage dealt by the hero to an enemy
 */
export function calculateHeroDamage(hero: Hero, enemy: Enemy): number {
  return Math.max(0, hero.attackDamage - enemy.defense);
}

/**
 * Calculate damage dealt by an enemy to the hero
 */
export function calculateEnemyDamage(enemy: Enemy, hero: Hero): number {
  return Math.max(0, enemy.attackDamage - hero.defense);
}

/**
 * Calculate penalty damage when answer is wrong (1.5x enemy damage)
 */
export function calculatePenaltyDamage(enemy: Enemy, hero: Hero): number {
  const baseDamage = calculateEnemyDamage(enemy, hero);
  return baseDamage * 1.5;
}

/**
 * Apply regeneration to hero's current health, capped at max health
 */
export function applyRegeneration(hero: Hero): number {
  return Math.min(hero.maxHealth, hero.currentHealth + hero.regenerationRate);
}

/**
 * Select a random enemy from the available enemies list
 */
export function selectRandomEnemy(enemies: Enemy[]): Enemy | null {
  if (enemies.length === 0) return null;
  return enemies[Math.floor(Math.random() * enemies.length)];
}
