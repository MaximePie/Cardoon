import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useContext } from "react";
import { SnackbarContext } from "../../../../../context/SnackbarContext";
import { useUser } from "../../../../../hooks/useUser";
import { useUserCardsManager } from "../../../../../hooks/useUserCards";

// 🎯 Constantes pour les messages de confirmation
const CONFIRMATION_MESSAGES = {
  DELETE_CARD: (question: string) =>
    `Êtes-vous sûr de vouloir supprimer cette carte ?\n\nQuestion: "${question}"`,
} as const;

/**
 * Composant de gestion des cartes utilisateur
 * Responsabilité : Affichage et gestion (édition/suppression) des cartes
 */
export const UserCards = () => {
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

    // Suppression optimiste via TanStack Query
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
