import "./styles/app.scss";
import CardForm from "./components/pages/CardFormPage/CardFormPage";
import { useContext } from "react";
import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import LoginPage from "./components/pages/LoginPage/LoginPage";
import RegisterPage from "./components/pages/RegisterPage";
import GamePage from "./components/pages/GamePage/GamePage";
import { SnackbarProvider } from "./context/SnackbarContext";
import { UserContext, UserContextProvider } from "./context/UserContext";

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

const App = () => {
  return (
    <UserContextProvider>
      <SnackbarProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/login" Component={LoginPage} />
            <Route path="/" Component={GamePage} />
            <Route path="/add-card" Component={CardForm} />
            <Route path="/register" Component={RegisterPage} />
          </Routes>
        </Router>
      </SnackbarProvider>
    </UserContextProvider>
  );
};

export default App;
