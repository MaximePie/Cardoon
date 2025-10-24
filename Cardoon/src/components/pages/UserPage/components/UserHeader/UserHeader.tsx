import { useUser } from "../../../../hooks/useUser";

// 🎯 Constants pour éviter la duplication
const EXP_FOR_NEXT_LEVEL = 1000;

// 🧩 Composant ExpBar amélioré avec interface claire
interface ExpBarProps {
  currentExp: number;
  maxExp?: number;
}

const ExpBar = ({ currentExp, maxExp = EXP_FOR_NEXT_LEVEL }: ExpBarProps) => {
  const progressPercentage = Math.min((currentExp / maxExp) * 100, 100);

  return (
    <div className="ExpBar">
      <div
        className="ExpBar__fill"
        style={{ width: `${progressPercentage}%` }}
      />
    </div>
  );
};

/**
 * Composant en-tête utilisateur avec avatar et informations de base
 * Responsabilité : Affichage des informations de profil utilisateur
 */
export const UserHeader = () => {
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
};
