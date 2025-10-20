import { useContext } from "react";
import { ConfettiContext } from "../context/ConfettiContext";
/**
 * Custom hook to use the ConfettiContext
 * Provides a simple and intuitive API for confetti effects
 */
export const useConfetti = () => {
  const context = useContext(ConfettiContext);
  return context;
};
