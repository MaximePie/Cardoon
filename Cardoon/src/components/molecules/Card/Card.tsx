import { useContext, useEffect, useState } from "react";
import { PopulatedUserCard, User } from "../../../types/common";
import classNames from "classnames";
import { ACTIONS, usePut } from "../../../hooks/server";
import { UserContext } from "../../../App";

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
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    console.log(data); // Not triggered
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
