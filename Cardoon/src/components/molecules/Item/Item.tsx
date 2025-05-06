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
  afterPurchase: () => void;
}

export default ({ item, type, afterPurchase }: ItemProps) => {
  const { post: postBuyItem } = usePost<UserItem>(ACTIONS.BUY_ITEM);
  const { user, removeGold } = useContext(UserContext);
  const { post: postUpgradeItem } = usePost<UserItem>(ACTIONS.UPGRADE_ITEM);
  const { openSnackbarWithMessage } = useContext(SnackbarContext);
  const upgradeItem = async (itemId: string) => {
    await postUpgradeItem({ itemId });
  };

  const canUpgradeItem = (item: UserItem | Item) => {
    if (type === "Item") {
      return user.gold >= (item as Item).price;
    }
    return user.gold >= (item as UserItem).currentCost;
  };
  const handleItemClick = async () => {
    if (type === "Item") {
      // Logic to handle item purchase
      await postBuyItem({ itemId: (item as Item)._id });
      openSnackbarWithMessage("Objet acheté !");
      removeGold((item as Item).price);
    } else {
      // Logic to handle item upgrade
      if (canUpgradeItem(item)) {
        await upgradeItem((item as UserItem).base._id);
        openSnackbarWithMessage("Objet amélioré !");
        removeGold((item as UserItem).currentCost);
      } else {
        openSnackbarWithMessage("Pas assez d'or pour améliorer !");
      }
    }
    afterPurchase();
  };

  if (type === "Item") {
    const { _id, name, description, price, image, effect } = item as Item;
    return (
      <div key={_id} className="Item">
        <img src={image} alt={name} className="Item__image" />
        <h3>{name}</h3>
        <p>
          {effect.type} +{effect.value}
        </p>
        <p>{description}</p>
        <Button
          onClick={handleItemClick}
          disabled={!canUpgradeItem(item as Item)}
        >
          <span>{price}</span>
          <img src={coinImage} alt="coin" className="Item__coin" />
        </Button>
      </div>
    );
  } else {
    const { base, currentCost, level } = item as UserItem;
    return (
      <div key={base._id} className="Item">
        <div className="Item__image-container">
          <img src={base.image} alt={base.name} className="Item__image" />
        </div>
        <h3>{base.name}</h3>
        <p>
          {base.type} +{base?.effect?.value} {base?.effect?.type}
        </p>
        <p>Level: {level}</p>
        <p>{base.description}</p>
        <Button
          onClick={handleItemClick}
          disabled={!canUpgradeItem(item as UserItem)}
        >
          <span>{currentCost}</span>{" "}
          <img className="Item__coin" src={coinImage} alt="coin" />
        </Button>
      </div>
    );
  }
};
