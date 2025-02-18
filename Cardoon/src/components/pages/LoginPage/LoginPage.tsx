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
    post({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>
      <p>
        Pas encore de compte ?{" "}
        <Link to="/register">'faut le créer mon/a gâtée </Link>
      </p>
      <input
        // type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {JSON.stringify(error)}
      <button type="submit" disabled={loading || isErroneous}>
        Login
      </button>

      {formError && <p className="formError">{formError}</p>}
      {error && <p>{error}</p>}
    </form>
  );
}
