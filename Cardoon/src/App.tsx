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
  }, [url]);

  return { data, loading, error };
};

const App = () => {
  const { data, loading, error } = useFetch(RESOURCES.CARDS);
  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <div>
      <h1>Battez le monstre</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default App;
