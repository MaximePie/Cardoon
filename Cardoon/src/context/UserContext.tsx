import { createContext, useEffect, useState } from "react";
import { User } from "../types/common";
import { ACTIONS, useFetch } from "../hooks/server";
import axios from "axios";

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
  logout: () => void;
  addScore: (score: number) => void;
  earnGold: (gold: number) => void;
}

const emptyUser: User = {
  _id: "",
  username: "",
  score: 0,
  gold: 0,
};

export const UserContext = createContext<UserContextType>({
  user: emptyUser,
  setUser: () => {},
  logout: () => {},
  addScore: () => {},
  earnGold: () => {},
});

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
  }, []);

  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data]);

  const addScore = (score: number) => {
    setUser({ ...user, score: user.score + score });
  };

  const earnGold = (gold: number) => {
    console.log("Gold earned: ", gold);
    setUser({ ...user, gold: user.gold + gold });
  };

  // Clear the cookie
  const logout = () => {
    document.cookie = "token=;max-age=0";
    setUser(emptyUser);
    // Redirect to /
    document.location.href = "/";
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        logout,
        addScore,
        earnGold,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
