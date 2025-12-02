/**
 * @fileoverview Configuration centralisée des assets d'ennemis
 *
 * Ce fichier gère le chargement dynamique des assets (images, gifs)
 * pour chaque type d'ennemi de manière scalable.
 */

import type { EnemyType } from "./adventure.types";

// NightBorne assets
import nightBorneAttack from "../../../assets/Enemies/NightBorne_attack.gif";
import nightBorneDeath from "../../../assets/Enemies/NightBorne_death..gif";
import nightBorneIdle from "../../../assets/Enemies/NightBorne_idle.gif";

// Skeleton assets
import skeletonAttack from "../../../assets/Enemies/skeleton/attack.gif";
import skeletonDeath from "../../../assets/Enemies/skeleton/die.gif";
import skeletonIdle from "../../../assets/Enemies/skeleton/idle.gif";

// Goblin assets (/goblin)
import goblinAttack from "../../../assets/Enemies/goblin/attack.gif";
import goblinDeath from "../../../assets/Enemies/goblin/die.gif";
import goblinIdle from "../../../assets/Enemies/goblin/idle.gif";

export interface EnemyAssets {
  idle: string;
  defeated: string;
  attack: string;
}

/**
 * Map de tous les assets d'ennemis indexés par type
 */
const ENEMY_ASSETS_MAP: Record<EnemyType, EnemyAssets> = {
  NightBorne: {
    idle: nightBorneIdle,
    defeated: nightBorneDeath,
    attack: nightBorneAttack,
  },
  Skeleton: {
    idle: skeletonIdle,
    defeated: skeletonDeath,
    attack: skeletonAttack,
  },
  BigGoblin: {
    idle: goblinIdle,
    defeated: goblinDeath,
    attack: goblinAttack,
  },
  Goblin: {
    idle: goblinIdle,
    defeated: goblinDeath,
    attack: goblinAttack,
  },
};

/**
 * Récupère les assets pour un type d'ennemi donné
 *
 * @param enemyType - Le type d'ennemi
 * @returns Les assets (idle, defeated, attack, hurt) de l'ennemi
 *
 * @example
 * ```tsx
 * const assets = getEnemyAssets("NightBorne");
 * <img src={assets.idle} alt="Enemy" />
 * ```
 */
export const getEnemyAssets = (enemyType: EnemyType): EnemyAssets => {
  return ENEMY_ASSETS_MAP[enemyType];
};
