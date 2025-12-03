import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import React from "react";
import Button from "../../../../atoms/Button/Button";
export default function Shop() {
  // Example local state for demonstration purposes
  const [currency, setCurrency] = React.useState(500);
  const [stats, setStats] = React.useState({
    hp: 100,
    attack: 10,
    regeneration: 5,
  });

  const upgradeCosts = {
    hp: 100,
    attack: 150,
    regeneration: 120,
  };

  const buyUpgrade = (
    type: "hp" | "attack" | "regeneration",
    amount: number
  ) => {
    const cost = upgradeCosts[type] * amount;
    if (currency < cost) {
      alert("Not enough currency to buy this upgrade.");
      return;
    }
    setCurrency(currency - cost);
    setStats((prevStats) => ({
      ...prevStats,
      [type]: prevStats[type] + amount,
    }));
    alert(`Bought upgrade: ${type} +${amount}`);
  };
  return (
    <div className="Shop">
      <h2>Shop Page</h2>
      <div>Currency: {currency}</div>
      <div>
        HP: {stats.hp} | Attack: {stats.attack} | Regeneration:{" "}
        {stats.regeneration}
      </div>
      <div className="Shop__item">
        <h3>PV +1%</h3>
        <Button variant="secondary" onClick={() => buyUpgrade("hp", 1)}>
          100 <SelfImprovementIcon color="primary" fontSize="small" />
        </Button>
      </div>
    </div>
  );
}
