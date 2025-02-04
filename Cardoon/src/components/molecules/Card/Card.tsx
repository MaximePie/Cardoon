import { useState } from "react";
import { PopulatedUserCard } from "../../../types/common";
import classNames from "classnames";
import { ACTIONS, usePut } from "../../../hooks/server";

interface CardProps {
  card: PopulatedUserCard;
  onDelete: (id: string) => void;
  onUpdate: (id: string) => void;
}

export default ({ card, onDelete, onUpdate: onAnswer }: CardProps) => {
  const {
    card: { question, answer, imageLink, _id: cardId },
    _id: userCardId,
    interval,
  } = card;
  const [isRecto, flipCard] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const { put } = usePut(ACTIONS.UPDATE_INTERVAL);

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

  const succeed = () => {
    put(userCardId, { isCorrectAnswer: true });
    onAnswer(userCardId);
  };

  const fail = () => {
    put(userCardId, { isCorrectAnswer: false });
    onAnswer(userCardId);
  };

  const handleDeleteClick = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await onDelete(id);
  };

  return (
    <div className={cardClassNames} onClick={onCardClick}>
      {isRecto ? (
        <p>
          {question}
          <span>🧠 {interval}</span>
          <button onClick={(e) => handleDeleteClick(cardId, e)}>Delete</button>
          {imageLink && <img src={imageLink} alt="Card image" />}
        </p>
      ) : (
        showAnswer && (
          <>
            <p>{answer}</p>
            <button onClick={succeed}>ok</button>
            <button onClick={fail}>pas ok</button>
          </>
        )
      )}
    </div>
  );
};
