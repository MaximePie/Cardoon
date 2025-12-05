import { useMemo } from "react";
import { useAdventureContext } from "../../context/AdventureContext";
import { useUser } from "../../context/UserContext";
import type { Level } from "../../services/adventureApi";

export interface LevelWithUnlockStatus extends Level {
  isUnlocked: boolean;
}

/**
 * Hook to consume adventure context with computed unlock status
 */
export const useAdventure = () => {
  const {
    adventureData,
    currentLevelId,
    setCurrentLevelId,
    isLoading,
    error,
    resetQueries,
  } = useAdventureContext();
  const { user } = useUser();

  const heroLevel = user.data.hero?.level ?? 1;

  // Compute unlock status for each level
  const levelsWithUnlockStatus = useMemo<LevelWithUnlockStatus[]>(() => {
    return adventureData.levels.map((level) => ({
      ...level,
      isUnlocked: heroLevel >= level.minHeroLevel,
    }));
  }, [adventureData.levels, heroLevel]);

  // Get current level
  const currentLevel = useMemo(() => {
    if (!currentLevelId) return null;
    return (
      levelsWithUnlockStatus.find((level) => level._id === currentLevelId) ||
      null
    );
  }, [currentLevelId, levelsWithUnlockStatus]);

  // Get first unlocked level (default)
  const firstUnlockedLevel = useMemo(() => {
    return levelsWithUnlockStatus.find((level) => level.isUnlocked) || null;
  }, [levelsWithUnlockStatus]);

  return {
    levels: levelsWithUnlockStatus,
    currentLevel,
    currentLevelId,
    setCurrentLevelId,
    firstUnlockedLevel,
    isLoading,
    error,
    resetQueries,
  };
};
