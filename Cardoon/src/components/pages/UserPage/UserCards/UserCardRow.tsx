import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import SyncIcon from "@mui/icons-material/Sync";
import {
  Checkbox,
  Divider,
  IconButton,
  TableCell,
  TableRow,
  TextField,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import useIsMobile from "../../../../hooks/useIsMobile";
import { Card } from "../../../../types/common";

interface UserCardRowProps {
  card: Card;
  isDeleting: boolean;
  isEditingCard: boolean;
  isInverting: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: (newValues: Partial<Card>) => void;
  onDelete: () => void;
  onInvert: () => void;
  childCard?: Card;
}

interface EditableValues {
  question: string;
  answer: string;
}

export default function UserCardRow({
  card,
  isDeleting,
  isEditingCard,
  isInverting,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onInvert,
  childCard,
}: UserCardRowProps) {
  const { isMobile } = useIsMobile();
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<EditableValues>({
    question: card.question,
    answer: card.answer,
  });

  // Synchroniser les valeurs d'édition avec les props de la carte
  useEffect(() => {
    if (!isEditing) {
      setEditValues({
        question: card.question,
        answer: card.answer,
      });
    }
  }, [card.question, card.answer, isEditing]);

  const handleInvertCard = useCallback(() => {
    onInvert();
  }, [onInvert]);

  const handleEditStart = useCallback(() => {
    setEditValues({
      question: card.question,
      answer: card.answer,
    });
    setIsEditing(true);
  }, [card.question, card.answer]);

  const handleEditCancel = useCallback(() => {
    setEditValues({
      question: card.question,
      answer: card.answer,
    });
    setIsEditing(false);
  }, [card.question, card.answer]);

  const handleEditSave = useCallback(() => {
    // Validation simple
    const trimmedQuestion = editValues.question.trim();
    const trimmedAnswer = editValues.answer.trim();

    if (!trimmedQuestion || !trimmedAnswer) {
      return; // Ne pas sauvegarder si les champs sont vides
    }

    setIsEditing(false);
    onEdit({
      ...card,
      question: trimmedQuestion,
      answer: trimmedAnswer,
    });
  }, [editValues, card, onEdit]);

  const handleQuestionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditValues((prev) => ({
        ...prev,
        question: e.target.value,
      }));
    },
    []
  );

  const handleAnswerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditValues((prev) => ({
        ...prev,
        answer: e.target.value,
      }));
    },
    []
  );

  const containerStyle = {
    opacity: isDeleting ? 0.7 : 1,
    transition: "opacity 0.3s ease",
  };

  const actionButtonsStyle = {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  };

  // Fonction pour rendre les boutons d'action
  const renderActionButtons = () => (
    <>
      <IconButton
        disabled={!!childCard || isInverting}
        color="warning"
        aria-label={`Créer une question inverse pour la carte: ${card.question}`}
        onClick={handleInvertCard}
        size="medium"
      >
        <SyncIcon fontSize="medium" />
      </IconButton>
      <IconButton
        aria-label={`${isEditing ? "Sauvegarder" : "Modifier"} la carte: ${card.question}`}
        onClick={isEditing ? handleEditSave : handleEditStart}
        disabled={isDeleting || (isEditingCard && !isEditing)}
        size="medium"
        color="primary"
      >
        {isEditing ? (
          <SaveIcon fontSize="medium" />
        ) : (
          <EditIcon fontSize="medium" />
        )}
      </IconButton>
      {isEditing && (
        <IconButton
          aria-label={`Annuler l'édition de la carte: ${card.question}`}
          onClick={handleEditCancel}
          disabled={isDeleting}
          size="medium"
          color="secondary"
        >
          <CancelIcon fontSize="medium" />
        </IconButton>
      )}
      <IconButton
        aria-label={`Supprimer la carte: ${card.question}`}
        onClick={onDelete}
        disabled={isDeleting || isEditing}
        size="medium"
        color="error"
      >
        <DeleteIcon fontSize="medium" />
      </IconButton>
    </>
  );

  if (isMobile) {
    return (
      <div
        key={card._id}
        className="UserPage__mobile-card"
        style={containerStyle}
      >
        <div className="UserPage__mobile-card-header">
          <div className="UserPage__mobile-card-actions">
            <Checkbox checked={isSelected} onChange={onSelect} />
            {renderActionButtons()}
          </div>
        </div>
        <div className="UserPage__mobile-card-content">
          {isEditing ? (
            <>
              <TextField
                label="Question"
                value={editValues.question}
                onChange={handleQuestionChange}
                fullWidth
                size="medium"
                margin="dense"
                multiline
                rows={2}
              />
              <TextField
                label="Réponse"
                value={editValues.answer}
                onChange={handleAnswerChange}
                fullWidth
                size="medium"
                margin="dense"
                multiline
                rows={2}
              />
            </>
          ) : (
            <>
              <p className="UserPage__mobile-card-question">
                <strong>Q:</strong> {card.question}
              </p>
              <p className="UserPage__mobile-card-answer">
                <strong>A:</strong> {card.answer}
              </p>
            </>
          )}
        </div>
        <Divider />
      </div>
    );
  }

  return (
    <TableRow key={card._id} style={containerStyle}>
      <TableCell>
        <Checkbox checked={isSelected} onChange={onSelect} />
      </TableCell>
      <TableCell>
        {isEditing ? (
          <TextField
            value={editValues.question}
            onChange={handleQuestionChange}
            fullWidth
            size="medium"
            variant="outlined"
            multiline
            maxRows={4}
          />
        ) : (
          card.question
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <TextField
            value={editValues.answer}
            onChange={handleAnswerChange}
            fullWidth
            size="medium"
            variant="outlined"
            multiline
            maxRows={4}
          />
        ) : (
          card.answer
        )}
      </TableCell>
      <TableCell>
        <div style={actionButtonsStyle}>{renderActionButtons()}</div>
      </TableCell>
    </TableRow>
  );
}
