/**
 * @fileoverview Configuration centralisée des assets d'ennemis
 *
 * Ce fichier gère le chargement dynamique des assets (images, gifs)
 * pour chaque type d'ennemi de manière scalable.
 */

import type { EnemyType } from "./useAdventure";

// NightBorne assets
import nightBorneAttack from "../../../assets/Enemies/NightBorne_attack.gif";
import nightBorneDeath from "../../../assets/Enemies/NightBorne_death..gif";
import nightBorneHurt from "../../../assets/Enemies/NightBorne_hurt.gif";
import nightBorneIdle from "../../../assets/Enemies/NightBorne_idle.gif";

// Skeleton assets
import skeletonAttack from "../../../assets/Enemies/skeleton/attack.gif";
import skeletonDeath from "../../../assets/Enemies/skeleton/die.gif";
import skeletonIdle from "../../../assets/Enemies/skeleton/idle.gif";
import skeletonHurt from "../../../assets/Enemies/skeleton/Skeleton_01_White_Hurt.png";

export interface EnemyAssets {
  idle: string;
  defeated: string;
  attack: string;
  hurt: string;
}

/**
 * Map de tous les assets d'ennemis indexés par type
 */
const ENEMY_ASSETS_MAP: Record<EnemyType, EnemyAssets> = {
  NightBorne: {
    idle: nightBorneIdle,
    defeated: nightBorneDeath,
    attack: nightBorneAttack,
    hurt: nightBorneHurt,
  },
  Skeleton: {
    idle: skeletonIdle,
    defeated: skeletonDeath,
    attack: skeletonAttack,
    hurt: skeletonHurt,
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
