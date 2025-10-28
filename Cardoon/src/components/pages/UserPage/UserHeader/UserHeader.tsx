import { useUser } from "../../../../hooks/contexts/useUser";
import ExpBar from "../../../atoms/ExpBar/ExpBar";

export default function UserHeader() {
  const { user } = useUser();
  const { username } = user;

  return (
    <section className="UserPage__header">
      <div>
        <img
          className="UserPage__header-avatar"
          src="https://picsum.photos/200/300"
          alt={`Avatar de ${username}`}
        />
      </div>
      <div className="UserPage__header-info">
        <h3>{username}</h3>
        <p>Expérience</p>
        <ExpBar currentExp={1230} />
      </div>
    </section>
  );
}
