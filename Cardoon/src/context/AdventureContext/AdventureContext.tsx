import React, { createContext, useContext } from "react";
import {
  useAdventureManager,
  type AdventureManagerReturn,
} from "../../hooks/queries/useAdventureManager";

type AdventureContextType = AdventureManagerReturn;

export const AdventureContext = createContext<AdventureContextType | undefined>(
  undefined
);

export const AdventureContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const adventureManager = useAdventureManager();

  return (
    <AdventureContext.Provider value={adventureManager}>
      {children}
    </AdventureContext.Provider>
  );
};

export const useAdventureContext = () => {
  const context = useContext(AdventureContext);
  if (!context) {
    throw new Error(
      "useAdventureContext must be used within AdventureContextProvider"
    );
  }
  return context;
};
