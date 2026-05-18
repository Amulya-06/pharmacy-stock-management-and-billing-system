import React, { useState } from "react";
import axios from "axios";
import API from "../api";
import "./AddSupplier.css";

const AddSupplier = () => {
  const [supplierData, setSupplierData] = useState({
    supplier_name: "",
    contact_number: "",
    email: "",
    organisation: "",
  });
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "" // 'success' or 'error'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSupplierData({ ...supplierData, [name]: value });
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    if (!supplierData.supplier_name || 
        !supplierData.contact_number || 
        !supplierData.email || 
        !supplierData.organisation) {
      showNotification("Please fill in all the fields", "error");
      return;
    }

    // Validate contact number format
    if (!/^[0-9]{10,15}$/.test(supplierData.contact_number)) {
      showNotification("Please enter a valid contact number (10-15 digits)", "error");
      return;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supplierData.email)) {
      showNotification("Please enter a valid email address", "error");
      return;
    }

    try {
      const response = await axios.post(
        `${API}/api/suppliers`, 
        supplierData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        showNotification("Supplier added successfully!", "success");
        setSupplierData({
          supplier_name: "",
          contact_number: "",
          email: "",
          organisation: "",
        });
      } else if (response.status === 409) {
        showNotification("Supplier with this contact number already exists", "error");
      }
    } catch (error) {
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 409) {
          showNotification("Supplier with this contact number already exists", "error");
        } else {
          showNotification("Failed to add supplier. Please try again.", "error");
        }
      } else {
        // No response (network error)
        showNotification("Network error. Please check your connection.", "error");
      }
      console.error("Error adding supplier:", error);
    }
  };

  return (
    <div className="add-supplier-container">
      <h2>Add Supplier</h2>
      
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="supplier-form">
        <div className="form-group">
          <label htmlFor="supplier_name">Supplier Name *</label>
          <input
            type="text"
            id="supplier_name"
            name="supplier_name"
            placeholder="Supplier Name"
            value={supplierData.supplier_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="contact_number">Contact Number *</label>
          <input
            type="tel"
            id="contact_number"
            name="contact_number"
            placeholder="Contact Number (10-15 digits)"
            value={supplierData.contact_number}
            onChange={handleChange}
            pattern="[0-9]{10,15}"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={supplierData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="organisation">Organisation *</label>
          <input
            type="text"
            id="organisation"
            name="organisation"
            placeholder="Organisation"
            value={supplierData.organisation}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          Add Supplier
        </button>
      </form>
    </div>
  );
};

export default AddSupplier;