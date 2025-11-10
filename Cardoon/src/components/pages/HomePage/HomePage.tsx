import { Card, Divider } from "@mui/material";
import Button from "../../atoms/Button/Button";

export default function HomePage() {
  return (
    <div className="HomePage">
      <div className="HomePage__top-section">
        <h1>Les révisions vous attendent !</h1>
        <p>
          Apprenez rapidement et efficacement avec les flashcards de Cardoon.
        </p>
        <Button to="/register">S&apos;inscrire gratuitement</Button>
        <h2>Déjà un compte ?</h2>
        <Button to="/login" variant="secondary">
          Se connecter
        </Button>
      </div>
      <Divider />
      <div className="HomePage__cards">
        <Card className="HomePage__card">
          <h3>Créez vos propres cartes</h3>
          <p>
            Ajoutez des questions et des réponses pour personnaliser votre
            apprentissage.
          </p>
        </Card>
        <Card className="HomePage__card">
          <h3>Organisez vos révisions</h3>
          <p>
            Planifiez vos sessions de révision pour maximiser votre efficacité.
          </p>
        </Card>
        <Card className="HomePage__card">
          <h3>Suivez vos progrès</h3>
          <p>
            Visualisez vos performances et améliorez continuellement vos
            connaissances.
          </p>
        </Card>
        <Card className="HomePage__card">
          <h3>Partez à l&apos;aventure</h3>
          <p>
            Un mode jeu pour rendre l&apos;apprentissage plus amusant et
            engageant.
          </p>
        </Card>
        <Card className="HomePage__card">
          <h3>Apprenez n&apos;importe quoi avec l&apos;IA</h3>
          <p>
            Utilisez l&apos;intelligence artificielle pour générer des cartes
            sur n&apos;importe quel sujet.
          </p>
        </Card>
      </div>
    </div>
  );
}
