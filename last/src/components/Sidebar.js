import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey } from "@fortawesome/free-solid-svg-icons";
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
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const [openMenu, setOpenMenu] = useState(null); // Track only one open menu at a time
  const navigate = useNavigate();

  const toggleMenu = (menu) => {
    setOpenMenu(prev => prev === menu ? null : menu);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
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
          <Link to="/admin">
            <FontAwesomeIcon icon={faHome} /> Dashboard
          </Link>
        </li>

        {/* Invoice Section */}
        <li onClick={() => toggleMenu("invoice")} className="menu-item">
          <FontAwesomeIcon icon={faFileInvoice} /> Invoice
          <ul className={`submenu ${openMenu === "invoice" ? "open" : ""}`}>
            <li>
              <Link to="/admin/Invoicepage">
                <FontAwesomeIcon icon={faPlus} /> Add
              </Link>
            </li>
            <li>
              <Link to="/admin/ManageInvoice">
                <FontAwesomeIcon icon={faEdit} /> Modify
              </Link>
            </li>
          </ul>
        </li>

        {/* Customer Section */}
        <li onClick={() => toggleMenu("customer")} className="menu-item">
          <FontAwesomeIcon icon={faUser} /> Customer
          <ul className={`submenu ${openMenu === "customer" ? "open" : ""}`}>
            <li>
              <Link to="/admin/AddCustomer">
                <FontAwesomeIcon icon={faPlus} /> Add
              </Link>
            </li>
            <li>
              <Link to="/admin/ManageCustomer">
                <FontAwesomeIcon icon={faEdit} /> Modify
              </Link>
            </li>
          </ul>
        </li>

        {/* Product Section */}
        <li onClick={() => toggleMenu("medicine")} className="menu-item">
          <FontAwesomeIcon icon={faPills} /> Product
          <ul className={`submenu ${openMenu === "medicine" ? "open" : ""}`}>
            <li>
              <Link to="/admin/AddProduct">
                <FontAwesomeIcon icon={faPlus} /> Add
              </Link>
            </li>
            <li>
              <Link to="/admin/ManageMedicine">
                <FontAwesomeIcon icon={faEdit} /> Modify
              </Link>
            </li>
          </ul>
        </li>
        <li>
          <Link to="/admin/ManageMedicineStock">
            <FontAwesomeIcon icon={faSearch} /> Stock
          </Link>
        </li>

        {/* Supplier Section */}
        <li onClick={() => toggleMenu("supplier")} className="menu-item">
          <FontAwesomeIcon icon={faTruck} /> Supplier
          <ul className={`submenu ${openMenu === "supplier" ? "open" : ""}`}>
            <li>
              <Link to="/admin/AddSupplier">
                <FontAwesomeIcon icon={faPlus} /> Add
              </Link>
            </li>
            <li>
              <Link to="/admin/ManageSupplier">
                <FontAwesomeIcon icon={faEdit} /> Modify
              </Link>
            </li>
          </ul>
        </li>

        {/* Purchase Section */}
        <li onClick={() => toggleMenu("purchase")} className="menu-item">
          <FontAwesomeIcon icon={faShoppingCart} /> Purchase
          <ul className={`submenu ${openMenu === "purchase" ? "open" : ""}`}>
            <li>
              <Link to="/admin/AddPurchase">
                <FontAwesomeIcon icon={faPlus} /> Add
              </Link>
            </li>
            <li>
              <Link to="/admin/ManagePurchase">
                <FontAwesomeIcon icon={faEdit} /> Modify
              </Link>
            </li>
          </ul>
        </li>

        {/* Report Section */}
        <li onClick={() => toggleMenu("report")} className="menu-item">
          <FontAwesomeIcon icon={faChartLine} /> Report
          <ul className={`submenu ${openMenu === "report" ? "open" : ""}`}>
            <li>
              <Link to="/admin/SalesReport">
                <FontAwesomeIcon icon={faPlus} /> Sales
              </Link>
            </li>
            <li>
              <Link to="/admin/PurchaseReport">
                <FontAwesomeIcon icon={faPlus} /> Purchase
              </Link>
            </li>
          </ul>
        </li>

        {/* Credentials Section */}
        <li onClick={() => toggleMenu("credentials")} className="menu-item">
          <FontAwesomeIcon icon={faKey} /> Credentials
          <ul className={`submenu ${openMenu === "credentials" ? "open" : ""}`}>
            <li>
              <Link to="/admin/AddCredentials">
                <FontAwesomeIcon icon={faPlus} /> Add
              </Link>
            </li>
            <li>
              <Link to="/admin/ChangeOwnerCredentials">
                <FontAwesomeIcon icon={faEdit} /> Owner
              </Link>
            </li>
            <li>
              <Link to="/admin/ChangeCredentials">
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