import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../context/UserContext";
import { User } from "../../../types/common";
import { RESOURCES, usePut } from "../../../hooks/server";
import { SnackbarContext } from "../../../context/SnackbarContext";

export const UserPage = () => {
  const { user, setUser } = useContext(UserContext);
  const { openSnackbarWithMessage } = useContext(SnackbarContext);
  const { username, gold, role, currentDailyGoal, dailyGoal } = user;
  const [draftDailyGoal, setDraftDailyGoal] = useState<number>(dailyGoal || 0);
  const { put, data: postResult } = usePut<User>(RESOURCES.USER_DAILY_GOAL);
  const saveDailyGoal = (e: React.FormEvent) => {
    e.preventDefault();
    put(user._id, {
      target: draftDailyGoal,
    });
  };

  useEffect(() => {
    if (postResult) {
      setUser(postResult);
      setDraftDailyGoal(postResult.dailyGoal);
      openSnackbarWithMessage(
        `Objectif quotidien mis à jour : ${postResult.dailyGoal}`
      );
    }
  }, [postResult, setUser, openSnackbarWithMessage]);

  const onDraftDailyGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setDraftDailyGoal(value);
    } else {
      setDraftDailyGoal(0);
    }
  };

  return (
    <div>
      <h1>Page de l'utilisateur</h1>
      <p>Nom d'utilisateur: {username}</p>
      <p>
        Objectif quotidien: {currentDailyGoal.progress} /{" "}
        {currentDailyGoal.target} ({currentDailyGoal.status})
      </p>
      <form onSubmit={saveDailyGoal}>
        <label>
          Objectif quotidien:
          <input
            type="number"
            value={draftDailyGoal}
            onChange={onDraftDailyGoalChange}
            min="1"
          />
        </label>
        <button type="submit">Mettre à jour</button>
      </form>
      <p>Gold: {gold}</p>
      <p>Rôle: {role}</p>
    </div>
  );
};

export default UserPage;
