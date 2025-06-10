import { useContext, useEffect, useState } from "react";
import { ACTIONS, usePost } from "../../../hooks/server";
import { User } from "../../../types/common";
import { UserContext } from "../../../context/UserContext";
import { SnackbarContext } from "../../../context/SnackbarContext";
import SubmitButton from "../../atoms/SubmitButton/SubmitButton";
import Input from "../../atoms/Input/Input";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<undefined | string>(undefined);
  const { setUser } = useContext(UserContext);
  const { openSnackbarWithMessage } = useContext(SnackbarContext);

  const { post, data: user } = usePost<User>(ACTIONS.REGISTER);

  useEffect(() => {
    if (user) {
      setUser(user);
      openSnackbarWithMessage("Compte créé avec succès !");
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
    <div className="RegisterPage">
      <form onSubmit={handleSubmit} className="RegisterPage__form">
        <h1>Créer un compte</h1>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          label="Email"
        />
        <Input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          label="Mot de passe"
        />
        <Input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          label="Nom d'utilisateur"
        />
        <SubmitButton disabled={loading}>S'inscrire</SubmitButton>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
}
