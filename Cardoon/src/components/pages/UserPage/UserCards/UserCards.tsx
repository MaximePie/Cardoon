import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useContext, useState } from "react";
import { SnackbarContext } from "../../../../context/SnackbarContext";
import { useUser } from "../../../../context/UserContext";
import { useUserCardsManager } from "../../../../hooks/queries/useUserCards";
import useIsMobile from "../../../../hooks/useIsMobile";
import { Card } from "../../../../types/common";
import Button from "../../../atoms/Button/Button";
import UserCardRow from "./UserCardRow";
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
    isEditingCard,
    error: cardsError,
    editCard,
    invertCard,
    isInvertingCard,
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

  const handleEditCard = (newCard: Partial<Card>) => {
    editCard(newCard);
  };

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

  const handleInvertCard = (cardId: string) => {
    invertCard(cardId);
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
                <UserCardRow
                  key={card._id}
                  card={card.card}
                  isSelected={selectedCards.includes(card._id) || false}
                  onSelect={() => handleSelectCard(card._id)}
                  onEdit={handleEditCard}
                  onDelete={() =>
                    handleDeleteCard(card._id, card.card.question)
                  }
                  isDeleting={isDeletingCard}
                  isEditingCard={isEditingCard}
                  isInverting={isInvertingCard}
                  onInvert={() => handleInvertCard(card.card._id)}
                  childCard={
                    allUserCards
                      .filter((uc) => uc.card.isInverted)
                      .find((uc) =>
                        uc.card.originalCardId
                          ? uc.card.originalCardId === card.card._id
                          : false
                      )?.card
                  }
                />
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
            <UserCardRow
              key={card._id}
              card={card.card}
              isSelected={selectedCards.includes(card._id) || false}
              onSelect={() => handleSelectCard(card._id)}
              onEdit={handleEditCard}
              onDelete={() => handleDeleteCard(card._id, card.card.question)}
              onInvert={() => handleInvertCard(card._id)}
              isDeleting={isDeletingCard}
              isEditingCard={isEditingCard}
              isInverting={isInvertingCard}
              childCard={
                allUserCards
                  .filter((uc) => uc.card.isInverted)
                  .find((uc) =>
                    uc.card.originalCardId
                      ? uc.card.originalCardId === card._id
                      : false
                  )?.card
              }
            />
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
