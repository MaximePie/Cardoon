import "./styles/app.scss";
import CardForm from "./components/pages/CardFormPage/CardFormPage";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import LoginPage from "./components/pages/LoginPage/LoginPage";
import RegisterPage from "./components/pages/RegisterPage";
import GamePage from "./components/pages/GamePage/GamePage";
import ShopPage from "./components/pages/UpgradePage/UpgradePage";
import BossPage from "./components/pages/BossPage/BossPage";
import { SnackbarProvider } from "./context/SnackbarContext";
import { UserContext, UserContextProvider } from "./context/UserContext";
import Navbar from "./components/molecules/Navbar/Navbar";
import { useContext, useEffect, useState } from "react";
import { RESOURCES, useFetch, usePost } from "./hooks/server";
import { Item } from "./types/common";

const ShopAdminPage = () => {
  const { user } = useContext(UserContext);
  const [newItem, setNewItem] = useState<Item>({
    _id: "",
    name: "Lunettes d'intello",
    description: "Pour vous faire gagner plus de gold",
    price: 100,
    image:
      "https://www.lissac.fr/media/catalog/product/0/3/03663234078213_ASH1907_NOIR_FACE_9131.png",
    type: "accessory",
    effect: {
      type: "gold",
      value: 1,
    },
  });
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

  if (!user || user.role !== "admin") {
    return <p>Vous n'avez pas accès à cette page.</p>;
  }

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await post(newItem);

    setNewItem({
      _id: "",
      name: "",
      description: "",
      price: 0,
      image: "",
      type: "accessory",
      effect: {
        type: "gold",
        value: 1,
      },
    });
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
            setNewItem({ ...newItem, price: parseInt(e.target.value) })
          }
        />
        <input
          type="text"
          placeholder="Image de l'objet (URL)"
          value={newItem.image}
          onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
        />
        <select
          value={newItem.type}
          onChange={(e) =>
            setNewItem({ ...newItem, type: e.target.value as Item["type"] })
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
              effect: { ...newItem.effect, value: parseInt(e.target.value) },
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
    </div>
  );
};

const App = () => {
  return (
    <UserContextProvider>
      <SnackbarProvider>
        <Router>
          <Navbar />
          <div className="Page">
            <Routes>
              <Route path="/login" Component={LoginPage} />
              <Route path="/" Component={GamePage} />
              <Route path="/shop" Component={ShopPage} />
              <Route path="/boss" Component={BossPage} />
              <Route path="/add-card" Component={CardForm} />
              <Route path="/register" Component={RegisterPage} />
              <Route path="/ashop" Component={ShopAdminPage} />
            </Routes>
          </div>
        </Router>
      </SnackbarProvider>
    </UserContextProvider>
  );
};

export default App;
