import FavoriteIcon from "@mui/icons-material/Favorite";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import { AnimatePresence } from "motion/react";
import { roundToTwo } from "../../../../../utils/numbers";
import { BonusAnimation } from "../BonusAnimation/BonusAnimation";
interface HeroStatsProps {
  attackDamage: number;
  regenerationRate: number;
  maxHealth: number;
  lucidityShards: number;
  bonusAnimation: {
    type: "attack" | "regeneration" | "hp" | "defense";
    amount: number;
  } | null;
}

export const HeroStats = ({
  attackDamage,
  regenerationRate,
  maxHealth,
  lucidityShards,
  bonusAnimation,
}: HeroStatsProps) => (
  <div className="AdventurePage__profile">
    <div className="AdventurePage__stats">
      <div className="AdventurePage__stats-resources">
        <span className="HeroStats__stat-item">
          <SelfImprovementIcon color="primary" fontSize="small" />{" "}
          {roundToTwo(lucidityShards)}
          <AnimatePresence>
            {bonusAnimation?.type === "defense" && (
              <BonusAnimation
                type="shard"
                amount={roundToTwo(bonusAnimation.amount)}
                Icon={SelfImprovementIcon}
              />
            )}
          </AnimatePresence>
        </span>
        <span className="HeroStats__stat-item">
          <WhatshotIcon color="error" fontSize="small" />{" "}
          {roundToTwo(attackDamage)}
          <AnimatePresence>
            {bonusAnimation?.type === "attack" && (
              <BonusAnimation
                type="attack"
                amount={roundToTwo(bonusAnimation.amount)}
                Icon={WhatshotIcon}
              />
            )}
          </AnimatePresence>
        </span>
        <span className="HeroStats__stat-item">
          <HealthAndSafetyIcon color="warning" fontSize="small" />{" "}
          {roundToTwo(regenerationRate)}
          <AnimatePresence>
            {bonusAnimation?.type === "regeneration" && (
              <BonusAnimation
                type="regeneration"
                amount={roundToTwo(bonusAnimation.amount)}
                Icon={HealthAndSafetyIcon}
              />
            )}
          </AnimatePresence>
        </span>
        <span className="HeroStats__stat-item">
          <FavoriteIcon color="success" fontSize="small" />{" "}
          {roundToTwo(maxHealth)}
          <AnimatePresence>
            {bonusAnimation?.type === "hp" && (
              <BonusAnimation
                type="hp"
                amount={roundToTwo(bonusAnimation.amount)}
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
