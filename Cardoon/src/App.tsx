import axios from "axios";
import "./styles/App.scss";
import { PopulatedUserCard } from "./types/common";
import CardForm from "./components/molecules/CardForm/CardForm";
import { RESOURCES, useDelete, useFetch } from "./hooks/server";
import Card from "./components/molecules/Card/Card";
import { useEffect, useState } from "react";

const App = () => {
  const { data, loading, fetch, error } = useFetch<PopulatedUserCard[]>(
    RESOURCES.USERCARDS
  );
  const [userCards, setUserCards] = useState<PopulatedUserCard[]>(data || []);

  useEffect(() => {
    if (data) {
      setUserCards(data);
    }
  }, [data]);

  const { deleteResource } = useDelete(RESOURCES.CARDS);
  if (loading) return <p>Chargement...</p>;

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

  const onUpdate = async (id: string) => {
    // Remove the card from the list, then fetch the new list
    setUserCards(userCards.filter((card) => card._id !== id));
    fetch();
  };
  return (
    <div>
      <h1>Obtenez des synapses!</h1>
      <button onClick={seed}>Seed</button>
      <button onClick={login}>Login</button>
      {error && <p>Erreur : {error}</p>}
      <CardForm onAdd={fetch} />
      {userCards.map((userCard: PopulatedUserCard) => (
        <Card
          key={userCard._id}
          card={userCard}
          onDelete={deleteCard}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
};

export default App;
