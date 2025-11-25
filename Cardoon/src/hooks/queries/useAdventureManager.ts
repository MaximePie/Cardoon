import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  getAdventureData,
  type AdventureData,
} from "../../services/adventureApi";

export const ADVENTURE_QUERY_KEY = "adventure";

export const useAdventureManager = () => {
  const queryClient = useQueryClient();
  const [currentLevelId, setCurrentLevelId] = useState<string | null>(null);

  // Fetch all adventure data
  const {
    data: adventureData,
    isLoading,
    error,
  } = useQuery<AdventureData, Error>({
    queryKey: [ADVENTURE_QUERY_KEY],
    queryFn: getAdventureData,
    staleTime: 1000 * 60 * 10, // 10 minutes - adventure data changes rarely
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  const resetQueries = () => {
    queryClient.invalidateQueries({ queryKey: [ADVENTURE_QUERY_KEY] });
  };

  return {
    adventureData: adventureData || { levels: [] },
    currentLevelId,
    setCurrentLevelId,
    isLoading,
    error,
    resetQueries,
  };
};

export type AdventureManagerReturn = ReturnType<typeof useAdventureManager>;
