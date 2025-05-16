import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../context/UserContext";
import { useFetch, RESOURCES } from "../../../hooks/server";
import { Item as ItemType, UserItem } from "../../../types/common";
import Item from "../../molecules/Item/Item";
import { GameFooter } from "../GamePage/GamePage";

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

  const userItems: UserItem[] = user.items.map((item) => ({
    ...item,
    base: items.find((baseItem) => baseItem._id === item.base._id) || item.base,
  }));
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
