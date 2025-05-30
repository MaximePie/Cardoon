import { useContext, useState } from "react";
import { PopulatedUserCard } from "../../../types/common";
import classNames from "classnames";
import { UserContext } from "../../../context/UserContext";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Edit from "@mui/icons-material/Edit";
import { Chip, IconButton } from "@mui/material";

const stringToRgb = (text: String) => {
  let hash = 0;

  // Calcule un hash simple basé sur le code ASCII de chaque caractère
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0; // Assure une conversion à un entier 32 bits
  }

  // Décompose le hash en trois valeurs (0–255)
  let r = (hash >> 16) & 255;
  let g = (hash >> 8) & 255;
  let b = hash & 255;

  // On "éclaircit" un peu la couleur en la décalant vers le blanc
  const ratio = 0.6; // Ajustez pour éclaircir plus ou moins
  r = Math.round(r + (255 - r) * ratio);
  g = Math.round(g + (255 - g) * ratio);
  b = Math.round(b + (255 - b) * ratio);

  return `rgb(${r}, ${g}, ${b})`;
};

interface CardProps {
  card: PopulatedUserCard;
  onUpdate: (id: string, isCorrect: boolean) => void;
  onEditClick: () => void;
  isFlashModeOn: boolean;
}

export default ({
  card,
  onUpdate: onAnswer,
  onEditClick,
  isFlashModeOn,
}: CardProps) => {
  const {
    card: { question, answer, imageLink, category },
    _id: userCardId,
    interval,
  } = card;
  const [isRecto, flipCard] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const { addScore, earnGold } = useContext(UserContext);
  const [isFlipping, setIsFlipping] = useState(false);

  const cardClassNames = classNames("Card", {
    "Card--verso": !isRecto,
    "Card--isFlipping": isFlipping,
  });
  const cardBackground = `linear-gradient(  
  130deg,  
  ${stringToRgb(category || "")},  
  #ffffff  
)`;

  // If recto, set to false, else do nothing
  const onCardClick = () => {
    if (isRecto) {
      if (isFlashModeOn) {
        succeed();
      } else {
        setIsFlipping(true);
        flipCard(false);
        setTimeout(() => {
          setShowAnswer(true);
          setIsFlipping(false);
        }, 200);
      }
    }
  };

  const succeed = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
    }
    onAnswer(userCardId, true);
    addScore(card.interval);
    earnGold(1);
  };

  const fail = () => {
    onAnswer(userCardId, false);
  };

  return (
    <>
      <div
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
              <p>{question}</p>
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
              <p>{answer}</p>
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
      </div>
    </>
  );
};
