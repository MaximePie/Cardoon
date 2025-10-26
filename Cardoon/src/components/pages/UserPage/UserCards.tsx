import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Checkbox,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useContext, useState } from "react";
import { SnackbarContext } from "../../../context/SnackbarContext";
import { useUser } from "../../../context/UserContext";
import { useUserCardsManager } from "../../../hooks/queries/useUserCards";
import useIsMobile from "../../../hooks/useIsMobile";
import Button from "../../atoms/Button/Button";
const CONFIRMATION_MESSAGES = {
  DELETE_CARD: (question: string) =>
    `Êtes-vous sûr de vouloir supprimer cette carte ?\n\nQuestion: "${question}"`,
} as const;

// 🎴 Composant gestion des cartes utilisateur
export default function UserCards() {
  const { user } = useUser();
  const { openSnackbarWithMessage } = useContext(SnackbarContext);
  const { isMobile } = useIsMobile();
  const [selectedCards, setSelectedCard] = useState<string[]>([]);
  const {
    cards: allUserCards,
    isLoading: isLoadingCards,
    deleteCard,
    deleteCards,
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

  const handleSelectCard =
    (cardId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        setSelectedCard((prev) => [...prev, cardId]);
      } else {
        setSelectedCard((prev) => prev.filter((id) => id !== cardId));
      }
    };

  const handleDeleteSelectedCards = () => {
    if (selectedCards.length === 0) return;

    const userConfirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer les ${selectedCards.length} cartes sélectionnées ?`
    );

    if (!userConfirmed) return;

    deleteCards(selectedCards);
    setSelectedCard([]); // Clear selection after deletion
  };

  return (
    <section className="UserPage__tab-content" aria-labelledby="cards-tab">
      <h3 id="cards-tab">
        Vos cartes ({allUserCards.length})
        <Button
          variant="primary"
          onClick={handleDeleteSelectedCards}
          disabled={selectedCards.length === 0}
        >
          Supprimer {selectedCards.length} carte(s)
        </Button>
      </h3>

      {/* 🔄 Gestion des états de chargement et d'erreur */}
      {isLoadingCards ? (
        <div className="UserPage__loading">
          <p>Chargement des cartes...</p>
        </div>
      ) : cardsError ? (
        <div className="UserPage__error">
          <p>Erreur lors du chargement des cartes: {cardsError.message}</p>
        </div>
      ) : !isMobile ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
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
                  <TableCell>
                    <Checkbox
                      checked={selectedCards.includes(card._id) || false}
                      onChange={handleSelectCard(card._id)}
                    />
                  </TableCell>
                  <TableCell>{card.card.question}</TableCell>
                  <TableCell>{card.card.answer}</TableCell>
                  <TableCell>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
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
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {allUserCards.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
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
      ) : (
        <div className="UserPage__mobile-cards">
          {allUserCards.map((card) => (
            <div
              key={card._id}
              className="UserPage__mobile-card"
              style={{
                opacity: isDeletingCard ? 0.7 : 1,
                transition: "opacity 0.3s ease",
              }}
            >
              <div className="UserPage__mobile-card-header">
                <div className="UserPage__mobile-card-actions">
                  <Checkbox
                    checked={selectedCards.includes(card._id) || false}
                    onChange={handleSelectCard(card._id)}
                  />
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
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>
              </div>
              <div className="UserPage__mobile-card-content">
                <p>
                  <strong>Q:</strong> {card.card.question}
                </p>
                <p>
                  <strong>A:</strong> {card.card.answer}
                </p>
              </div>
              <Divider />
            </div>
          ))}
          {allUserCards.length === 0 && (
            <div className="UserPage__empty-state">
              <p>
                Aucune carte trouvée. Commencez par créer votre première carte !
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
