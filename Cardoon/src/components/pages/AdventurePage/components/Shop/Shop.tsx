import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import Button from "../../../../atoms/Button/Button";
import { Hero } from "../../adventure.types";

export default function Shop({ hero }: { hero: Hero }) {
  return (
    <div className="Shop">
      <div className="Shop__item">
        <h3>PV +1%</h3>
        <Button disabled={(hero?.coins || 0) < 100} variant="secondary">
          100 <SelfImprovementIcon color="primary" fontSize="small" />
        </Button>
      </div>
      {hero.primaryUpgrades.map((upgrade) => (
        <div key={upgrade.id} className="Shop__item">
          <h3>{upgrade.id}</h3>
          <Button
            disabled={(hero?.coins || 0) < upgrade.nextLevelCost}
            variant="secondary"
          >
            {upgrade.nextLevelCost}{" "}
            <SelfImprovementIcon color="primary" fontSize="small" />
          </Button>
        </div>
      ))}
    </div>
  );
}
