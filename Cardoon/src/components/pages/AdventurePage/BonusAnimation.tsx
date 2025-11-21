import { SvgIconProps } from "@mui/material";
import { motion } from "motion/react";

const BONUS_COLORS = {
  attack: "#f44336",
  regeneration: "#ff9800",
  hp: "#4caf50",
} as const;

interface BonusAnimationProps {
  type: "attack" | "regeneration" | "hp";
  amount: number;
  Icon?: React.ComponentType<SvgIconProps>;
}

export const BonusAnimation = ({ type, amount, Icon }: BonusAnimationProps) => (
  <motion.span
    initial={{ opacity: 0, y: 0, scale: 0.5 }}
    animate={{ opacity: 1, y: -30, scale: 1 }}
    exit={{ opacity: 0, y: -50 }}
    transition={{ duration: 1, ease: "easeOut" }}
    style={{
      position: "absolute",
      left: "50%",
      top: 0,
      transform: "translateX(-50%)",
      color: BONUS_COLORS[type],
      fontWeight: "bold",
      fontSize: "1.2rem",
      pointerEvents: "none",
      display: "flex",
      width: "max-content",
      alignItems: "center",
      gap: "0.2rem",
    }}
  >
    +{amount} {Icon && <Icon fontSize="small" />}
  </motion.span>
);
