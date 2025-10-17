import axios from "axios";
import { useEffect, useState } from "react";
import { ACTIONS, useFetch } from "../hooks/server";
import { User } from "../types/common";
import { UserContext, emptyUser } from "./UserContext";

export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { fetch, data } = useFetch<User>(ACTIONS.ME);

  const [user, setUser] = useState<User>(emptyUser);

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
    setUser({ ...user, score: user.score + score });
  };

  const earnGold = (gold: number) => {
    const totalGold = gold * user.currentGoldMultiplier;
    setUser({ ...user, gold: user.gold + totalGold });
  };

  const removeGold = (gold: number) => {
    setUser({ ...user, gold: user.gold - gold });
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

  return (
    <UserContext.Provider
      value={{
        user,
        hasItem,
        setUser,
        logout,
        addScore,
        earnGold,
        removeGold,
        refresh,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
