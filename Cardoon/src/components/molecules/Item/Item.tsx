import { useContext } from "react";
import { UserContext } from "../../../context/UserContext";
import { ACTIONS, usePost } from "../../../hooks/server";
import { Item, UserItem } from "../../../types/common";
import { SnackbarContext } from "../../../context/SnackbarContext";

interface ItemProps {
  item: Item;
}
export default ({ item }: ItemProps) => {
  const { post } = usePost<UserItem>(ACTIONS.BUY_ITEM);
  const { user } = useContext(UserContext);
  const { openSnackbarWithMessage } = useContext(SnackbarContext);
  const buyItem = async () => {
    // Logic to handle item purchase
    await post({ itemId: item._id });
    openSnackbarWithMessage("Objet acheté !");
  };
  console.log("Item", item);

  const isItemInUserItems = user.items.some(
    (userItem) => userItem.base._id === item._id
  );
  const isItemAffordable = user.gold >= item.price;
  const getBuyButtonText = () => {
    if (isItemInUserItems) {
      return "Vous possédez déjà cet objet";
    }
    if (!isItemAffordable) {
      return "Pas assez d'argent";
    }
    return "Acheter";
  };
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
        {getBuyButtonText()}
      </button>
    </div>
  );
};
