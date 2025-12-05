import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSnackbar } from "../../../context/SnackbarContext";
import { useUser } from "../../../context/UserContext/useUserContext";
import { useAdventure } from "../../../hooks/contexts/useAdventure";
import { ACTIONS, usePost } from "../../../hooks/server";
import { User } from "../../../types/common";
import { getErrorMessage } from "../../../utils/errorMessages";
import Input from "../../atoms/Input/Input";
import SubmitButton from "../../atoms/SubmitButton/SubmitButton";

interface LoginResponse {
  user: User;
  token: string;
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { openSnackbarWithMessage } = useSnackbar();
  const {
    user: { setUser, login },
    clearAllErrors,
  } = useUser();
  const { resetQueries: clearAdventureErrors } = useAdventure();
  const [isErroneous, setIsErroneous] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);

  const { post, data, error } = usePost<LoginResponse>(ACTIONS.LOGIN);
  const navigate = useNavigate();

  useEffect(() => {
    if (!email || !password) {
      setIsErroneous(true);
    } else {
      setIsErroneous(false);
    }
  }, [email, password]);

  // Remove the remaining Errors from other requests and pages
  useEffect(() => {
    clearAllErrors();
    clearAdventureErrors();
  }, [clearAllErrors, clearAdventureErrors]);

  // Handle errors from the API
  useEffect(() => {
    if (error) {
      const errorMessage = getErrorMessage(error);
      openSnackbarWithMessage(errorMessage, "error");
      setLoading(false);
    }
  }, [error, openSnackbarWithMessage]);

  useEffect(() => {
    if (data) {
      if (!data.token) {
        console.error("No token in response");
        setLoading(false);
        return;
      }
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      // Store it as a cookie with lifetime 90days
      document.cookie = `token=${data.token};max-age=${60 * 60 * 24 * 90}`;
      setUser(data.user);
      login();

      navigate("/");
    }
  }, [data, setUser, navigate, login]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      openSnackbarWithMessage("Veuillez remplir tous les champs.", "error");
      return;
    }

    setLoading(true);
    post({ email, password, rememberMe });
  };

  return (
    <div className="LoginPage">
      <form onSubmit={handleSubmit} className="LoginPage__form">
        <h1 className="LoginPage__title">Connexion</h1>
        <p className="LoginPage__subtitle">
          Pas encore de compte ?{" "}
          <Link className="LoginPage__link" to="/register">
            Crée-le maintenant
          </Link>
        </p>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="LoginPage__form-group"
        />
        <Input
          label="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="LoginPage__form-group"
        />
        <div className="LoginPage__form-options">
          <label className="LoginPage__remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            Rester connecté
          </label>
          <a href="#" className="link">
            Mot de passe oublié ?
          </a>
        </div>
        <div className="LoginPage__actions">
          <SubmitButton
            className="LoginPage__submit"
            isLoading={loading}
            disabled={isErroneous}
          >
            Se connecter
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
