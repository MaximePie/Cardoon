import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import Button from "../../../../atoms/Button/Button";
import { Hero } from "../../adventure.types";
import { useShop } from "./useShop";

export default function Shop({ hero }: { hero: Hero }) {
  const { buyUpgrade } = useShop();
  return (
    <div className="Shop">
      {hero.primaryUpgrades.map((upgrade) => (
        <div key={upgrade.id} className="Shop__item">
          <h3>{upgrade.id}</h3>
          <Button
            disabled={(hero?.coins || 0) < upgrade.nextLevelCost}
            variant="secondary"
            onClick={buyUpgrade}
          >
            {upgrade.nextLevelCost}{" "}
            <SelfImprovementIcon color="primary" fontSize="small" />
          </Button>
        </div>
      ))}
    </div>
  );
}
