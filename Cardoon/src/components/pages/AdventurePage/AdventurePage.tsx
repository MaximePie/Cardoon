import { useEffect, useState } from "react";
import enemy from "../../../assets/Enemies/NightBorne_idle.gif";
import { useUser } from "../../../hooks/contexts/useUser";
import { ACTIONS, usePut } from "../../../hooks/server";
import { PopulatedUserCard, User } from "../../../types/common";
import Card from "../../molecules/Card/Card";
interface PutResult {
  user: User;
  userCard: PopulatedUserCard;
}
const AdventurePage = () => {
  const { reviewUserCards, getReviewUserCards } = useUser();
  const [cardsInHand, setCardsInHand] = useState<PopulatedUserCard[]>(
    reviewUserCards.slice(0, 5)
  );

  const { put: updateUserCard, data: updateCardResponse } = usePut<PutResult>(
    ACTIONS.UPDATE_INTERVAL
  );

  useEffect(() => {
    setCardsInHand(
      reviewUserCards
        .filter((card) => updateCardResponse?.userCard._id !== card._id)
        .slice(0, 5)
    );
  }, [reviewUserCards, updateCardResponse]);

  const removeCard = (card: PopulatedUserCard, isCorrect: boolean) => {
    updateUserCard(card._id, { isCorrectAnswer: isCorrect });
    setCardsInHand((prev) => prev.filter((c) => c._id !== card._id));
    getReviewUserCards();
  };
  return (
    <div>
      <h1>Adventure Page</h1>
      <p>
        Bienvenue, valeureux aventurier ! Prête à devenir une héroïne ? Allons-y
        !
      </p>
      <img src={enemy} alt="Idle Enemy" />
      <div className="BossPage__Cards-part">
        {cardsInHand.map((userCard: PopulatedUserCard) => (
          <Card
            key={userCard._id}
            card={userCard}
            onUpdate={removeCard}
            isFlashModeOn={false}
            onEditClick={() => {}}
          />
        ))}
      </div>
    </div>
  );
};

export default AdventurePage;
