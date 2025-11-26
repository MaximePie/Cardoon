import FavoriteIcon from "@mui/icons-material/Favorite";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import { AnimatePresence } from "motion/react";
import { BonusAnimation } from "./BonusAnimation";

interface HeroStatsProps {
  attackDamage: number;
  regenerationRate: number;
  maxHealth: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  bonusAnimation: {
    type: "attack" | "regeneration" | "hp" | "defense";
    amount: number;
  } | null;
}

export const HeroStats = ({
  attackDamage,
  regenerationRate,
  maxHealth,
  bonusAnimation,
}: HeroStatsProps) => (
  <div className="AdventurePage__profile">
    <div className="AdventurePage__stats">
      <div className="AdventurePage__stats-resources">
        <span style={{ position: "relative" }}>
          <WhatshotIcon color="error" fontSize="small" /> {attackDamage}
          <AnimatePresence>
            {bonusAnimation?.type === "attack" && (
              <BonusAnimation
                type="attack"
                amount={bonusAnimation.amount}
                Icon={WhatshotIcon}
              />
            )}
          </AnimatePresence>
        </span>
        <span style={{ position: "relative" }}>
          <HealthAndSafetyIcon color="warning" fontSize="small" />{" "}
          {regenerationRate}
          <AnimatePresence>
            {bonusAnimation?.type === "regeneration" && (
              <BonusAnimation
                type="regeneration"
                amount={bonusAnimation.amount}
                Icon={HealthAndSafetyIcon}
              />
            )}
          </AnimatePresence>
        </span>
        <span style={{ position: "relative" }}>
          <FavoriteIcon color="success" fontSize="small" /> {maxHealth}
          <AnimatePresence>
            {bonusAnimation?.type === "hp" && (
              <BonusAnimation
                type="hp"
                amount={bonusAnimation.amount}
                Icon={FavoriteIcon}
              />
            )}
          </AnimatePresence>
        </span>
      </div>
      <div className="AdventurePage__stats-level">
        <span>Forêt toxique</span>
      </div>
    </div>
  </div>
);
