import Card from "../../molecules/Card/Card";
import { TokenErrorPage } from "../../pages/TokenErrorPage/TokenErrorPage";
import { ACTIONS, RESOURCES, useFetch, usePut } from "../../../hooks/server";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../../../context/UserContext";
import { PopulatedUserCard, User } from "../../../types/common";
import { Link } from "react-router-dom";
import EditCardForm from "../../molecules/EditCardForm/EditCardForm";
import { FetchedCategory } from "../CardFormPage/CardFormPage";
import goldIcon from "../../../images/coin.png";
import { shuffleArray } from "../../../utils";
import Loader from "../../atoms/Loader/Loader";
import { GameFooter } from "../../molecules/Footer/Footer";

interface PutResult {
  user: User;
  userCard: PopulatedUserCard;
}
export default () => {
  const { data, loading, error } = useFetch<{
    cards: PopulatedUserCard[];
    categories: FetchedCategory[];
  }>(RESOURCES.USERCARDS);
  const { user, setUser } = useContext(UserContext);
  const [userCards, setUserCards] = useState<PopulatedUserCard[]>(
    data?.cards || []
  );
  const [editedCard, setEditedCard] = useState<PopulatedUserCard | null>(null);
  const [isEditModalActive, setEditModalActiveState] = useState(false);
  const [categories, setCategories] = useState<FetchedCategory[]>([]);

  const [flash, setFlash] = useState(false);
  const { put, data: updateCardResponse } = usePut<PutResult>(
    ACTIONS.UPDATE_INTERVAL
  );
  useEffect(() => {
    if (updateCardResponse) {
      setUser(updateCardResponse.user);
      if (
        updateCardResponse.user.currentDailyGoal.target ===
        updateCardResponse.user.currentDailyGoal.progress
      ) {
        alert(
          "Bravo ! Vous avez atteint votre objectif quotidien. Vous avez gagné 1 pièce d'or !"
        );
      }
    }
  }, [updateCardResponse]);

  useEffect(() => {
    if (data) {
      setUserCards(
        shuffleArray(data.cards).sort((a: PopulatedUserCard) =>
          a.card.parentId ? -1 : 1
        )
      );
      setCategories(data.categories);
    }
  }, [data]);

  // BLACK MAGIC
  const addCoinsAnimation = (cardRect: DOMRect) => {
    const footerElement = document.querySelector("#GamePage__footer__coins");

    if (footerElement) {
      const footerRect = footerElement.getBoundingClientRect();

      const coin = document.createElement("img");
      coin.src = goldIcon;
      coin.className = "floating-coin";
      coin.style.position = "fixed";
      coin.style.left = `${cardRect.left + cardRect.width / 2}px`;
      coin.style.top = `${cardRect.top + cardRect.height / 2}px`;
      document.body.appendChild(coin);

      // Trigger the CSS transition by adding a class
      requestAnimationFrame(() => {
        coin.style.left = `${footerRect.left + footerRect.width / 2 - 10}px`;
        coin.style.top = `${footerRect.top + footerRect.height / 2 - 10}px`;
      });

      setTimeout(() => {
        document.body.removeChild(coin);
      }, 2000);
    }
  };

  const onUpdate = async (id: string, isCorrect: boolean) => {
    put(id, {
      isCorrectAnswer: isCorrect,
    });
    // Remove the card from the list
    if (isCorrect) {
      // Coin animation
      const cardElement = document.querySelector(`[data-card-id="${id}"]`);
      if (cardElement) {
        const cardRect = cardElement.getBoundingClientRect();
        for (let i = 0; i < user.currentGoldMultiplier + 1; i++) {
          setTimeout(() => {
            addCoinsAnimation(cardRect);
          }, i * 200);
        }
      }
    }
    setUserCards(userCards.filter((card) => card._id !== id));
  };

  const openEditCardForm = (card: PopulatedUserCard) => {
    setEditedCard(card);
    setEditModalActiveState(true);
  };

  // Remove from the list
  const removeCard = (id: string) => {
    setUserCards([...userCards.filter((card) => card._id !== id)]);
  };

  if (loading)
    return (
      <div className="GamePage__loader">
        <Loader />
      </div>
    );

  if (!user) {
    return (
      <div>
        <h1>
          Bienvenue sur Cardoon, commencez par créer un compte ou vous connecter
          !
        </h1>
        <Link to="/login">Se connecter</Link>
        <Link to="/register">S'inscrire</Link>
      </div>
    );
  }

  if (error === "Invalid token") {
    return <TokenErrorPage />;
  }

  if (error) {
    return <p>Erreur: {error}</p>;
  }

  return (
    <div className="GamePage">
      {editedCard && (
        <EditCardForm
          close={() => setEditModalActiveState(false)}
          isOpen={isEditModalActive}
          editedCard={editedCard}
          afterDelete={() => removeCard(editedCard._id)}
          categories={categories}
        />
      )}
      <div className="Cards">
        {userCards.map((userCard: PopulatedUserCard) => (
          <Card
            key={userCard._id}
            card={userCard}
            onUpdate={onUpdate}
            onEditClick={() => openEditCardForm(userCard)}
            isFlashModeOn={flash}
          />
        ))}
      </div>
      <GameFooter
        isFlashModeOn={flash}
        setFlash={setFlash}
        currentPage="game"
      />
    </div>
  );
};
