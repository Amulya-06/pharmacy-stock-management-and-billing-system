import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import "./AdminLayout.css"; // Import the CSS file

const AdminLayout = () => {
  console.log("Sidebar rendering..."); // Move console.log() outside JSX

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-content">
        <Outlet /> {/* This will render child routes */}
      </div>
    </div>
  );
};

export default AdminLayout;
