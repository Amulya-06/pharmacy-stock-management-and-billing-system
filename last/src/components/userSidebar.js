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
  faSignOutAlt,
  faKey,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const UserSidebar = () => {
  const [activeMenu, setActiveMenu] = useState(null); // Track only one active menu
  const navigate = useNavigate();

  const toggleMenu = (menu) => {
    setActiveMenu(prev => prev === menu ? null : menu);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <div className="sidebar modern-sidebar">
      <div className="sidebar-content">
        <div className="profile">
          <img
            src="https://www.pngmart.com/files/23/Profile-PNG-Photo.png"
            alt="Profile"
            className="profile-img"
          />
          <h2>User</h2>
        </div>
        <ul className="menu-items">
          <li>
            <Link to="/user">
              <FontAwesomeIcon icon={faHome} /> Dashboard
            </Link>
          </li>

          {/* Invoice Section */}
          <li onClick={() => toggleMenu("invoice")} className="menu-item">
            <FontAwesomeIcon icon={faFileInvoice} /> Invoice
            <ul className={`submenu ${activeMenu === "invoice" ? "open" : ""}`}>
              <li>
                <Link to="/user/Invoicepage">
                  <FontAwesomeIcon icon={faPlus} /> Add
                </Link>
              </li>
              <li>
                <Link to="/user/ManageInvoice">
                  <FontAwesomeIcon icon={faEdit} /> Modify
                </Link>
              </li>
            </ul>
          </li>

          {/* Customer Section */}
          <li onClick={() => toggleMenu("customer")} className="menu-item">
            <FontAwesomeIcon icon={faUser} /> Customer
            <ul className={`submenu ${activeMenu === "customer" ? "open" : ""}`}>
              <li>
                <Link to="/user/AddCustomer">
                  <FontAwesomeIcon icon={faPlus} /> Add
                </Link>
              </li>
              <li>
                <Link to="/user/ManageCustomer">
                  <FontAwesomeIcon icon={faEdit} /> Modify
                </Link>
              </li>
            </ul>
          </li>

          {/* Product Section */}
          <li onClick={() => toggleMenu("medicine")} className="menu-item">
            <FontAwesomeIcon icon={faPills} /> Product
            <ul className={`submenu ${activeMenu === "medicine" ? "open" : ""}`}>
              <li>
                <Link to="/user/AddProduct">
                  <FontAwesomeIcon icon={faPlus} /> Add
                </Link>
              </li>
              <li>
                <Link to="/user/ManageMedicine">
                  <FontAwesomeIcon icon={faEdit} /> Modify
                </Link>
              </li>
            </ul>
          </li>

          <li>
            <Link to="/user/ManageMedicineStock">
              <FontAwesomeIcon icon={faSearch} /> Stock
            </Link>
          </li>

          {/* Supplier Section */}
          <li onClick={() => toggleMenu("supplier")} className="menu-item">
            <FontAwesomeIcon icon={faTruck} /> Supplier
            <ul className={`submenu ${activeMenu === "supplier" ? "open" : ""}`}>
              <li>
                <Link to="/user/AddSupplier">
                  <FontAwesomeIcon icon={faPlus} /> Add
                </Link>
              </li>
              <li>
                <Link to="/user/ManageSupplier">
                  <FontAwesomeIcon icon={faEdit} /> Modify
                </Link>
              </li>
            </ul>
          </li>

          {/* Purchase Section */}
          <li onClick={() => toggleMenu("purchase")} className="menu-item">
            <FontAwesomeIcon icon={faShoppingCart} /> Purchase
            <ul className={`submenu ${activeMenu === "purchase" ? "open" : ""}`}>
              <li>
                <Link to="/user/AddPurchase">
                  <FontAwesomeIcon icon={faPlus} /> Add
                </Link>
              </li>
              <li>
                <Link to="/user/ManagePurchase">
                  <FontAwesomeIcon icon={faEdit} /> Modify
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
    </div>
  );
};

export default UserSidebar;