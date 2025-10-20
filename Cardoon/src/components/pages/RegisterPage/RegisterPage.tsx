import { useContext, useEffect, useState } from "react";
import { SnackbarContext } from "../../../context/SnackbarContext";
import { useUser } from "../../../context/UserContext";
import { ACTIONS, usePost } from "../../../hooks/server";
import { User } from "../../../types/common";
import { extractErrorMessage } from "../../../utils";
import Input from "../../atoms/Input/Input";
import SubmitButton from "../../atoms/SubmitButton/SubmitButton";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<undefined | string>(undefined);
  const { setUser } = useUser();
  const { openSnackbarWithMessage } = useContext(SnackbarContext);

  const { post, data: user } = usePost<User>(ACTIONS.REGISTER);
  const isFormValid = email && password && username && email.includes("@");

  useEffect(() => {
    if (user) {
      setUser(user);
      openSnackbarWithMessage("Compte créé avec succès !");
    }
  }, [user, setUser, openSnackbarWithMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await post({ email, password, username });
    } catch (err) {
      setError(extractErrorMessage(err));
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
          isRequired
        />
        <Input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          label="Mot de passe"
          isRequired
        />
        <Input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          label="Nom d'utilisateur"
          isRequired
        />
        <SubmitButton disabled={!isFormValid || loading}>
          S&apos;inscrire
        </SubmitButton>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
}
