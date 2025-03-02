import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../App";
import { ACTIONS, usePost } from "../../../hooks/server";
import { User } from "../../../types/common";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

interface LoginResponse {
  user: User;
  token: string;
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(UserContext);
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

      navigate("/");
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      setFormError("Please fill in all fields");
      setLoading(false);
      return;
    }
    // TODO - add remember me functionality
    post({ email, password });
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
        <div className="LoginPage__form-group">
          <label htmlFor="email">Email</label>
          <input
            // type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="LoginPage__form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="LoginPage__form-options">
          <label className="LoginPage__remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            Remember Me
          </label>
          <a href="#" className="link">
            Forgot Password?
          </a>
        </div>
        {JSON.stringify(error)}
        <button
          type="submit"
          disabled={loading || isErroneous}
          className="LoginPage__submit"
        >
          {loading ? "Chargement" : "Se connecter"}
        </button>

        {formError && <p className="formError">{formError}</p>}
        {error && <p>{error}</p>}
      </form>
    </div>
  );
}
