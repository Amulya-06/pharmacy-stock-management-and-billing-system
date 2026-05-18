import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  return (
    <div>
      <h2>Dashboard</h2>
      {role === "admin" && <button onClick={() => navigate("/manage-users")}>Manage Users</button>}
      <button onClick={() => {
        localStorage.clear();
        navigate("/login");
      }}>Logout</button>
    </div>
  );
};

export default Dashboard;
