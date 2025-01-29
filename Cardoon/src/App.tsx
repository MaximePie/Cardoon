import React, { useEffect, useState } from "react";
import axios from "axios";

// Resources
const RESOURCES = {
  CARDS: "cards",
  // MONSTERS: "monsters",
  // PLAYERS: "players",
};

// Custom hook to get data
const useFetch = (resource: string) => {
  const url = "http://localhost:8082/api/" + resource;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("null");

  useEffect(() => {
    fetch();
  }, [url]);

  const fetch = () => {
    axios
      .get(url)
      .then((response) => {
        console.log(response.data);
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

  const post = (payload: any) => {
    setLoading(true);
    axios
      .post(url, payload)
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message + " " + err.response.data.errorMessage);
        setLoading(false);
      });
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

const useDelete = (resource: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("null");

  const deleteResource = async (id: number) => {
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
  _id: number;
  question: string;
  answer: string;
}

interface CardProps {
  card: Card;
  onDelete: (id: number) => void;
}
const Card = ({ card, onDelete }: CardProps) => {
  const { question, answer, _id } = card;
  const [isRecto, flipCard] = useState(true);
  return (
    <div className="Card">
      {isRecto ? (
        <h2 onClick={() => flipCard(!isRecto)}>
          {question}
          <button onClick={() => onDelete(_id)}>Delete</button>
        </h2>
      ) : (
        <>
          <h2>{answer}</h2>
          <button>ok</button>
          <button>pas ok</button>
        </>
      )}
    </div>
  );
};

const App = () => {
  const { data, loading, fetch } = useFetch(RESOURCES.CARDS);
  const { deleteResource } = useDelete(RESOURCES.CARDS);
  if (loading) return <p>Chargement...</p>;
  // if (error) return <p>Erreur : {error}</p>;
  const cards: [] = data || [];

  const deleteCard = async (cardId: number) => {
    await deleteResource(cardId);
    fetch();
  };

  return (
    <div>
      <h1>Battez le monstre</h1>
      <CardForm onAdd={fetch} />
      {cards.map((card: Card) => (
        <Card key={card._id} card={card} onDelete={deleteCard} />
      ))}
    </div>
  );
};

export default App;
