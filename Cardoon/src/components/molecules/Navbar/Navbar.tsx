import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import NorthIcon from "@mui/icons-material/North";
import UserIcon from "@mui/icons-material/Person";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import { Link } from "react-router-dom";
import { useUser } from "../../../context/UserContext/useUserContext";
import useIsMobile from "../../../hooks/useIsMobile";
interface NavbarLink {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const Navbar = () => {
  const { user, logout } = useUser();
  const { isMobile } = useIsMobile();
  const links: NavbarLink[] = [
    { to: "/", label: "Entraînement", icon: <SportsEsportsIcon /> },
    { to: "/shop", label: "Amélioration", icon: <NorthIcon /> },
    { to: "/add-card", label: "Ajouter une carte", icon: <AddIcon /> },
    { to: "/user", label: "Mon compte", icon: <UserIcon /> },
    { to: "/adventure", label: "Aventure", icon: <SportsEsportsIcon /> },
  ];

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
              <Link key={link.label} to={link.to} className="Navbar__link">
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

export default Navbar;
