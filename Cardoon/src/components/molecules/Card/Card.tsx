import { useContext, useEffect, useState } from "react";
import { PopulatedUserCard, User } from "../../../types/common";
import classNames from "classnames";
import { ACTIONS, usePut } from "../../../hooks/server";
import { UserContext } from "../../../App";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import { Chip, Divider, IconButton } from "@mui/material";

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
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (data) {
      setUser(data.user);
    }
  }, [data]);

  const cardClassNames = classNames("Card", {
    "Card--verso": !isRecto,
    "Card--isFlipping": isFlipping,
  });

  // If recto, set to false, else do nothing
  const onCardClick = () => {
    if (isRecto) {
      setIsFlipping(true);
      flipCard(false);
      setTimeout(() => {
        setShowAnswer(true);
        setIsFlipping(false);
      }, 200);
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
          <Chip className="Card__score" label={`🧠 ${interval}`} />
          <Stack
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <p>{question}</p>
            {imageLink && (
              <>
                <Divider sx={{ my: 2, borderColor: "rgba(0, 0, 0, 0.12)" }} />
                <img
                  src={imageLink}
                  alt="Card image"
                  style={{ width: "100%", borderRadius: "8px" }}
                />
              </>
            )}
          </Stack>
        </>
      ) : (
        showAnswer && (
          <>
            <p>{answer}</p>
            <Stack spacing={1} direction="row">
              <Button color="success" onClick={succeed}>
                ok
              </Button>
              <Button color="secondary" onClick={fail}>
                pas ok
              </Button>
              <IconButton
                color="error"
                onClick={(e) => handleDeleteClick(cardId, e)}
                className="Card__delete"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
          </>
        )
      )}
    </div>
  );
};
