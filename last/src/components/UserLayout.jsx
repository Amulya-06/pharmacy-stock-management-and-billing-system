import React from "react";
import UserSidebar from "./userSidebar"; // Ensure correct import case
import { Outlet } from "react-router-dom";

const UserLayout = () => {
  return (
    <div className="userlayout">
      <UserSidebar /> {/* Corrected component usage */}
      <div className="content">
        <Outlet /> {/* Loads the nested user routes */}
      </div>
    </div>
  );
};

export default UserLayout;
