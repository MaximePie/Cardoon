import axios from "axios";
import { useCallback, useContext, useEffect, useState } from "react";
import { useUserCardsManager } from "../../hooks/queries/useUserCards";
import { ACTIONS, useFetch, usePut } from "../../hooks/server";
import { Card, User } from "../../types/common";
import { SnackbarContext } from "../SnackbarContext";
import { UserContext, emptyUser } from "./UserContext";

export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { fetch, data, error: userError } = useFetch<User>(ACTIONS.ME);
  const { putUser: saveUserImage } = usePut<User>(ACTIONS.UPDATE_ME_IMAGE);
  const { openSnackbarWithMessage } = useContext(SnackbarContext);

  const [user, setUser] = useState<User>(emptyUser);
  const {
    reviewUserCards,
    isReviewUserCardsLoading,
    reviewUserCardsError,
    refetchReviewUserCards,
    cards: allUserCards,
    isLoading: isLoadingCards,
    deleteCard: deleteCardMutation,
    deleteCards: deleteCardsMutation,
    isDeletingCard,
    isEditingCard,
    error: cardsError,
    editCard: editCardMutation,
    invertCard: invertCardMutation,
    isInvertingCard,
    resetQueries,
  } = useUserCardsManager(user._id || "", {
    onDeleteSuccess: () => {
      openSnackbarWithMessage("Carte supprimée avec succès !", "success");
    },
    onDeleteError: (error) => {
      openSnackbarWithMessage(
        `Erreur lors de la suppression: ${error.message}`,
        "error"
      );
    },
    onEditSuccess: () => {
      openSnackbarWithMessage("Carte modifiée avec succès !", "success");
    },
    onEditError: (error) => {
      openSnackbarWithMessage(
        `Erreur lors de la modification: ${error.message}`,
        "error"
      );
    },
    onInvertSuccess: () => {
      openSnackbarWithMessage("Carte inversée avec succès !", "success");
    },
    onInvertError: (error) => {
      openSnackbarWithMessage(
        `Erreur lors de l'inversion: ${error.message}`,
        "error"
      );
    },
  });
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

  const getReviewUserCards = useCallback(async () => {
    await refetchReviewUserCards();
  }, [refetchReviewUserCards]);

  const clearAllErrors = () => {
    resetQueries();
  };

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

  const deleteCard = async (cardId: string) => {
    return await deleteCardMutation(cardId);
  };
  const deleteCards = async (cardIds: string[]) => {
    return await deleteCardsMutation(cardIds);
  };

  const editCard = async (updatedCard: Partial<Card>) => {
    return await editCardMutation(updatedCard);
  };

  const invertCard = async (cardId: string) => {
    return await invertCardMutation(cardId);
  };

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
        getReviewUserCards,
        updateImage,
        isLoadingCards,
        deleteCard,
        deleteCards,
        isDeletingCard,
        isEditingCard,
        cardsError,
        editCard,
        invertCard,
        isInvertingCard,
        clearAllErrors,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
