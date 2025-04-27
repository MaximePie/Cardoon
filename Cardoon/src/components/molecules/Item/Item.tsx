import { useContext } from "react";
import { UserContext } from "../../../context/UserContext";
import { ACTIONS, usePost } from "../../../hooks/server";
import { Item, UserItem } from "../../../types/common";
import { SnackbarContext } from "../../../context/SnackbarContext";
import Button from "../../atoms/Button/Button";
import coinImage from "../../../images/coin.png";
interface ItemProps {
  item: UserItem | Item;
  type: "UserItem" | "Item";
}
export default ({ item, type }: ItemProps) => {
  const { post: postBuyItem } = usePost<UserItem>(ACTIONS.BUY_ITEM);
  const { user } = useContext(UserContext);
  const { post: postUpgradeItem } = usePost<UserItem>(ACTIONS.UPGRADE_ITEM);
  const { openSnackbarWithMessage } = useContext(SnackbarContext);
  const upgradeItem = async (itemId: string) => {
    await postUpgradeItem({ itemId });
  };

  const canUpgradeItem = (item: UserItem | Item) => {
    if (type === "Item") {
      return user.gold >= (item as Item).price;
    }
    console.log(
      "UserItem currentCost:",
      (item as UserItem).currentCost,
      "User gold:",
      user.gold
    );
    return user.gold >= (item as UserItem).currentCost;
  };
  const handleItemClick = async () => {
    if (type === "Item") {
      // Logic to handle item purchase
      await postBuyItem({ itemId: (item as Item)._id });
      openSnackbarWithMessage("Objet acheté !");
    } else {
      // Logic to handle item upgrade
      if (canUpgradeItem(item)) {
        await upgradeItem((item as UserItem).base._id);
        openSnackbarWithMessage("Objet amélioré !");
      } else {
        openSnackbarWithMessage("Pas assez d'or pour améliorer !");
      }
    }
  };

  if (type === "Item") {
    const formattedItem = item as Item;
    return (
      <div key={formattedItem._id} className="Item">
        <img
          src={formattedItem.image}
          alt={formattedItem.name}
          className="Item__image"
        />
        <h3>{formattedItem.name}</h3>
        <p>{formattedItem.description}</p>
        <Button
          onClick={handleItemClick}
          disabled={!canUpgradeItem(formattedItem)}
        >
          <span>{formattedItem.price}</span>
          <img src={coinImage} alt="coin" className="Item__coin" />
        </Button>
      </div>
    );
  } else {
    const formattedItem = item as UserItem;
    return (
      <div key={formattedItem.base._id} className="Item">
        <div className="Item__image-container">
          <img
            src={formattedItem.base.image}
            alt={formattedItem.base.name}
            className="Item__image"
          />
        </div>
        <h3>{formattedItem.base.name}</h3>
        <p>{formattedItem.base.description}</p>
        <Button
          onClick={handleItemClick}
          disabled={!canUpgradeItem(formattedItem)}
        >
          <span>{formattedItem.currentCost}</span>{" "}
          <img className="Item__coin" src={coinImage} alt="coin" />
        </Button>
      </div>
    );
  }
};
