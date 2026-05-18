import React, { useState } from "react";
import axios from "axios";
import API from "../api";
import "./AddProduct.css";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    productName: "",
    genericName: "",
    category: "",
    purpose: "",
    gst: 0 // Added GST field
  });

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!/^[A-Za-z0-9\s\-]+$/.test(formData.productName)) {
      newErrors.productName =
        "Product Name can only contain letters, numbers, spaces, and dashes!";
      isValid = false;
    }

    if (!formData.genericName.trim()) {
      newErrors.genericName = "Generic Name cannot be empty!";
      isValid = false;
    }

    if (!formData.category) {
      newErrors.category = "Please select a category!";
      isValid = false;
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = "Purpose cannot be empty!";
      isValid = false;
    }

    if (formData.gst < 0 || formData.gst > 100 || isNaN(formData.gst)) {
      newErrors.gst = "GST must be between 0 and 100!";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        const response = await axios.post(`${API}/api/products`, formData);

        setMessage(response.data.message);
        setFormData({
          productName: "",
          genericName: "",
          category: "",
          purpose: "",
          gst: 0
        });
        setTimeout(() => setMessage(""), 5000);
      } catch (error) {
        console.error("Error adding product:", error.response?.data || error);
        setMessage("Failed to add product!");
      }
    }
  };

  return (
    <div className="bg-container">
      <div className="add-product-container">
        <h2>Add Product</h2>
        {message && <p className="success-message">{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name:</label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
              placeholder="Enter product name"
            />
            {errors.productName && (
              <span className="error-text">{errors.productName}</span>
            )}
          </div>
          <div className="form-group">
            <label>Generic Name:</label>
            <input
              type="text"
              name="genericName"
              value={formData.genericName}
              onChange={handleInputChange}
              placeholder="Enter generic name"
            />
            {errors.genericName && (
              <span className="error-text">{errors.genericName}</span>
            )}
          </div>
          <div className="form-group">
            <label>Category:</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value="">Select Category</option>
              <option value="Creams">Creams</option>
              <option value="Syrups">Syrups</option>
              <option value="Medical Kits">Medical Kits</option>
              <option value="Tablets">Tablets</option>
              <option value="Capsules">Capsules</option>
              <option value="Injections">Injections</option>
              <option value="Ointments">Ointments</option>
              <option value="Essentials">
                Essentials (like medical devices, masks, gloves, etc.)
              </option>
            </select>
            {errors.category && (
              <span className="error-text">{errors.category}</span>
            )}
          </div>
          <div className="form-group">
            <label>Purpose:</label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              placeholder="Enter purpose"
              rows="2"
            />
            {errors.purpose && (
              <span className="error-text">{errors.purpose}</span>
            )}
          </div>
          <div className="form-group">
            <label>GST (%):</label>
            <input
              type="number"
              name="gst"
              value={formData.gst}
              onChange={handleInputChange}
              placeholder="Enter GST percentage"
              min="0"
              max="100"
              step="0.01"
            />
            {errors.gst && (
              <span className="error-text">{errors.gst}</span>
            )}
          </div>
          <button type="submit" className="add-button">
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;