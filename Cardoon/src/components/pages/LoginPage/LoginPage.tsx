import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../../context/UserContext/useUserContext";
import { ACTIONS, usePost } from "../../../hooks/server";
import { User } from "../../../types/common";
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
  const { setUser, refresh } = useUser();
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [isErroneous, setIsErroneous] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);

  const { post, data, error } = usePost<LoginResponse>(ACTIONS.LOGIN);
  const navigate = useNavigate();

  useEffect(() => {
    if (!email || !password) {
      setIsErroneous(true);
    } else {
      setIsErroneous(false);
      setFormError(undefined);
    }
  }, [email, password]);

  useEffect(() => {
    if (data) {
      if (!data.token) {
        console.error("No token in response");
        return;
      }
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      // Store it as a cookie with lifetime 90days
      document.cookie = `token=${data.token};max-age=${60 * 60 * 24 * 90}`;
      setUser(data.user);
      refresh();

      navigate("/");
    }
  }, [data, setUser, navigate, refresh]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      setFormError("Please fill in all fields");
      setLoading(false);
      return;
    }
    // TODO - add remember me functionality
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
        {error && <p className="LoginPage__error">{error}</p>}
        <div className="LoginPage__actions">
          <SubmitButton
            className="LoginPage__submit"
            isLoading={loading}
            disabled={isErroneous}
          >
            Se connecter
          </SubmitButton>
        </div>

        {formError && <p className="formError">{formError}</p>}
        {error && <p>{error}</p>}
      </form>
    </div>
  );
}
