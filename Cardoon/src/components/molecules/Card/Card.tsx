import Edit from "@mui/icons-material/Edit";
import { Chip, IconButton } from "@mui/material";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { motion } from "motion/react";
import { PopulatedUserCard } from "../../../types/common";
import useCard from "./useCard";

interface CardProps {
  card: PopulatedUserCard;
  onUpdate: (card: PopulatedUserCard, isCorrect: boolean) => void;
  onEditClick: () => void;
  isFlashModeOn: boolean;
}

const Card = ({
  card,
  onUpdate: onAnswer,
  onEditClick,
  isFlashModeOn,
}: CardProps) => {
  const {
    cardClassNames,
    cardBackground,
    onCardClick,
    succeed,
    fail,
    isRecto,
    showAnswer,
    userCardId,
    question,
    answer,
    imageLink,
    category,
    expectedAnswers,
    interval,
  } = useCard(card, onAnswer, isFlashModeOn);
  return (
    <>
      <motion.div
        key={userCardId}
        // Fade-in with slide from bottom animation
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        exit={{ opacity: 0, y: 20, width: 0 }}
        className={cardClassNames}
        style={{ background: cardBackground }}
        onClick={onCardClick}
        onContextMenu={(e) => {
          e.preventDefault();
          succeed();
        }}
        data-card-id={userCardId}
      >
        {isRecto ? (
          <>
            <Stack
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {category && (
                <Chip
                  className="Card__category"
                  label={category}
                  size="small"
                />
              )}
              <p>
                {question}{" "}
                {expectedAnswers?.length ? `(${expectedAnswers.length})` : ""}
              </p>
              {imageLink && (
                <>
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
              <Chip className="Card__score" label={`🧠 ${interval}`} />
              <IconButton
                color="primary"
                onClick={onEditClick}
                className="Card__edit"
                size="small"
              >
                <Edit />
              </IconButton>
              <p>
                {answer}

                {expectedAnswers?.length && expectedAnswers.length > 0 ? (
                  <ul>
                    {expectedAnswers.map((expectedAnswer, index) => (
                      <li key={index}>{expectedAnswer}</li>
                    ))}
                  </ul>
                ) : undefined}
              </p>
              <Stack spacing={1} direction="row">
                <Button color="success" onClick={succeed}>
                  ok
                </Button>
                <Button color="secondary" onClick={fail}>
                  pas ok
                </Button>
              </Stack>
            </>
          )
        )}
      </motion.div>
    </>
  );
};

export default Card;
