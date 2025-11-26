import { createContext } from "react";
import { type AdventureManagerReturn } from "../../hooks/queries/useAdventureManager";

type AdventureContextType = AdventureManagerReturn;

export const AdventureContext = createContext<AdventureContextType | undefined>(
  undefined
);
