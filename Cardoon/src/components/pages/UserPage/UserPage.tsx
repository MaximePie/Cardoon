import { Tab, Tabs } from "@mui/material";
import Divider from "@mui/material/Divider/Divider";
import { useContext, useEffect, useState } from "react";
import { SnackbarContext } from "../../../context/SnackbarContext";
import { RESOURCES, usePut } from "../../../hooks/server";
import { useUser } from "../../../hooks/useUser";
import coinImage from "../../../images/coin.png";
import { User } from "../../../types/common";
import { formattedNumber } from "../../../utils/numbers";

function ExpBar({ currentExp }: { currentExp: number }) {
  const expForNextLevel = 1000;
  const progressPercentage = Math.min(
    (currentExp / expForNextLevel) * 100,
    100
  );
  return (
    <div className="ExpBar">
      <div
        className="ExpBar__fill"
        style={{ width: `${progressPercentage}%` }}
      />
    </div>
  );
}

export const UserPage = () => {
  const { user, setUser, allUserCards, getAllUserCards } = useUser();
  const { openSnackbarWithMessage } = useContext(SnackbarContext);
  const { username, gold, role, currentDailyGoal, dailyGoal } = user;
  const [draftDailyGoal, setDraftDailyGoal] = useState<number>(dailyGoal || 0);
  const { putUser, data: postResult } = usePut<User>(RESOURCES.USER_DAILY_GOAL);
  const [activeTab, setActiveTab] = useState<"profile" | "cards">("profile");

  const saveDailyGoal = (e: React.FormEvent) => {
    e.preventDefault();
    putUser({
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

  useEffect(() => {
    // Only fetch if we don't have user cards yet
    if (allUserCards.length === 0) {
      getAllUserCards();
    }
  }, [getAllUserCards, allUserCards.length]);

  const onDraftDailyGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setDraftDailyGoal(value);
    } else {
      setDraftDailyGoal(0);
    }
  };

  console.log("User Cards:", allUserCards);

  return (
    <div className="UserPage">
      <h2>Profil</h2>
      <div className="UserPage__header">
        <div>
          <img
            className="UserPage__header-avatar"
            src="https://picsum.photos/200/300"
            alt={`${username}'s avatar`}
          />
        </div>
        <div className="UserPage__header-infos">
          <h3>{username}</h3>
          <p>Exp</p>
          <ExpBar currentExp={user.score} />
        </div>
      </div>
      <div className="UserPage__Currencies">
        <div className="UserPage__currency">
          <img src={coinImage} alt="Currency" />
          <div className="UserPage__currency-info">
            <span className="UserPage__currency-amount">
              {formattedNumber(gold || 0)}
            </span>
            <span className="UserPage__currency-label">Knowledge Coins</span>
          </div>
        </div>
      </div>
      <Divider />
      <Tabs
        value={activeTab}
        onChange={(_, newValue) =>
          setActiveTab(newValue as "profile" | "cards")
        }
      >
        <Tab label="Profil" value="profile" />
        <Tab label="Cartes" value="cards" />
      </Tabs>
      {activeTab === "profile" && (
        <div className="UserPage__tab-content">
          <h3>Informations du compte</h3>
          <p>Rôle : {role}</p>
          {currentDailyGoal && (
            <div>
              <h4>Objectif quotidien actuel</h4>
              <p>
                Progrès : {currentDailyGoal.progress} /{" "}
                {currentDailyGoal.target}
              </p>
            </div>
          )}
          <form onSubmit={saveDailyGoal}>
            <h4>Modifier l&apos;objectif quotidien</h4>
            <input
              type="number"
              value={draftDailyGoal}
              onChange={onDraftDailyGoalChange}
            />
            <button type="submit">Enregistrer</button>
          </form>
        </div>
      )}
      {activeTab === "cards" && (
        <div className="UserPage__tab-content">
          <h3>Vos cartes</h3>
          {allUserCards.map((card) => (
            <div key={card._id} className="UserPage__card">
              <h4>{card.card.question}</h4>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPage;
