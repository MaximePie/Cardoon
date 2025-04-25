import { useEffect } from "react";
import { ACTIONS, useFetch } from "../../../hooks/server";
import { Item, User } from "../../../types/common";

export default () => {
  const { fetch, data } = useFetch<User>(ACTIONS.ME);

  useEffect(() => {
    fetch();
  }, []);

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
