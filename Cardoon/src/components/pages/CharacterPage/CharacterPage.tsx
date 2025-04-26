import { useEffect } from "react";
import { ACTIONS, useFetch } from "../../../hooks/server";
import { User, UserItem } from "../../../types/common";
import Button from "../../atoms/Button/Button";

export default () => {
  const { fetch, data } = useFetch<User>(ACTIONS.ME);

  useEffect(() => {
    fetch();
  }, []);

  const upgradeItem = async (itemId: string) => {
    // Logic to handle item upgrade
    console.log("Upgrading item with ID:", itemId);
    // Call the API to upgrade the item
    // await post({ itemId });
  };

  const canUpgradeItem = (item: UserItem) => {
    console.log("Checking if item can be upgraded:", item);
    // Logic to determine if the item can be upgraded
    // For example, check if the user has enough gold or if the item is eligible for upgrade
    return true; // Placeholder logic, replace with actual condition
  };

  return (
    <div className="Page CharacterPage">
      <div className="Items">
        <h3>Objets</h3>
        {data?.items?.map((item: UserItem) => (
          <div key={item.base._id} className="Item">
            {item.base.name}
            <img src={item.base.image} alt={item.base.name} />
            <p>{item.base.description}</p>
            <Button
              disabled={!canUpgradeItem}
              onClick={() => upgradeItem(item.base._id)}
            >
              Améliorer ({item.base.price} pièces)
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
