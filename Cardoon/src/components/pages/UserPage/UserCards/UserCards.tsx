import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useUser } from "../../../../context/UserContext";
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
  const {
    user,
    allUserCards,
    isLoadingCards,
    deleteCard,
    deleteCards,
    isDeletingCard,
    isEditingCard,
    cardsError,
    editCard,
    invertCard,
    isInvertingCard,
  } = useUser();
  const { isMobile } = useIsMobile();
  const [selectedCards, setSelectedCard] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  if (!user) {
    return null; // Ou un indicateur de chargement
  }

  // Filtrer les cartes en fonction du terme de recherche
  const filteredCards = allUserCards.filter(
    (userCard) =>
      userCard.card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userCard.card.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <AnimatePresence>
        {selectedCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 0, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            style={{ position: "fixed", bottom: 20, right: 20, zIndex: 2000 }}
          >
            <Button
              variant="danger"
              onClick={handleDeleteSelectedCards}
              disabled={selectedCards.length === 0}
              customClassName="UserPage__delete-selected-button"
            >
              Supprimer {selectedCards.length} carte(s)
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <h3 id="cards-tab" className="UserPage__tab-title">
        Vos cartes ({filteredCards.length})
      </h3>
      <TextField
        variant="standard"
        placeholder="Rechercher une carte..."
        onChange={(e) => setSearchTerm(e.target.value)}
        size="small"
        fullWidth
        style={{ marginBottom: "1rem", margin: "0 10px" }}
      />

      {/* 🔄 Gestion des états de chargement et d'erreur */}
      {isLoadingCards ? (
        <div className="UserPage__loading">
          <Skeleton
            variant="rounded"
            width="100%"
            height={80}
            style={{ margin: "1rem" }}
          />
          <Skeleton
            variant="rounded"
            width="100%"
            height={80}
            style={{ margin: "1rem" }}
          />
          <Skeleton
            variant="rounded"
            width="100%"
            height={80}
            style={{ margin: "1rem" }}
          />
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
              {filteredCards.map((card) => (
                <UserCardRow
                  key={card._id}
                  card={card.card}
                  isSelected={selectedCards.includes(card._id) || false}
                  onSelect={handleSelectCard(card._id)}
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
              {filteredCards.length === 0 && (
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
          {filteredCards.map((card) => (
            <UserCardRow
              key={card._id}
              card={card.card}
              isSelected={selectedCards.includes(card._id) || false}
              onSelect={handleSelectCard(card._id)}
              onEdit={handleEditCard}
              onDelete={() => handleDeleteCard(card._id, card.card.question)}
              onInvert={() => handleInvertCard(card._id)}
              isDeleting={isDeletingCard}
              isEditingCard={isEditingCard}
              isInverting={isInvertingCard}
              childCard={
                filteredCards
                  .filter((uc) => uc.card.isInverted)
                  .find((uc) =>
                    uc.card.originalCardId
                      ? uc.card.originalCardId === card._id
                      : false
                  )?.card
              }
            />
          ))}
          {filteredCards.length === 0 && (
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
