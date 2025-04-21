import { useContext } from "react";
import { UserContext } from "../../../context/UserContext";
import glasses1 from "../../../images/glasses1.png";

export default () => {
  const { user } = useContext(UserContext);
  return (
    <div>
      <p>Vous avez {user.gold} pièces. Que voulez-vous acheter ?</p>
      <p>Voici les articles disponibles :</p>
      <div className="shop-items">
        <div className="Item">
          Lunettes de soleil
          <img
            src={glasses1}
            onClick={() => console.log("Lunettes de soleil achetées")}
            alt="Lunettes de soleil"
            className="Item__image"
          />
          <p></p>
          <p>Prix : 5000 pièces</p>
        </div>
      </div>
    </div>
  );
};
