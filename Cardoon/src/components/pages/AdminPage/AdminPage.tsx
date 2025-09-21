import { useContext, useState, useEffect } from "react";
import { UserContext } from "../../../context/UserContext";
import {
  useFetch,
  RESOURCES,
  usePost,
  useAdminCatchup,
} from "../../../hooks/server";
import { Item } from "../../../types/common";

const VALID_ITEM_TYPES = ["head", "weapon", "armor", "accessory"] as const;

const CaroleCards = () => {
  const { data, post } = useAdminCatchup();
  const cardsNotFromCarole =
    data?.allCardsFromCarole.filter(
      ({ user }) => user !== "684835fc6f4fff7090150f30"
    ) || [];
  console.log("All cards from Carole:", cardsNotFromCarole);

  const triggerCatchup = async () => {
    const confirm = window.confirm(
      "Êtes-vous sûr de vouloir lancer la procédure de rattrapage ?" +
        "\nCette action est irréversible."
    );
    if (!confirm) return;
    await post();
    alert("Procédure de rattrapage lancée.");
  };

  return (
    <div>
      <p>Max : "67a3c4c1e0440819311607dd"</p>
      <h2>
        Cartes Carole (684835fc6f4fff7090150f30) ({cardsNotFromCarole.length}{" "}
        trouvées)
      </h2>
      <button onClick={triggerCatchup}>NUKE</button>
      <p>
        {cardsNotFromCarole.map((userCard, index) => (
          <span key={index}>"{userCard._id}",</span>
        ))}
      </p>
    </div>
  );
};

export const ShopAdminPage = () => {
  const { user } = useContext(UserContext);
  const [newItem, setNewItem] = useState<Item>({
    _id: "",
    name: "Calculette Wish",
    description: "Plus de gold, mais... êtes-vous sûr qu'elle fonctionne ?",
    price: 500,
    image:
      "https://www.lissac.fr/media/catalog/product/0/3/03663234078213_ASH1907_NOIR_FACE_9131.png",
    type: "weapon",
    effect: {
      type: "gold",
      value: 5,
    },
  });
  const [itemImageFile, setItemImageFile] = useState<File | string | null>(
    null
  );
  const isDev = import.meta.env.MODE === "development";

  const { fetch, data } = useFetch<Item[]>(RESOURCES.ITEMS);
  const { post } = usePost<Item>(RESOURCES.ITEMS);
  const [items, setItems] = useState<Item[]>(data || []);
  useEffect(() => {
    fetch();
    document.title = "Page d'administration de la boutique";
  }, []);

  useEffect(() => {
    if (data) {
      setItems(data);
    }
  }, [data]);

  if (!user || user.role !== "admin" || !isDev) {
    return <p>Vous n'avez pas accès à cette page.</p>;
  }

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (itemImageFile) {
      formData.append("imageFile", itemImageFile);
    }
    formData.append("image", newItem.image);
    formData.append("name", newItem.name);
    formData.append("description", newItem.description);
    formData.append("price", newItem.price.toString());
    formData.append("type", newItem.type);
    formData.append("effectType", newItem.effect.type);
    formData.append("effectValue", newItem.effect.value.toString());

    await post(formData);
  };

  return (
    <div className="Admin">
      <h1>Page d'administration de la boutique</h1>
      <p>Cette page est réservée aux administrateurs.</p>
      <h2>Ajouter un nouvel objet</h2>
      <form onSubmit={saveItem}>
        <input
          type="text"
          placeholder="Nom de l'objet"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description de l'objet"
          value={newItem.description}
          onChange={(e) =>
            setNewItem({ ...newItem, description: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Prix de l'objet"
          value={newItem.price}
          onChange={(e) =>
            setNewItem({
              ...newItem,
              price: isNaN(parseInt(e.target.value))
                ? 0
                : parseInt(e.target.value),
            })
          }
        />
        <input
          type="text"
          placeholder="Image de l'objet (URL)"
          value={newItem.image}
          onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setItemImageFile(e.target.files[0]);
            }
          }}
        />
        <select
          value={newItem.type}
          onChange={(e) =>
            setNewItem({
              ...newItem,
              type: VALID_ITEM_TYPES.includes(e.target.value as any)
                ? (e.target.value as any)
                : "weapon",
            })
          }
        >
          <option value="head">Tête</option>
          <option value="weapon">Arme</option>
          <option value="armor">Armure</option>
          <option value="accessory">Accessoire</option>
        </select>
        <input
          type="number"
          placeholder="Valeur de l'effet"
          value={newItem.effect.value}
          onChange={(e) =>
            setNewItem({
              ...newItem,
              effect: {
                ...newItem.effect,
                value: isNaN(parseInt(e.target.value))
                  ? 0
                  : parseInt(e.target.value),
              },
            })
          }
        />
        <button type="submit">Ajouter</button>
      </form>
      <h2>Liste des objets</h2>
      <ul>
        {items.map((item) => (
          <li key={item._id}>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <p>Prix: {item.price} gold</p>
            <img src={item.image} alt={item.name} />
          </li>
        ))}
      </ul>

      <CaroleCards />
    </div>
  );
};

export default ShopAdminPage;
