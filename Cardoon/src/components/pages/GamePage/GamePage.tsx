import Card from "../../molecules/Card/Card";
import { Fab } from "@mui/material";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import { TokenErrorPage } from "../../pages/TokenErrorPage/TokenErrorPage";
import { RESOURCES, useFetch } from "../../../hooks/server";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../../../context/UserContext";
import { PopulatedUserCard } from "../../../types/common";
import { Link } from "react-router-dom";
import EditCardForm from "../../molecules/EditCardForm/EditCardForm";
import { FetchedCategory } from "../CardFormPage/CardFormPage";
import goldIcon from "../../../images/coin.png";
import { shuffleArray } from "../../../utils";
import Loader from "../../atoms/Loader/Loader";

export default () => {
  const { data, loading, fetch, error } = useFetch<{
    cards: PopulatedUserCard[];
    categories: FetchedCategory[];
  }>(RESOURCES.USERCARDS);
  const { user, getGoldMultiplier } = useContext(UserContext);
  const [userCards, setUserCards] = useState<PopulatedUserCard[]>(
    data?.cards || []
  );
  const [editedCard, setEditedCard] = useState<PopulatedUserCard | null>(null);
  const [isEditModalActive, setEditModalActiveState] = useState(false);
  const [categories, setCategories] = useState<FetchedCategory[]>([]);

  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (data) {
      setUserCards(
        shuffleArray(data.cards).sort((a: PopulatedUserCard) =>
          a.card.parentId ? -1 : 1
        )
      );
      setCategories(data.categories);
      // console.log(
      //   data
      //     .filter(({ card }) => !card.imageLink && !!card.category)
      //     .map(({ card }) => `${card.question};${card.answer};${card.category}`)
      // );
    }
  }, [data]);

  if (loading) return <Loader />;

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
        coin.classList.add("floating-coin--move");
        coin.style.left = `${footerRect.left + footerRect.width / 2}px`;
        coin.style.top = `${footerRect.top + footerRect.height / 2}px`;
      });

      setTimeout(() => {
        document.body.removeChild(coin);
      }, 2000);
    }
  };

  const onUpdate = async (id: string, isCorrect: boolean) => {
    // Remove the card from the list
    if (isCorrect) {
      // Coin animation
      const cardElement = document.querySelector(`[data-card-id="${id}"]`);
      if (cardElement) {
        const cardRect = cardElement.getBoundingClientRect();
        for (let i = 0; i < getGoldMultiplier() + 1; i++) {
          setTimeout(() => {
            addCoinsAnimation(cardRect);
          }, i * 200);
        }
      }
    }
    setUserCards(userCards.filter((card) => card._id !== id));
    if (userCards.length <= 0) {
      // We intentionally wait 2 seconds before fetching the new list to wait for the card to be
      // updated
      setTimeout(() => {
        fetch();
      }, 2000);
    }
  };

  const openEditCardForm = (card: PopulatedUserCard) => {
    setEditedCard(card);
    setEditModalActiveState(true);
  };

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
          categories={categories}
        />
      )}
      <div className="Cards">
        <Fab
          color={flash ? "warning" : "primary"}
          aria-label="flash"
          className="Cards__flash-button"
          onClick={() => setFlash(!flash)}
        >
          <ElectricBoltIcon />
        </Fab>
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
      <div className="GamePage__footer">
        <span className="GamePage__footer__element">
          <img
            className="GamePage__icon"
            src={goldIcon}
            alt="Gold"
            id="GamePage__footer__coins"
          />{" "}
          {user.gold}
        </span>
      </div>
    </div>
  );
};
