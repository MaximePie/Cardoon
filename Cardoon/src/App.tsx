import { QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Navbar from "./components/molecules/Navbar/Navbar";
import ShopAdminPage from "./components/pages/AdminPage/AdminPage";
import AdventurePage from "./components/pages/AdventurePage/AdventurePage";
import CardForm from "./components/pages/CardFormPage/CardFormPage";
import GamePage from "./components/pages/GamePage/GamePage";
import LoginPage from "./components/pages/LoginPage/LoginPage";
import RegisterPage from "./components/pages/RegisterPage/RegisterPage";
import ShopPage from "./components/pages/UpgradePage/UpgradePage";
import UserPage from "./components/pages/UserPage/UserPage";
import { ConfettiProvider } from "./context/ConfettiContext";
import { SnackbarContextProvider } from "./context/SnackbarContext";
import { UserContextProvider } from "./context/UserContext";
import { queryClient } from "./lib/queryClient";
import "./styles/app.scss";

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <UserContextProvider>
        <ConfettiProvider>
          <SnackbarContextProvider>
            <Router>
              <Navbar />
              <div className="Page">
                <Routes>
                  <Route path="/login" Component={LoginPage} />
                  <Route path="/" Component={GamePage} />
                  <Route path="/shop" Component={ShopPage} />
                  <Route path="/user" Component={UserPage} />
                  <Route path="/adventure" Component={AdventurePage} />
                  <Route path="/add-card" Component={CardForm} />
                  <Route path="/register" Component={RegisterPage} />
                  <Route path="/ashop" Component={ShopAdminPage} />
                </Routes>
              </div>
              {/* DevTools désactivés - Décommenter si nécessaire */}
              {/* {import.meta.env.DEV && (
                <ReactQueryDevtools initialIsOpen={false} />
              )} */}
            </Router>
          </SnackbarContextProvider>
        </ConfettiProvider>
      </UserContextProvider>
    </QueryClientProvider>
  );
};

export default App;
