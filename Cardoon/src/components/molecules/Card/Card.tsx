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
    <motion.div
      layout
      layoutId={`card-${userCardId}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        rotateY: isRecto ? 0 : 180, // Main animation only here
      }}
      transition={{
        duration: 0.5,
        layout: { duration: 0.3, ease: "easeOut" },
        rotateY: { duration: 0.3, ease: "easeInOut" },
      }}
      exit={{
        opacity: 0,
        width: 0,
        scale: 0.8,
        marginLeft: 0,
        marginRight: 0,
        transition: { duration: 0.4 },
      }}
      className={cardClassNames}
      style={{
        background: cardBackground,
        transformStyle: "preserve-3d",
        position: "relative", // Required as positioning context for absolutely positioned front/back faces in 3D flip animation
      }}
      onClick={onCardClick}
      onContextMenu={(e) => {
        e.preventDefault();
        succeed();
      }}
      data-card-id={userCardId}
    >
      {/* FRONT FACE - Always rendered */}
      <motion.div
        style={{
          backfaceVisibility: "hidden",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "8px",
          rotateY: 0, // Face avant à 0°
        }}
      >
        <Stack
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {category && (
            <Chip className="Card__category" label={category} size="small" />
          )}
          <p>
            {question}{" "}
            {expectedAnswers?.length ? `(${expectedAnswers.length})` : ""}
          </p>
          {imageLink && (
            <img
              src={imageLink}
              alt="Card image"
              style={{ width: "100%", borderRadius: "8px" }}
            />
          )}
        </Stack>
      </motion.div>

      {/* BACK FACE - Always rendered */}
      <motion.div
        style={{
          backfaceVisibility: "hidden",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "8px",
          rotateY: 180, // Face arrière à 180°
        }}
      >
        {showAnswer && (
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
        )}
      </motion.div>
    </motion.div>
  );
};

export default Card;
