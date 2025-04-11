import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../context/UserContext";
import { Link } from "react-router-dom";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import PersonIcon from "@mui/icons-material/Person";
import NorthIcon from "@mui/icons-material/North";
import StarIcon from "@mui/icons-material/Star";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";
interface NavbarLink {
  to: string;
  label: string;
  icon: React.ReactNode;
}

export default () => {
  const { user, logout } = useContext(UserContext);
  const [isMobile, setIsMobile] = useState(false);
  const links: NavbarLink[] = [
    { to: "/", label: "Jeu", icon: <SportsEsportsIcon /> },
    { to: "/character", label: "Personnage", icon: <PersonIcon /> },
    { to: "/shop", label: "Magasin", icon: <NorthIcon /> },
    { to: "/boss", label: "Boss", icon: <StarIcon /> },
    { to: "/add-card", label: "Ajouter une carte", icon: <AddIcon /> },
  ];

  const handleResize = () => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <div className="Navbar">
      {!user._id && (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Créer un compte</Link>
        </>
      )}
      {user._id && (
        <>
          <div className="Navbar__links">
            {links.map((link: NavbarLink) => (
              <Link key={link.label} to={link.to}>
                {link.icon}
                {!isMobile && link.label}
              </Link>
            ))}
            <button onClick={logout} className="Navbar__logout">
              <LogoutIcon />
              {!isMobile && "Logout"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
