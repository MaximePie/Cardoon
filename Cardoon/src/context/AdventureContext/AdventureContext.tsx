import React from "react";
import { useAdventureManager } from "../../hooks/queries/useAdventureManager";
import { AdventureContext } from "./AdventureContext";

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
