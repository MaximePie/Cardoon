import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../context/UserContext";
import { useFetch, RESOURCES } from "../../../hooks/server";
import { Item as ItemType } from "../../../types/common";
import Item from "../../molecules/Item/Item";

export default () => {
  const { user } = useContext(UserContext);
  const { fetch, data } = useFetch<ItemType[]>(RESOURCES.ITEMS);
  const [items, setItems] = useState<ItemType[]>(data || []);
  useEffect(() => {
    fetch();
    document.title = "Page de la boutique";
  }, []);

  useEffect(() => {
    if (data) {
      setItems(data);
    }
  }, [data]);
  return (
    <div className="Page ShopPage">
      <p>Vous avez {user.gold} pièces. Que voulez-vous acheter ?</p>
      <p>Voici les articles disponibles :</p>
      {items.map((item) => (
        <Item key={item._id} item={item} /> // Assuming you have an Item component to display each item
      ))}
    </div>
  );
};
