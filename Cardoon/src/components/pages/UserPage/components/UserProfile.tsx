import coinImage from "../../../../images/coin.png";
import { User } from "../../../../types/common";
import { formattedNumber } from "../../../../utils/numbers";
import { ExpBar } from "./ExpBar";

interface UserProfileHeaderProps {
  user: User;
}

export const UserProfileHeader = ({ user }: UserProfileHeaderProps) => {
  const { username, score } = user;

  return (
    <div className="UserPage__header">
      <div>
        <img
          className="UserPage__header-avatar"
          src="https://picsum.photos/200/300"
          alt={`${username}'s avatar`}
        />
      </div>
      <div className="UserPage__header-infos">
        <h3>{username}</h3>
        <p>Exp</p>
        <ExpBar currentExp={score} />
      </div>
    </div>
  );
};

interface UserCurrencyDisplayProps {
  gold: number;
}

export const UserCurrencyDisplay = ({ gold }: UserCurrencyDisplayProps) => (
  <div className="UserPage__Currencies">
    <div className="UserPage__currency">
      <img src={coinImage} alt="Currency" />
      <div className="UserPage__currency-info">
        <span className="UserPage__currency-amount">
          {formattedNumber(gold || 0)}
        </span>
        <span className="UserPage__currency-label">Knowledge Coins</span>
      </div>
    </div>
  </div>
);
