// Contains a hook to get usercards and making it able to play them

import { useEffect, useState } from "react";
import { FetchedCategory } from "../components/pages/CardFormPage/CardFormPage";
import { PopulatedUserCard } from "../types/common";
import { RESOURCES, useFetch } from "./server";
type UserCardHookReturnType = {
  loading: boolean;
  userCards: PopulatedUserCard[];
  categories: FetchedCategory[];
  fetch: () => void;
  error?: boolean;
  removeCard: (id: string) => void;
};

export const useUserCards = (): UserCardHookReturnType => {
  const { data, loading, fetch, error } = useFetch<{
    cards: PopulatedUserCard[];
    categories: FetchedCategory[];
  }>(RESOURCES.USERCARDS);
  const [userCards, setUserCards] = useState<PopulatedUserCard[]>(
    data?.cards || []
  );

  const removeCard = (id: string) => {
    setUserCards((prev) => prev.filter((card) => card._id !== id));
  };

  useEffect(() => {
    if (data) {
      setUserCards(
        data.cards.sort((a, b) => {
          if (a.card.parentId && !b.card.parentId) return -1;
          if (!a.card.parentId && b.card.parentId) return 1;
          return 0;
        })
      );
      // console.log(
      //   data
      //     .filter(({ card }) => !card.imageLink && !!card.category)
      //     .map(({ card }) => `${card.question};${card.answer};${card.category}`)
      // );
    }
  }, [data]);

  if (loading)
    return {
      loading: true,
      userCards: [],
      categories: [],
      fetch,
      removeCard,
    };
  if (error)
    return {
      loading: false,
      userCards: [],
      categories: [],
      fetch,
      error: true,
      removeCard,
    };
  return {
    loading: false,
    userCards,
    categories: data?.categories || [],
    fetch,
    removeCard,
  };
};
