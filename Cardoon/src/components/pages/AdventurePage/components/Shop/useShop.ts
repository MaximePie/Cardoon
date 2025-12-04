import { Hero } from "../../adventure.types";

export function useShop(_hero: Hero) {
  const buyUpgrade = () => {
    // Implementation for buying an upgrade
    console.log("Upgrade purchased!");
  };
  return { buyUpgrade };
}
