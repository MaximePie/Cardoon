import { useContext } from "react";
import { AdventureContext } from "./AdventureContext";

export const useAdventureContext = () => {
  const context = useContext(AdventureContext);
  if (!context) {
    throw new Error(
      "useAdventureContext must be used within AdventureContextProvider"
    );
  }
  return context;
};
