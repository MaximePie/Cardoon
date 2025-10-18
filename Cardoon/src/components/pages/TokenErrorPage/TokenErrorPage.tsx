import { Button } from "@mui/material";
import { Link } from "react-router-dom";

export const TokenErrorPage = () => {
  return (
    <div className="TokenErrorPage">
      <div className="TokenErrorPage__card">
        <h2 className="TokenErrorPage__title">⚠️ Session expirée</h2>
        <p className="TokenErrorPage__message">
          Votre session a expiré. Veuillez vous reconnecter pour continuer à
          utiliser l&apos;application.
        </p>
        <Link to="/login" className="TokenErrorPage__link">
          <Button variant="contained">Reconnexion</Button>
        </Link>
      </div>
    </div>
  );
};
