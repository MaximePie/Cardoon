/// <reference types="../../../vite-env" />
import { Tab, Tabs } from "@mui/material";
import Divider from "@mui/material/Divider/Divider";
import { useState } from "react";
import UserCards from "./UserCards/UserCards";
import UserHeader from "./UserHeader/UserHeader";
import UserProfile from "./UserProfile/UserProfile";

type UserPageTab = "profile" | "cards";

export const UserPage = () => {
  const [activeTab, setActiveTab] = useState<UserPageTab>("profile");
  const handleTabChange = (_: React.SyntheticEvent, newTab: UserPageTab) => {
    setActiveTab(newTab);
  };

  return (
    <div className="UserPage">
      <UserHeader />
      <Divider />
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tab label="Profil" value="profile" />
        <Tab label="Cartes" value="cards" />
      </Tabs>
      {activeTab === "profile" && <UserProfile />}
      {activeTab === "cards" && <UserCards />}
    </div>
  );
};

export default UserPage;
