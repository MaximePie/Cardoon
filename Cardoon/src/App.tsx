import "./styles/app.scss";
import CardForm from "./components/pages/CardFormPage/CardFormPage";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import LoginPage from "./components/pages/LoginPage/LoginPage";
import RegisterPage from "./components/pages/RegisterPage";
import GamePage from "./components/pages/GamePage/GamePage";
import { SnackbarProvider } from "./context/SnackbarContext";
import { UserContextProvider } from "./context/UserContext";
import Navbar from "./components/molecules/Navbar/Navbar";

const App = () => {
  return (
    <UserContextProvider>
      <SnackbarProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/login" Component={LoginPage} />
            <Route path="/" Component={GamePage} />
            <Route path="/add-card" Component={CardForm} />
            <Route path="/register" Component={RegisterPage} />
          </Routes>
        </Router>
      </SnackbarProvider>
    </UserContextProvider>
  );
};

export default App;
