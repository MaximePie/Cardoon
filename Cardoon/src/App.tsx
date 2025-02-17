import axios from "axios";
import "./styles/app.scss";
import { PopulatedUserCard, User } from "./types/common";
import CardForm from "./components/molecules/CardForm/CardForm";
import { ACTIONS, RESOURCES, useDelete, useFetch } from "./hooks/server";
import Card from "./components/molecules/Card/Card";
import { createContext, useContext, useEffect, useState } from "react";
import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import LoginPage from "./components/pages/LoginPage";
import RegisterPage from "./components/pages/RegisterPage";
import { Fab } from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { TokenErrorPage } from "./components/pages/TokenErrorPage/TokenErrorPage";

const Navbar = () => {
  const { user, logout } = useContext(UserContext);
  return (
    <div className="Navbar">
      {!user._id && (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Créer un compte</Link>
        </>
      )}
      {user._id && (
        <>
          <Link to="/">Jeu</Link>
          <Link to="/add-card">Ajouter une carte</Link>
          <Link to="/" onClick={logout}>
            Logout
          </Link>
        </>
      )}
    </div>
  );
};

const Game = () => {
  const { data, loading, fetch, error } = useFetch<PopulatedUserCard[]>(
    RESOURCES.USERCARDS
  );
  const { user } = useContext(UserContext);
  const [userCards, setUserCards] = useState<PopulatedUserCard[]>(data || []);

  useEffect(() => {
    if (data) {
      setUserCards(data);
    }
  }, [data]);

  const { deleteResource } = useDelete(RESOURCES.CARDS);
  if (loading)
    return (
      <p>
        Chargement... (Oui, c'est un fournisseur gratuit, 'faut qu'il démarre
        tahi, ça peut prendre une bonne minute. Au délà, appelez Geoffrey.)
      </p>
    );

  const deleteCard = async (cardId: string) => {
    await deleteResource(cardId);
    fetch();
  };

  const onUpdate = async (id: string) => {
    // Remove the card from the list, then fetch the new list
    setUserCards(userCards.filter((card) => card._id !== id));

    if (userCards.length <= 0) {
      // We intentionally wait 2 seconds before fetching the new list to wait for the card to be
      // updated
      setTimeout(() => {
        fetch();
      }, 2000);
    }
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

  // Make a prompt to generate new questions
  // The prompt asks the LLM API to generate new questions from the existing ones.
  // For each existing question, we pair it with the answer like this : [{
  //   "question": "What is the capital of France?", "answer": "Paris"}]
  const generateLLMQuestions = async () => {
    console.log("Incoming");
  };

  // Display a confirm modal
  const generateQuestions = () => {
    const answer = window.confirm(
      "Êtes-vous sûr de vouloir générer de nouvelles questions?"
    );

    if (answer) {
      generateLLMQuestions();
    }
  };

  return (
    <div>
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
          color="primary"
          aria-label="add"
          className="Cards__magic-wand-button"
          onClick={generateQuestions}
        >
          <AutoFixHighIcon />
        </Fab>
        {userCards.map((userCard: PopulatedUserCard) => (
          <Card
            key={userCard._id}
            card={userCard}
            onDelete={deleteCard}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
};

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
  logout: () => void;
  addScore: (score: number) => void;
}
export const UserContext = createContext<UserContextType>({
  user: {
    _id: "",
    username: "",
    score: 0,
  },
  setUser: () => {},
  logout: () => {},
  addScore: () => {},
});

export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { fetch, data } = useFetch<User>(ACTIONS.ME);

  const [user, setUser] = useState<User>({
    _id: "",
    username: "",
    score: 0,
  });

  useEffect(() => {
    // Check for user token in cookies
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="));

    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${
        token.split("=")[1]
      }`;
      fetch();
    }
  }, []);

  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data]);

  const addScore = (score: number) => {
    setUser({ ...user, score: user.score + score });
  };

  // Clear the cookie
  const logout = () => {
    document.cookie = "token=;max-age=0";
    setUser({ _id: "", username: "", score: 0 });
    // Redirect to /
    document.location.href = "/";
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        logout,
        addScore,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

const App = () => {
  return (
    <UserContextProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" Component={LoginPage} />
          <Route path="/" Component={Game} />
          <Route path="/add-card" Component={CardForm} />
          <Route path="/register" Component={RegisterPage} />
        </Routes>
      </Router>
    </UserContextProvider>
  );
};

export default App;
