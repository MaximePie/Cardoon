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
import { SnackbarContext } from "../../../context/SnackbarContext";

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export default () => {
  const { data, loading, fetch, error } = useFetch<{
    cards: PopulatedUserCard[];
    categories: FetchedCategory[];
  }>(RESOURCES.USERCARDS);
  const { openSnackbarWithMessage } = useContext(SnackbarContext);
  const { user } = useContext(UserContext);
  const [userCards, setUserCards] = useState<PopulatedUserCard[]>(
    data?.cards || []
  );
  const [editedCard, setEditedCard] = useState<PopulatedUserCard | null>(null);
  const [isEditModalActive, setEditModalActiveState] = useState(false);
  const [categories, setCategories] = useState<FetchedCategory[]>([]);

  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (data) {
      setUserCards(shuffleArray(data.cards));
      setCategories(data.categories);
      // console.log(
      //   data
      //     .filter(({ card }) => !card.imageLink && !!card.category)
      //     .map(({ card }) => `${card.question};${card.answer};${card.category}`)
      // );
    }
  }, [data]);

  if (loading)
    return (
      <div>
        Chargement... (Oui, c'est un fournisseur gratuit, 'faut qu'il démarre
        tahi, ça peut prendre une bonne minute. Au délà, appelez Geoffrey.)
      </div>
    );

  const onUpdate = async (id: string, interval: number, isCorrect: boolean) => {
    // Remove the card from the list
    setUserCards(userCards.filter((card) => card._id !== id));
    if (isCorrect) {
      openSnackbarWithMessage(`Score + ${interval}!`);
    }
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
  console.log(userCards);

  return (
    <div>
      {editedCard && (
        <EditCardForm
          close={() => setEditModalActiveState(false)}
          isOpen={isEditModalActive}
          editedCard={editedCard}
          categories={categories}
        />
      )}
      <div className="BrainCell">
        <h1>Obtenez des synapses!</h1>
        <div className="BrainCell__score">
          <span>{user.score} </span>
          <img
            className="BrainCell__image"
            src="https://imgs.search.brave.com/oL7lKgy4g446DksbsavhaGdOZll1gDcOT_KLS5r0SXk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/dmVjdG9yc3RvY2su/Y29tL2kvcHJldmll/dy0xeC82OS8wNS9i/cmFpbi1jZWxsLWlj/b24tdmVjdG9yLTQ4/MTU2OTA1LmpwZw"
            alt="BrainCell"
          />
        </div>
      </div>
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
    </div>
  );
};
