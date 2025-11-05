import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useUserCardsManager } from "../../hooks/queries/useUserCards";
import { ACTIONS, RESOURCES, useFetch, usePut } from "../../hooks/server";
import { PopulatedUserCard, User } from "../../types/common";
import { UserContext, emptyUser } from "./UserContext";

export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { fetch, data, error: userError } = useFetch<User>(ACTIONS.ME);
  const { fetch: fetchAllCards, data: userCardsData } = useFetch<{
    userCards: PopulatedUserCard[];
  }>(RESOURCES.USERCARDS);
  const { putUser: saveUserImage } = usePut<User>(ACTIONS.UPDATE_ME_IMAGE);

  const allUserCards = userCardsData?.userCards ?? [];

  const [user, setUser] = useState<User>(emptyUser);
  const {
    reviewUserCards,
    isReviewUserCardsLoading,
    reviewUserCardsError,
    refetchReviewUserCards,
  } = useUserCardsManager(user._id || "");
  useEffect(() => {
    // Check for user token in cookies
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="));

    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${
        token.split("=")[1]
      }`;
      fetch();
    }
  }, [fetch]);

  const refresh = () => {
    fetch();
  };

  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data]);

  const addScore = (score: number) => {
    setUser({ ...user, score: (user?.score ?? 0) + score });
  };

  const earnGold = (gold: number) => {
    const totalGold = gold * (user?.currentGoldMultiplier ?? 1);
    setUser({ ...user, gold: (user?.gold ?? 0) + totalGold });
  };

  const removeGold = (gold: number) => {
    setUser({ ...user, gold: Math.max(0, (user?.gold ?? 0) - gold) });
  };
  // Clear the cookie
  const logout = () => {
    document.cookie = "token=;max-age=0";
    setUser(emptyUser);
    // Redirect to /
    document.location.href = "/";
  };

  const hasItem = (itemId: string) => {
    return user.items.some((item) => item.base._id === itemId);
  };

  const getAllUserCards = useCallback(async () => {
    await fetchAllCards();
  }, [fetchAllCards]);

  const getReviewUserCards = useCallback(async () => {
    await refetchReviewUserCards();
  }, [refetchReviewUserCards]);

  const updateImage = async (imageFile: File) => {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      await saveUserImage(formData);

      // Refresh l'utilisateur pour s'assurer qu'on a les dernières données
      await fetch();
    } catch (error) {
      console.error("Error updating image:", error);
      throw error;
    }
  };

  useEffect(() => {
    getAllUserCards();
  }, [getAllUserCards]);

  return (
    <UserContext.Provider
      value={{
        reviewUserCards,
        isReviewUserCardsLoading,
        reviewUserCardsError,
        user,
        userError,
        hasItem,
        setUser,
        logout,
        addScore,
        earnGold,
        removeGold,
        refresh,
        allUserCards: allUserCards || [],
        getAllUserCards,
        getReviewUserCards,
        updateImage,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
