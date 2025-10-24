/// <reference types="../../../vite-env" />
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  IconButton,
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

// 🎯 Constants pour éviter la duplication et améliorer la lisibilité
const EXP_FOR_NEXT_LEVEL = 1000;
const CONFIRMATION_MESSAGES = {
  DELETE_CARD: (question: string) =>
    `Êtes-vous sûr de vouloir supprimer cette carte ?\n\nQuestion: "${question}"`,
} as const;

// 📊 Types pour une meilleure clarté des états
type UserPageTab = "profile" | "cards";

// 🧩 Composant ExpBar pour la barre d'expérience
interface ExpBarProps {
  currentExp: number;
  maxExp?: number;
}

const ExpBar = ({ currentExp, maxExp = EXP_FOR_NEXT_LEVEL }: ExpBarProps) => {
  const progressPercentage = Math.min((currentExp / maxExp) * 100, 100);

  return (
    <div className="ExpBar">
      <div
        className="ExpBar__fill"
        style={{ width: `${progressPercentage}%` }}
      />
    </div>
  );
};

// 👤 Composant en-tête utilisateur
const UserHeader = () => {
  const { user } = useUser();
  const { username, score } = user;

  return (
    <section className="UserPage__header">
      <div>
        <img
          className="UserPage__header-avatar"
          src="https://picsum.photos/200/300"
          alt={`Avatar de ${username}`}
        />
      </div>
      <div className="UserPage__header-infos">
        <h3>{username}</h3>
        <p>Expérience</p>
        <ExpBar currentExp={score} />
      </div>
    </section>
  );
};

// 📝 Hook personnalisé pour la gestion de l'objectif quotidien
const useDailyGoal = () => {
  const { user, setUser } = useUser();
  const { openSnackbarWithMessage } = useContext(SnackbarContext);
  const [draftDailyGoal, setDraftDailyGoal] = useState<number>(
    user.dailyGoal || 0
  );
  const {
    putUser,
    data: postResult,
    loading,
  } = usePut<User>(RESOURCES.USER_DAILY_GOAL);

  // 🔄 Synchronisation avec la réponse du serveur
  useEffect(() => {
    if (postResult) {
      setUser(postResult);
      setDraftDailyGoal(postResult.dailyGoal);
      openSnackbarWithMessage(
        `Objectif quotidien mis à jour : ${postResult.dailyGoal}`,
        "success"
      );
    }
  }, [postResult, setUser, openSnackbarWithMessage]);

  // 📝 Gestionnaire de changement avec validation
  const handleDraftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = parseInt(rawValue, 10);
    setDraftDailyGoal(!isNaN(numericValue) ? numericValue : 0);
  };

  // ✅ Gestionnaire de soumission avec validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (draftDailyGoal < 0 || draftDailyGoal > 100) {
      openSnackbarWithMessage(
        "L'objectif quotidien doit être entre 0 et 100",
        "error"
      );
      return;
    }

    putUser({ target: draftDailyGoal });
  };

  return {
    draftDailyGoal,
    isSubmitting: loading,
    currentDailyGoal: user.currentDailyGoal,
    handleDraftChange,
    handleSubmit,
  };
};

// 📝 Composant formulaire d'objectif quotidien
const DailyGoalForm = () => {
  const { draftDailyGoal, isSubmitting, handleDraftChange, handleSubmit } =
    useDailyGoal();

  return (
    <form onSubmit={handleSubmit}>
      <h4>Modifier l&apos;objectif quotidien</h4>
      <input
        type="number"
        min="0"
        max="100"
        value={draftDailyGoal}
        onChange={handleDraftChange}
        placeholder="Objectif quotidien (0-100)"
        aria-label="Objectif quotidien"
        disabled={isSubmitting}
      />
      <button
        type="submit"
        aria-label="Enregistrer l'objectif quotidien"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
};

// 📋 Composant profil utilisateur
const UserProfile = () => {
  const { user } = useUser();
  const { role, gold, currentDailyGoal } = user;

  return (
    <section className="UserPage__tab-content" aria-labelledby="profile-tab">
      <h3 id="profile-tab">Informations du compte</h3>

      {/* 📊 Informations du rôle */}
      <p>
        <strong>Rôle :</strong> {role}
      </p>

      {/* 💰 Affichage des devises */}
      <section className="UserPage__Currencies">
        <div className="UserPage__currency">
          <img src={coinImage} alt="Pièces de connaissance" />
          <div className="UserPage__currency-info">
            <span className="UserPage__currency-amount">
              {formattedNumber(gold || 0)}
            </span>
            <span className="UserPage__currency-label">Knowledge Coins</span>
          </div>
        </div>
      </section>

      {/* 🎯 Progrès de l'objectif quotidien */}
      {currentDailyGoal && (
        <div className="UserPage__daily-goal-progress">
          <h4>Objectif quotidien actuel</h4>
          <p>
            <strong>Progrès :</strong> {currentDailyGoal.progress} /{" "}
            {currentDailyGoal.target}
          </p>
        </div>
      )}

      {/* 📝 Formulaire de modification de l'objectif */}
      <DailyGoalForm />
    </section>
  );
};

// 🎴 Composant gestion des cartes utilisateur
const UserCards = () => {
  const { user } = useUser();
  const { openSnackbarWithMessage } = useContext(SnackbarContext);

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

  // ✏️ Gestionnaire d'édition de carte
  const handleEditCard = (cardId: string) => {
    // TODO: Implement card editing logic
    console.log("Edit card with ID:", cardId);
  };

  // 🗑️ Gestionnaire de suppression avec confirmation
  const handleDeleteCard = (cardId: string, cardQuestion: string) => {
    const userConfirmed = window.confirm(
      CONFIRMATION_MESSAGES.DELETE_CARD(cardQuestion)
    );

    if (!userConfirmed) return;
    deleteCard(cardId);
  };

  return (
    <section className="UserPage__tab-content" aria-labelledby="cards-tab">
      <h3 id="cards-tab">Vos cartes ({allUserCards.length})</h3>

      {/* 🔄 Gestion des états de chargement et d'erreur */}
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
                    <IconButton
                      aria-label={`Modifier la carte: ${card.card.question}`}
                      onClick={() => handleEditCard(card.card._id)}
                      disabled={isDeletingCard}
                      size="small"
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      aria-label={`Supprimer la carte: ${card.card.question}`}
                      onClick={() =>
                        handleDeleteCard(card._id, card.card.question)
                      }
                      disabled={isDeletingCard}
                      size="small"
                      sx={{ ml: 1 }}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {allUserCards.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    <div className="UserPage__empty-state">
                      <p>
                        Aucune carte trouvée. Commencez par créer votre première
                        carte !
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </section>
  );
};

// 🎯 Composant principal UserPage - version modulaire et lisible
export const UserPage = () => {
  const [activeTab, setActiveTab] = useState<UserPageTab>("profile");

  // 🔄 Gestionnaire de changement d'onglet
  const handleTabChange = (_: React.SyntheticEvent, newTab: UserPageTab) => {
    setActiveTab(newTab);
  };

  return (
    <div className="UserPage">
      {/* 🎯 En-tête de la page */}
      <h2>Profil</h2>

      {/* 👤 En-tête utilisateur avec avatar et informations */}
      <UserHeader />

      <Divider />

      {/* 📋 Navigation par onglets */}
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tab label="Profil" value="profile" />
        <Tab label="Cartes" value="cards" />
      </Tabs>

      {/* 📋 Contenu de l'onglet Profil */}
      {activeTab === "profile" && <UserProfile />}

      {/* 🎴 Contenu de l'onglet Cartes */}
      {activeTab === "cards" && <UserCards />}
    </div>
  );
};

export default UserPage;
