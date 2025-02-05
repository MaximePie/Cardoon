import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../App";
import { ACTIONS, usePost } from "../../hooks/server";
import { User } from "../../types/common";
import axios from "axios";
import { Link } from "react-router-dom";

interface LoginResponse {
  user: User;
  token: string;
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<undefined | string>(undefined);
  const { setUser } = useContext(UserContext);

  const { post, data } = usePost<LoginResponse>(ACTIONS.LOGIN);

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
      document.location.href = "/";
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await post({ email, password });
    } catch (err: any) {
      setError(err.message + " " + err.response.data.errorMessage);
    } finally {
      setLoading(false);
    }
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
      <button type="submit" disabled={loading}>
        Login
      </button>
      {error && <p>{error}</p>}
    </form>
  );
}
