import { useEffect } from "react";
import { ACTIONS, useFetch, usePost } from "../../../hooks/server";
import { Item, User } from "../../../types/common";

export default () => {
  const { fetch, data } = useFetch<User>(ACTIONS.ME);
  const { post } = usePost<Item>(ACTIONS.REMOVE_ITEM);

  useEffect(() => {
    fetch();
  }, []);

  const removeItem = (itemId: string) => {
    post({ itemId });
    fetch(); // Refresh the data after removing the item
  };
  return (
    <div className="Page CharacterPage">
      <div className="Items">
        <h3>Objets</h3>
        {data?.items?.map((item: Item) => (
          <div key={item._id}>
            {item.name}
            <img src={item.image} alt={item.name} />
            <p>{item.description}</p>
            <p>{item.price} pièces</p>
          </div>
        ))}
      </div>
    </div>
  );
};
