import "./styles/app.scss";
import CardForm from "./components/pages/CardFormPage/CardFormPage";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import LoginPage from "./components/pages/LoginPage/LoginPage";
import RegisterPage from "./components/pages/RegisterPage/RegisterPage";
import GamePage from "./components/pages/GamePage/GamePage";
import ShopPage from "./components/pages/UpgradePage/UpgradePage";
import BossPage from "./components/pages/BossPage/BossPage";
import { SnackbarProvider } from "./context/SnackbarContext";
import { UserContextProvider } from "./context/UserContext";
import { ConfettiProvider } from "./context/ConfettiContext";
import Navbar from "./components/molecules/Navbar/Navbar";
import UserPage from "./components/pages/UserPage/UserPage";
import ShopAdminPage from "./components/pages/AdminPage/AdminPage";

const App = () => {
  return (
    <UserContextProvider>
      <ConfettiProvider>
        <SnackbarProvider>
          <Router>
            <Navbar />
            <div className="Page">
              <Routes>
                <Route path="/login" Component={LoginPage} />
                <Route path="/" Component={GamePage} />
                <Route path="/shop" Component={ShopPage} />
                <Route path="/user" Component={UserPage} />
                <Route path="/boss" Component={BossPage} />
                <Route path="/add-card" Component={CardForm} />
                <Route path="/register" Component={RegisterPage} />
                <Route path="/ashop" Component={ShopAdminPage} />
              </Routes>
            </div>
          </Router>
        </SnackbarProvider>
      </ConfettiProvider>
    </UserContextProvider>
  );
};

export default App;
