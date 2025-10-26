import { useUser } from "../../../hooks/contexts/useUser";
import ExpBar from "./ExpBar";

export default function UserHeader() {
  const { user } = useUser();
  const { username, score } = user;

  return (
    <section className="UserPage__header">
      <div>
        <img
          className="UserPage__header-avatar"
          src="https://picsum.photos/200/300"
          alt={`Avatar de ${username}`}
        />
      </div>
      <div className="UserPage__header-infos">
        <h3>{username}</h3>
        <p>Expérience</p>
        <ExpBar currentExp={score} />
      </div>
    </section>
  );
}
