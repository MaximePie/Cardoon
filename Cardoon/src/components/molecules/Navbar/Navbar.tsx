import { useContext } from "react";
import { UserContext } from "../../../context/UserContext";
import { Link } from "react-router-dom";

export default () => {
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
          <Link to="/character">Personnage</Link>
          <Link to="/add-card">Ajouter une carte</Link>
          <Link to="/" onClick={logout}>
            Logout
          </Link>
        </>
      )}
    </div>
  );
};
