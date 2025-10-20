import { createContext } from "react";

export const ConfettiContext = createContext({
  isConfettiVisible: false,
  showConfetti: () => {},
});
