import { useContext, useEffect, useState } from "react";
import { PopulatedUserCard, User } from "../../../types/common";
import classNames from "classnames";
import { ACTIONS, usePut } from "../../../hooks/server";
import { UserContext } from "../../../App";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";

interface CardProps {
  card: PopulatedUserCard;
  onDelete: (id: string) => void;
  onUpdate: (id: string) => void;
}

interface PutResult {
  user: User;
}
export default ({ card, onDelete, onUpdate: onAnswer }: CardProps) => {
  const {
    card: { question, answer, imageLink, _id: cardId },
    _id: userCardId,
    interval,
  } = card;
  const [isRecto, flipCard] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const { put, data } = usePut<PutResult>(ACTIONS.UPDATE_INTERVAL);
  const { setUser, addScore } = useContext(UserContext);

  useEffect(() => {
    console.log("Data updated:", data); // Not triggered
    if (data) {
      setUser(data.user);
    }
  }, [data]);

  const cardClassNames = classNames("Card", {
    "Card--verso": !isRecto,
  });

  // If recto, set to false, else do nothing
  const onCardClick = () => {
    if (isRecto) {
      flipCard(false);
      setTimeout(() => {
        setShowAnswer(true);
      }, 400);
    }
  };

  const succeed = async () => {
    put(userCardId, { isCorrectAnswer: true });
    addScore(card.interval);
    onAnswer(userCardId);
  };

  const fail = () => {
    put(userCardId, { isCorrectAnswer: false });
    onAnswer(userCardId);
  };

  const handleDeleteClick = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirm = window.confirm(
      "Are you sure you want to delete this card?"
    );
    if (confirm) onDelete(id);
  };

  return (
    <div className={cardClassNames} onClick={onCardClick}>
      {isRecto ? (
        <>
          <h5>
            {question} <span>🧠 {interval}</span>
          </h5>
          {imageLink && <img src={imageLink} alt="Card image" />}
        </>
      ) : (
        showAnswer && (
          <>
            <h5>{answer}</h5>
            <Stack spacing={2} direction="row">
              <Button color="success" onClick={succeed}>
                ok
              </Button>
              <Button color="secondary" onClick={fail}>
                pas ok
              </Button>
              <Button
                color="error"
                onClick={(e) => handleDeleteClick(cardId, e)}
                startIcon={<DeleteIcon />}
              >
                Supprimer
              </Button>
            </Stack>
          </>
        )
      )}
    </div>
  );
};
