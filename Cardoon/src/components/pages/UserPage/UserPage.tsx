/// <reference types="../../../vite-env" />
import {
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
} from "@mui/material";
import Divider from "@mui/material/Divider/Divider";
import { useContext, useEffect, useState } from "react";
import { SnackbarContext } from "../../../context/SnackbarContext";
import { RESOURCES, usePut } from "../../../hooks/server";
import { useUser } from "../../../hooks/useUser";
import { useUserCardsManager } from "../../../hooks/useUserCards";
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
  const { user, setUser } = useUser();
  const { openSnackbarWithMessage } = useContext(SnackbarContext);
  const { username, gold, role, currentDailyGoal, dailyGoal } = user;
  const [draftDailyGoal, setDraftDailyGoal] = useState<number>(dailyGoal || 0);
  const { putUser, data: postResult } = usePut<User>(RESOURCES.USER_DAILY_GOAL);

  // 🚀 TanStack Query pour la gestion optimiste des cartes
  const {
    cards: allUserCards,
    isLoading: isLoadingCards,
    deleteCard,
    isDeletingCard,
    error: cardsError,
  } = useUserCardsManager(user._id, {
    onDeleteSuccess: () => {
      openSnackbarWithMessage("Carte supprimée avec succès !", "success");
    },
    onDeleteError: (error) => {
      openSnackbarWithMessage(
        `Erreur lors de la suppression: ${error.message}`,
        "error"
      );
    },
  });

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

  const onDraftDailyGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setDraftDailyGoal(value);
    } else {
      setDraftDailyGoal(0);
    }
  };

  const editCard = (cardId: string) => {
    // Implement card editing logic here
    console.log("Edit card with ID:", cardId);
  };

  // 🗑️ Suppression optimiste avec confirmation utilisateur
  const handleDeleteCard = (cardId: string, cardQuestion: string) => {
    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer cette carte ?\n\nQuestion: "${cardQuestion}"`
    );
    if (!confirmDelete) return;

    // Suppression optimiste via TanStack Query
    deleteCard(cardId);
  };

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
          <h3>Vos cartes ({allUserCards.length})</h3>
          {/* 🔄 Affichage du loading des cartes */}
          {isLoadingCards ? (
            <div className="UserPage__loading">
              <p>Chargement des cartes...</p>
            </div>
          ) : cardsError ? (
            <div className="UserPage__error">
              <p>Erreur lors du chargement des cartes: {cardsError.message}</p>
            </div>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Question</TableCell>
                    <TableCell>Réponse</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allUserCards.map((card) => (
                    <TableRow
                      key={card._id}
                      style={{
                        opacity: isDeletingCard ? 0.7 : 1,
                        transition: "opacity 0.3s ease",
                      }}
                    >
                      <TableCell>{card.card.question}</TableCell>
                      <TableCell>{card.card.answer}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => editCard(card.card._id)}
                          disabled={isDeletingCard}
                        >
                          ✏️ Modifier
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteCard(card.card._id, card.card.question)
                          }
                          disabled={isDeletingCard}
                          style={{ marginLeft: "8px" }}
                        >
                          {isDeletingCard
                            ? "🔄 Suppression..."
                            : "🗑️ Supprimer"}
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {allUserCards.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        style={{ textAlign: "center", padding: "2rem" }}
                      >
                        <p>
                          Aucune carte trouvée. Commencez par créer votre
                          première carte !
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </div>
      )}
    </div>
  );
};

export default UserPage;
