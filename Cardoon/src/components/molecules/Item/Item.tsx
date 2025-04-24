import { useContext } from "react";
import { UserContext } from "../../../context/UserContext";
import { ACTIONS, usePost } from "../../../hooks/server";
import { Item } from "../../../types/common";

interface ItemProps {
  item: Item;
}
export default ({ item }: ItemProps) => {
  const { post } = usePost<Item>(ACTIONS.BUY_ITEM);
  const { user } = useContext(UserContext);
  const buyItem = async () => {
    // Logic to handle item purchase
    await post({ itemId: item._id });
  };

  const isItemInUserItems = user.items.some(
    (userItem) => userItem._id === item._id
  );
  const isItemAffordable = user.gold >= item.price;
  return (
    <div key={item._id} className="Item">
      <img src={item.image} alt={item.name} />
      <h3>{item.name}</h3>
      <p>{item.description}</p>
      <p>{item.price} pièces</p>
      <button
        onClick={buyItem}
        disabled={isItemInUserItems || !isItemAffordable}
      >
        {isItemInUserItems
          ? "Vous possédez déjà cet objet"
          : "Pas assez d'argent"}
      </button>
    </div>
  );
};
