import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faFileInvoice,
  faUser,
  faPills,
  faTruck,
  faShoppingCart,
  faChartLine,
  faSearch,
  faPlus,
  faEdit,
  faSignOutAlt, // Logout icon
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import "./Sidebar.css";

const Sidebar = () => {
  const [openMenus, setOpenMenus] = useState({});
  const navigate = useNavigate(); // Hook for navigation

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => {
      const newMenus = { ...prev };
      Object.keys(newMenus).forEach((key) => {
        if (key !== menu) {
          newMenus[key] = false;
        }
      });
      newMenus[menu] = !newMenus[menu];
      return newMenus;
    });
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Clear authentication token if stored
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="sidebar modern-sidebar">
      <div className="profile">
        <img
          src="https://www.pngmart.com/files/23/Profile-PNG-Photo.png"
          alt="Profile"
          className="profile-img"
        />
        <h2>Admin</h2>
      </div>
      <ul>
        <li>
          <Link to="/">
            <FontAwesomeIcon icon={faHome} /> Dashboard
          </Link>
        </li>

        <li onClick={() => toggleMenu("invoice")} className="menu-item">
          <FontAwesomeIcon icon={faFileInvoice} /> Invoice
          <ul className={`submenu ${openMenus.invoice ? "open" : ""}`}>
            <li>
              <Link to="/Invoicepage">
                <FontAwesomeIcon icon={faPlus} /> Add
              </Link>
            </li>
            <li>
              <Link to="/ManageInvoice">
                <FontAwesomeIcon icon={faEdit} /> Modify
              </Link>
            </li>
          </ul>
        </li>

        <li onClick={() => toggleMenu("customer")} className="menu-item">
          <FontAwesomeIcon icon={faUser} /> Customer
          <ul className={`submenu ${openMenus.customer ? "open" : ""}`}>
            <li>
              <Link to="/AddCustomer">
                <FontAwesomeIcon icon={faPlus} /> Add
              </Link>
            </li>
            <li>
              <Link to="/ManageCustomer">
                <FontAwesomeIcon icon={faEdit} /> Modify
              </Link>
            </li>
          </ul>
        </li>

        <li>
          <Link to="/ManageMedicineStock">
            <FontAwesomeIcon icon={faSearch} /> Stock
          </Link>
        </li>

        <li onClick={() => toggleMenu("supplier")} className="menu-item">
          <FontAwesomeIcon icon={faTruck} /> Supplier
          <ul className={`submenu ${openMenus.supplier ? "open" : ""}`}>
            <li>
              <Link to="/AddSupplier">
                <FontAwesomeIcon icon={faPlus} /> Add
              </Link>
            </li>
            <li>
              <Link to="/ManageSupplier">
                <FontAwesomeIcon icon={faEdit} /> Modify
              </Link>
            </li>
          </ul>
        </li>

        <li onClick={() => toggleMenu("purchase")} className="menu-item">
          <FontAwesomeIcon icon={faShoppingCart} /> Purchase
          <ul className={`submenu ${openMenus.purchase ? "open" : ""}`}>
            <li>
              <Link to="/AddPurchase">
                <FontAwesomeIcon icon={faPlus} /> Add
              </Link>
            </li>
            <li>
              <Link to="/ManagePurchase">
                <FontAwesomeIcon icon={faEdit} /> Modify
              </Link>
            </li>
          </ul>
        </li>

        <li onClick={() => toggleMenu("Report")} className="menu-item">
          <FontAwesomeIcon icon={faChartLine} /> Report
          <ul className={`submenu ${openMenus.Report ? "open" : ""}`}>
            <li>
              <Link to="/SalesReport">
                <FontAwesomeIcon icon={faPlus} /> Sales
              </Link>
            </li>
            <li>
              <Link to="/PurchaseReport">
                <FontAwesomeIcon icon={faPlus} /> Purchase
              </Link>
            </li>
          </ul>
        </li>

        <li onClick={() => toggleMenu("Credentials")} className="menu-item">
          <FontAwesomeIcon icon={faChartLine} /> Credentials
          <ul className={`submenu ${openMenus.Credentials ? "open" : ""}`}>
            <li>
              <Link to="/AddCredentials">
                <FontAwesomeIcon icon={faPlus} /> Add
              </Link>
            </li>
            <li>
              <Link to="/ChangeOwnerCredentials">
                <FontAwesomeIcon icon={faEdit} /> Owner
              </Link>
            </li>
            <li>
              <Link to="/ChangeCredentials">
                <FontAwesomeIcon icon={faEdit} /> SalesMan
              </Link>
            </li>
          </ul>
        </li>

        {/* Logout Option */}
        <li onClick={handleLogout} className="menu-item">
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
