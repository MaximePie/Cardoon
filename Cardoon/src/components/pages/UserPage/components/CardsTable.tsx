import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Checkbox,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useCallback } from "react";
import { PopulatedUserCard } from "../../../../types/common";
import Button from "../../../atoms/Button/Button";

interface CardsTableProps {
  cards: PopulatedUserCard[];
  selectedCards: string[];
  isDeletingCard: boolean;
  onToggleSelection: (cardId: string) => void;
  onEditCard: (cardId: string) => void;
  onDeleteCard: (cardId: string, cardQuestion: string) => void;
  onDeleteSelected: () => void;
}

export const CardsTable = ({
  cards,
  selectedCards,
  isDeletingCard,
  onToggleSelection,
  onEditCard,
  onDeleteCard,
  onDeleteSelected,
}: CardsTableProps) => {
  const handleEditCard = useCallback(
    (cardId: string) => onEditCard(cardId),
    [onEditCard]
  );

  const handleDeleteCard = useCallback(
    (cardId: string, question: string) => onDeleteCard(cardId, question),
    [onDeleteCard]
  );

  if (cards.length === 0) {
    return (
      <div className="UserPage__empty-state">
        <p>Aucune carte trouvée. Commencez par créer votre première carte !</p>
      </div>
    );
  }

  return (
    <>
      <div className="UserPage__cards-actions">
        <h3>Vos cartes ({cards.length})</h3>
        <Button
          onClick={onDeleteSelected}
          disabled={selectedCards.length === 0 || isDeletingCard}
          variant="danger"
        >
          Supprimer ({selectedCards.length}) cartes
        </Button>
      </div>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>Question</TableCell>
              <TableCell>Réponse</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cards.map((card) => (
              <TableRow
                key={card._id}
                style={{
                  opacity: isDeletingCard ? 0.7 : 1,
                  transition: "opacity 0.3s ease",
                }}
                hover
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedCards.includes(card._id)}
                    onChange={() => onToggleSelection(card._id)}
                    disabled={isDeletingCard}
                    inputProps={{
                      "aria-label": `Sélectionner la carte: ${card.card.question}`,
                    }}
                  />
                </TableCell>
                <TableCell>{card.card.question}</TableCell>
                <TableCell>{card.card.answer}</TableCell>
                <TableCell align="center">
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
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
