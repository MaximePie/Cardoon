import FavoriteIcon from "@mui/icons-material/Favorite";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import { SvgIconProps } from "@mui/material";

export type EnemyType = "NightBorne" | "Skeleton" | "Goblin" | "BigGoblin";
export type BonusType = "hp" | "attack" | "regeneration" | "defense";
export type HeroState = "idle" | "attacking" | "defeated";
export type EnemyState = "idle" | "attacking" | "defeated";

export interface Enemy {
  id: EnemyType;
  name: string;
  maxHealth: number;
  currentHealth: number;
  attackDamage: number;
  defense: number;
  experience: number;
  bonus: {
    type: BonusType;
    amount: number;
    icon: React.ComponentType<SvgIconProps>;
    iconColor: SvgIconProps["color"];
  };
}

export interface Hero {
  maxHealth: number;
  currentHealth: number;
  regenerationRate: number;
  attackDamage: number;
  defense: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
}

export const DEFAULT_HERO: Hero = {
  maxHealth: 120,
  currentHealth: 120,
  regenerationRate: 0,
  attackDamage: 2,
  defense: 0,
  level: 1,
  experience: 0,
  experienceToNextLevel: 100,
};

// Helper function to get icon and color for bonus type
export const getBonusIcon = (type: BonusType) => {
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
