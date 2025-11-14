import { useCallback, useContext, useEffect, useState } from "react";
import {
  useUserCardsManager,
  useUserManager,
} from "../../hooks/queries/useUserCards";
import { ACTIONS, usePut } from "../../hooks/server";
import { Card, User } from "../../types/common";
import { SnackbarContext } from "../SnackbarContext";
import { UserContext, emptyUser } from "./UserContext";

export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { putUser: saveUserImage } = usePut<User>(ACTIONS.UPDATE_ME_IMAGE);
  const { openSnackbarWithMessage } = useContext(SnackbarContext);
  const {
    user,
    error: userError,
    resetQueries: refetchUser,
    isLoading: isUserLoading,
    updateUserDailyGoal: updateUser,
  } = useUserManager();

  const [currentUser, setUser] = useState<User>(user || emptyUser);

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
  } = useUserCardsManager(user?._id || "", {
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
    if (user) {
      setUser(user);
    }
  }, [user]);

  // Détection plus robuste des erreurs de token
  const isTokenError = (error: Error | null) => {
    if (!error) return false;
    return (
      error.message.includes("Invalid token") ||
      error.message.includes("No authentication token found") ||
      error.message.includes("Unauthorized")
    );
  };

  const shouldRedirectToLogin =
    isTokenError(userError) || isTokenError(cardsError);
  // Clear the cookie
  const logout = useCallback(() => {
    document.cookie = "token=;max-age=0";
    setUser(emptyUser);
    // Redirect to /
    document.location.href = "/login";
  }, []);
  useEffect(() => {
    if (shouldRedirectToLogin) {
      logout();
    }
  }, [shouldRedirectToLogin, logout]);

  const addScore = (score: number) => {
    setUser({ ...currentUser, score: (currentUser?.score ?? 0) + score });
  };

  const earnGold = (gold: number) => {
    const totalGold = gold * (currentUser?.currentGoldMultiplier ?? 1);
    setUser({ ...currentUser, gold: (currentUser?.gold ?? 0) + totalGold });
  };

  const removeGold = (gold: number) => {
    setUser({
      ...currentUser,
      gold: Math.max(0, (currentUser?.gold ?? 0) - gold),
    });
  };

  const hasItem = (itemId: string) => {
    return currentUser.items.some((item) => item.base._id === itemId);
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
      // await fetch();
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

  // Refetch all the cards, user data and userCards
  const refresh = () => {
    getReviewUserCards();
    resetQueries();
  };

  const login = () => {
    refetchUser();
    refetchReviewUserCards();
    resetQueries();
  };

  const updateDailyGoal = async (newDailyGoal: number) => {
    if (newDailyGoal < 0 || newDailyGoal > 1000) {
      openSnackbarWithMessage(
        "Le nombre de cartes par jour doit être compris entre 0 et 1000.",
        "error"
      );
      return;
    }
    updateUser(newDailyGoal);
  };

  return (
    <UserContext.Provider
      value={{
        cards: {
          reviewUserCards: {
            data: reviewUserCards,
            isLoading: isReviewUserCardsLoading,
            error: reviewUserCardsError,
            getReviewUserCards,
          },
          allUserCards: {
            data: allUserCards,
            isLoading: isLoadingCards,
            error: cardsError,
            deleteCard,
            deleteCards,
            isDeletingCard,
            isEditingCard,
            cardsError,
            editCard,
            invertCard,
            isInvertingCard,
          },
        },
        user: {
          data: currentUser,
          isLoading: isUserLoading && !shouldRedirectToLogin,
          error: userError,
          hasItem,
          setUser,
          logout,
          login,
          addScore,
          earnGold,
          removeGold,
          refresh,
          updateImage,
          updateDailyGoal,
        },
        clearAllErrors,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
