import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import {
  Checkbox,
  Divider,
  IconButton,
  TableCell,
  TableRow,
} from "@mui/material";
import { useState } from "react";
import useIsMobile from "../../../../hooks/useIsMobile";
import { Card } from "../../../../types/common";

export default function UserCardRow({
  card,
  isDeleting,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: {
  card: Card;
  isDeleting: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: (newValues: Partial<Card>) => void;
  onDelete: () => void;
}) {
  const { isMobile } = useIsMobile();
  const [isEditing, setIsEditing] = useState(false);
  const [newValues, setNewValues] = useState<Partial<Card>>({
    question: card.question,
    answer: card.answer,
  });

  const handleEditClick = () => {
    setIsEditing(true);
  };

  /**
   * Forward the new values to the onEdit prop and exit editing mode
   */
  const handleEditSave = () => {
    setIsEditing(false);
    onEdit({ ...card, ...newValues });
  };

  return isMobile ? (
    <div
      key={card._id}
      className="UserPage__mobile-card"
      style={{
        opacity: isDeleting ? 0.7 : 1,
        transition: "opacity 0.3s ease",
      }}
    >
      <div className="UserPage__mobile-card-header">
        <div className="UserPage__mobile-card-actions">
          <Checkbox checked={isSelected} onChange={onSelect} />
          <IconButton
            aria-label={`Modifier la carte: ${card.question}`}
            onClick={handleEditClick}
            disabled={isDeleting}
            size="small"
            color="primary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label={`Supprimer la carte: ${card.question}`}
            onClick={onDelete}
            disabled={isDeleting}
            size="small"
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </div>
      </div>
      <div className="UserPage__mobile-card-content">
        <p>
          <strong>Q:</strong> {card.question}
        </p>
        <p>
          <strong>A:</strong> {card.answer}
        </p>
      </div>
      <Divider />
    </div>
  ) : (
    <TableRow
      key={card._id}
      style={{
        opacity: isDeleting ? 0.7 : 1,
        transition: "opacity 0.3s ease",
      }}
    >
      <TableCell>
        <Checkbox checked={isSelected} onChange={onSelect} />
      </TableCell>
      <TableCell>
        {isEditing ? (
          <input
            type="text"
            value={newValues.question}
            onChange={(e) =>
              setNewValues({ ...newValues, question: e.target.value })
            }
          />
        ) : (
          card.question
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <input
            type="text"
            value={newValues.answer}
            onChange={(e) =>
              setNewValues({ ...newValues, answer: e.target.value })
            }
          />
        ) : (
          card.answer
        )}
      </TableCell>
      <TableCell>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <IconButton
            aria-label={`Modifier la carte: ${card.question}`}
            onClick={isEditing ? handleEditSave : handleEditClick}
            disabled={isDeleting}
            size="small"
            color="primary"
          >
            {isEditing ? (
              <SaveIcon fontSize="small" />
            ) : (
              <EditIcon fontSize="small" />
            )}
          </IconButton>
          <IconButton
            aria-label={`Supprimer la carte: ${card.question}`}
            onClick={onDelete}
            disabled={isDeleting}
            size="small"
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </div>
      </TableCell>
    </TableRow>
  );
}
