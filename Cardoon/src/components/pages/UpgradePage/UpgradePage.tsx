import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../context/UserContext";
import { useFetch, RESOURCES } from "../../../hooks/server";
import { Item as ItemType, UserItem } from "../../../types/common";
import Item from "../../molecules/Item/Item";
import { GameFooter } from "../../Footer/Footer";

export default () => {
  const { user, hasItem, refresh } = useContext(UserContext);

  const { fetch, data } = useFetch<ItemType[]>(RESOURCES.ITEMS);
  const [items, setItems] = useState<ItemType[]>(data || []);

  useEffect(() => {
    fetch();
  }, []);

  useEffect(() => {
    if (data) {
      setItems(data);
    }
  }, [data]);

  console.log("User Items", user.items);
  const userItems: UserItem[] = user.items
    .map((userItem) => {
      const baseItem = items.find(
        (baseItem) => baseItem._id === userItem.base._id
      );
      if (!baseItem) return null;
      return {
        ...userItem,
        base: baseItem,
      };
    })
    .filter((item): item is UserItem => item !== null);
  console.log("User Items with base", userItems);
  const unownedItems: ItemType[] = items.filter((item) => !hasItem(item._id));
  return (
    <div className="Page ShopPage">
      <div className="ShopPage__items">
        {userItems.map((item: UserItem) => (
          <Item
            key={item.base._id}
            item={item}
            type={hasItem(item.base._id) ? "UserItem" : "Item"}
            afterPurchase={refresh}
          /> // Corrected to pass the current item instead of userItems
        ))}
        {unownedItems.map((item: ItemType) => (
          <Item
            key={item._id}
            item={item}
            type="Item" // Corrected to pass the current item instead of userItems
            afterPurchase={refresh}
          />
        ))}
        <GameFooter
          currentPage="shop"
          isFlashModeOn={false}
          setFlash={() => {}}
        />
      </div>
    </div>
  );
};
