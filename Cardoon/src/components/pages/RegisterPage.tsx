import { useContext, useEffect, useState } from "react";
import { ACTIONS, usePost } from "../../hooks/server";
import { User } from "../../types/common";
import { UserContext } from "../../context/UserContext";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<undefined | string>(undefined);
  const { setUser } = useContext(UserContext);

  const { post, data: user } = usePost<User>(ACTIONS.REGISTER);

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await post({ email, password, username });
    } catch (err: any) {
      setError(err.message + " " + err.response.data.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Créer un compte</h1>
      <input
        type="email"
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
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        Register
      </button>
      {error && <p>{error}</p>}
    </form>
  );
}
