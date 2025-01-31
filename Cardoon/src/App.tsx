import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles/App.scss";
import classNames from "classnames";
import Cookies from "js-cookie";

// Resources
const RESOURCES = {
  USERCARDS: "userCards",
  CARDS: "cards",
  // MONSTERS: "monsters",
  // PLAYERS: "players",
};

const ACTIONS = {
  UPDATE_INTERVAL: "userCards/updateInterval",
};

// Custom hook to get data
const useFetch = <T,>(resource: string) => {
  const url = "http://localhost:8082/api/" + resource;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("null");

  useEffect(() => {
    fetch();
  }, [url]);

  const fetch = () => {
    axios.defaults.headers.common["Authorization"] = `Bearer ${Cookies.get(
      "token"
    )}`;
    axios
      .get(url)
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message + " " + err.response.data.errorMessage);
        setLoading(false);
      });
  };

  return { data, loading, error, fetch };
};

const usePost = (resource: string) => {
  const url = "http://localhost:8082/api/" + resource;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("null");

  const post = async (payload: any) => {
    setLoading(true);
    try {
      axios.defaults.headers.common["Authorization"] = `Bearer ${Cookies.get(
        "token"
      )}`;
      const response = await axios.post(url, payload);
      setData(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message + " " + err.response.data.errorMessage);
      setLoading(false);
    }
  };

  return { data, loading, error, post };
};

interface CardFormProps {
  onAdd: () => void;
}

/**
 * question: String
 * answer: String
 * @returns
 */
const CardForm = ({ onAdd }: CardFormProps) => {
  const { post } = usePost(RESOURCES.CARDS);

  const [newCard, setNewCard] = useState({
    question: "",
    answer: "",
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCard({
      ...newCard,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await post(newCard);
    setNewCard({
      question: "",
      answer: "",
    });

    onAdd();
  };

  return (
    <form onSubmit={onSubmit}>
      <label>
        Question:
        <input
          type="text"
          name="question"
          value={newCard.question}
          onChange={onChange}
        />
      </label>
      <label>
        Réponse:
        <input
          type="text"
          name="answer"
          value={newCard.answer}
          onChange={onChange}
        />
      </label>
      <button type="submit">Ajouter</button>
    </form>
  );
};

const usePut = (resource: string) => {
  const url = "http://localhost:8082/api/" + resource;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("null");

  const put = async (id: string, payload: any) => {
    setLoading(true);
    try {
      axios.defaults.headers.common["Authorization"] = `Bearer ${Cookies.get(
        "token"
      )}`;
      const response = await axios.put(url + "/" + id, payload);
      setData(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message + " " + err.response.data.errorMessage);
      setLoading(false);
    }
  };

  return { data, loading, error, put };
};
const useDelete = (resource: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("null");

  const deleteResource = async (id: string) => {
    axios.defaults.headers.common["Authorization"] = `Bearer ${Cookies.get(
      "token"
    )}`;
    const url = "http://localhost:8082/api/" + resource + "/" + id;
    setLoading(true);
    try {
      await axios.delete(url).catch((err) => {
        setError(err.message + " " + err.response.data.errorMessage);
        setLoading(false);
      });
    } catch (err: any) {
      setError(err.message + " " + err.response.data.errorMessage);
      setLoading(false);
    }
  };

  return { loading, error, deleteResource };
};

interface Card {
  _id: string;
  question: string;
  answer: string;
  interval: number;
}

interface CardProps {
  card: PopulatedUserCard;
  onDelete: (id: string) => void;
}
const Card = ({ card, onDelete }: CardProps) => {
  const {
    card: { question, answer },
    _id,
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
    put(_id, { isCorrectAnswer: true });
  };

  const fail = () => {
    put(_id, { isCorrectAnswer: false });
  };

  return (
    <div className={cardClassNames} onClick={onCardClick}>
      {isRecto ? (
        <p>
          {question}
          <span>🎯 {interval}</span>
          <button onClick={() => onDelete(_id)}>Delete</button>
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

interface PopulatedUserCard {
  card: Card;
  interval: number;
  lastReviewed: string;
  nextReview: string;
  _id: string;
}

const App = () => {
  const { data, loading, fetch } = useFetch<PopulatedUserCard[]>(
    RESOURCES.USERCARDS
  );
  const { deleteResource } = useDelete(RESOURCES.CARDS);
  if (loading) return <p>Chargement...</p>;
  // if (error) return <p>Erreur : {error}</p>;
  const cards: PopulatedUserCard[] = data || [];

  const deleteCard = async (cardId: string) => {
    await deleteResource(cardId);
    fetch();
  };

  const seed = async () => {
    const confirm = window.confirm("Voulez-vous vraiment supprimer tout ?");
    if (confirm) {
      await axios.get("http://localhost:8082/api/users/seed");
      fetch();
    }
  };

  // Send John Doe to the server
  const login = async () => {
    const data = await axios.post("http://localhost:8082/api/users/login", {
      username: "john",
      password: "doe",
    });

    if (!data.data.token) {
      console.error("No token in response");
      return;
    }
    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${data.data.token}`;

    // Store it as a cookie with lifetime 90days
    document.cookie = `token=${data.data.token};max-age=${60 * 60 * 24 * 90}`;
    fetch();
  };

  return (
    <div>
      <h1>Battez le monstre</h1>
      <button onClick={seed}>Seed</button>
      <button onClick={login}>Login</button>
      <CardForm onAdd={fetch} />
      {cards.map((userCard: PopulatedUserCard) => (
        <Card key={userCard._id} card={userCard} onDelete={deleteCard} />
      ))}
    </div>
  );
};

export default App;
