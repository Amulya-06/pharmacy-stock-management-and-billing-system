import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Modal from "react-modal";
import API from "../api";
import "./AddPurchase.css";
import debounce from "lodash.debounce";

Modal.setAppElement("#root");

const AddProductModal = ({ onClose, onAddProduct }) => {
  const [newProduct, setNewProduct] = useState({
    productName: "",
    genericName: "",
    category: "Creams",
    purpose: "", // Added purpose field
    gst: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: name === "gst" ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate all required fields including purpose
    const requiredFields = {
      productName: "Product name",
      genericName: "Generic name",
      purpose: "Purpose"
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([field]) => !newProduct[field]?.trim())
      .map(([_, name]) => name);

    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddProduct(newProduct);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to add product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>✖</button>
        <h2 className="h2">Add New Product</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="productName"
            placeholder="Product Name *"
            value={newProduct.productName}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="genericName"
            placeholder="Generic Name *"
            value={newProduct.genericName}
            onChange={handleInputChange}
            required
          />
          <select
            name="category"
            value={newProduct.category}
            onChange={handleInputChange}
          >
            <option value="Creams">Creams</option>
            <option value="Syrups">Syrups</option>
            <option value="Tablets">Tablets</option>
            <option value="Capsules">Capsules</option>
            <option value="Injections">Injections</option>
            <option value="Ointments">Ointments</option>
            <option value="Essentials">Essentials</option>
          </select>
          <input
            type="text"
            name="purpose"
            placeholder="Purpose *"
            value={newProduct.purpose}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="gst"
            placeholder="GST %"
            value={newProduct.gst}
            onChange={handleInputChange}
            min="0"
            step="0.1"
          />
          <button 
            type="submit" 
            className="add-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

const AddPurchase = ({ fetchStock }) => {
  const [supplierName, setSupplierName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [paymentType, setPaymentType] = useState("Cash Payment");
  const [products, setProducts] = useState([
    {
      productName: "",
      genericName: "",
      category: "Creams",
      gst: 0,
      batchId: "",
      packing: "",
      quantity: 0,
      rate: 0,
      mrp: 0,
      amount: 0,
      expiryDate: "",
    },
  ]);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });  const [grandTotal, setGrandTotal] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [isLoadingProductSuggestions, setIsLoadingProductSuggestions] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierContactNo, setNewSupplierContactNo] = useState("");
  const [newSupplierEmail, setNewSupplierEmail] = useState("");
  const [newSupplierOrganisation, setNewSupplierOrganisation] = useState("");
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...products];
    updatedProducts[index][field] = value;

    if (field === "quantity" || field === "rate" || field === "gst") {
      const baseAmount = updatedProducts[index].rate * updatedProducts[index].quantity;
      const gstAmount = baseAmount * (updatedProducts[index].gst / 100);
      updatedProducts[index].amount = baseAmount + gstAmount;
    }

    setProducts(updatedProducts);
    const total = updatedProducts.reduce((sum, product) => sum + product.amount, 0);
    setGrandTotal(total);
  };

  const handleAddProductRow = () => {
    setProducts([
      ...products,
      {
        productName: "",
        genericName: "",
        category: "Creams",
        batchId: "",
        packing: "",
        quantity: 0,
        rate: 0,
        mrp: 0,
        amount: 0,
        expiryDate: "",
      },
    ]);
  };

  const handleRemoveProductRow = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
    const total = updatedProducts.reduce((sum, product) => sum + product.amount, 0);
    setGrandTotal(total);
  };

  const fetchSupplierSuggestions = useCallback(
    debounce(async (query) => {
      if (!query) {
        setSuggestions([]);
        return;
      }

      try {
        setIsLoadingSuggestions(true);
        // Search by both name and contact number
        const response = await axios.get(
          `${API}/api/suppliers?search=${query}`
        );
        
        setSuggestions(response.data);
      } catch (error) {
        console.error("Error fetching supplier suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300),
    []
  );
  const fetchProductSuggestions = useCallback(
    debounce(async (query, index) => {
      if (!query) {
        setProductSuggestions([]);
        return;
      }
  
      try {
        setIsLoadingProductSuggestions(true);
        const response = await axios.get(`${API}/api/products?search=${query}`);
        
        const filteredProducts = response.data.filter(product => 
          product.productName && product.productName.toLowerCase().includes(query.toLowerCase())
        );
  
        setProductSuggestions(filteredProducts);
        setCurrentProductIndex(index);
      } catch (error) {
        console.error("Error fetching product suggestions:", error);
        setProductSuggestions([]);
      } finally {
        setIsLoadingProductSuggestions(false);
      }
    }, 300),
    []
  );

  const handleSuggestionClick = (supplier) => {
    setSupplierName(supplier.supplier_name);
    setShowSuggestions(false);
    
    // If we searched by contact number, auto-fill the name
    if (/^\d+$/.test(supplierName)) {
      setSupplierName(supplier.supplier_name);
    }
  };

  const handleProductSuggestionClick = (product, index) => {
    handleProductChange(index, "productName", product.productName);
    handleProductChange(index, "genericName", product.genericName);
    handleProductChange(index, "category", product.category);
    handleProductChange(index, "gst", product.gst);
    setShowProductSuggestions(false);
  };

  const handleSupplierChange = (e) => {
    const query = e.target.value;
    setSupplierName(query);

    // Check if input is a number (potential contact number)
    const isContactNumber = /^\d+$/.test(query);

    if (query.length >= (isContactNumber ? 3 : 1)) {
      setShowSuggestions(true);
      fetchSupplierSuggestions(query);
    } else {
      setSuggestions([]);
    }
  };
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  const shouldShowAddSupplier = () => {
    if (!supplierName) return false;
    
    // If it's a number (contact number) and no suggestions
    if (/^\d+$/.test(supplierName)) {
      return suggestions.length === 0 && !isLoadingSuggestions;
    }
    
    return false;
  };
  const handleProductNameChange = (e, index) => {
    const value = e.target.value;
    handleProductChange(index, "productName", value);
  
    if (value.length >= 1) {
      setShowProductSuggestions(true);
      fetchProductSuggestions(value, index);
    } else {
      setProductSuggestions([]);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setShowProductSuggestions(false);
    }, 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const purchaseData = {
      supplierName,
      invoiceNumber,
      paymentType,
      date,
      products,
      grandTotal,
    };

    try {
      const response = await axios.post(`${API}/api/purchases/add`, purchaseData);
      alert("Purchase added successfully!");

      if (fetchStock) {
        fetchStock();
      }
    } catch (error) {
      console.error("Error adding purchase:", error);
      alert("Failed to add purchase.");
    }
  };

  const handleAddNewProduct = async (newProduct) => {
    try {
      // Validate all required fields including purpose
      const requiredFields = {
        productName: 'Product name',
        genericName: 'Generic name',
        purpose: 'Purpose'
      };
  
      const missingFields = Object.entries(requiredFields)
        .filter(([field]) => !newProduct[field]?.trim())
        .map(([_, name]) => name);
  
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
  
      // Prepare payload with all required fields including purpose
      const payload = {
        productName: newProduct.productName.trim(),
        genericName: newProduct.genericName.trim(),
        category: newProduct.category || "Creams",
        purpose: newProduct.purpose.trim(), // Include purpose
        gst: Math.min(100, Math.max(0, Number(newProduct.gst || 0)))
      };
  
      const response = await axios.post(`${API}/api/products`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
  
      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to add product");
      }
  
      // Update local state (purpose isn't used in purchase form)
      const updatedProducts = [...products];
      updatedProducts[currentProductIndex] = {
        ...updatedProducts[currentProductIndex],
        productName: payload.productName,
        genericName: payload.genericName,
        category: payload.category,
        gst: payload.gst
      };
  
      setProducts(updatedProducts);
      setProductSuggestions(prev => [...prev, response.data.data]);
      
      return response.data;
  
    } catch (error) {
      console.error("Add product error:", {
        error: error.response?.data || error.message,
        attemptedData: newProduct
      });
      throw new Error(error.response?.data?.message || error.message);
    }
  };
  const handleOpenAddProductModal = (index) => {
    setCurrentProductIndex(index);
    setShowAddProductModal(true);
  };

  const handleAddSupplier = async () => {
    if (!newSupplierName || !newSupplierContactNo || !newSupplierEmail || !newSupplierOrganisation) {
      alert("Please fill in all fields.");
      return;
    }
    const shouldShowAddSupplier = () => {
      if (!supplierName) return false;
      
      // If it's a number (contact number) and no suggestions
      if (/^\d+$/.test(supplierName)) {
        return suggestions.length === 0 && !isLoadingSuggestions;
      }
      
      return false;
    };
    const supplierData = {
      supplier_name: newSupplierName,
      contact_number: newSupplierContactNo,
      email: newSupplierEmail,
      organisation: newSupplierOrganisation,
    };
    const handleDateChange = (e) => {
      const selectedDate = e.target.value;
      if (selectedDate) {
        setDate(selectedDate);
      }
    };
  

    try {
      const response = await axios.post(`${API}/api/suppliers`, supplierData);
      if (response.status === 201) {
        alert("Supplier added successfully!");
        setNewSupplierName("");
        setNewSupplierContactNo("");
        setNewSupplierEmail("");
        setNewSupplierOrganisation("");
        setSupplierName(newSupplierName);
        closeModal();
      }
    } catch (error) {
      console.error("Error adding supplier:", error);
      alert("Failed to add supplier. Please try again.");
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="add-purchase">
    <div className="header">
      <h2>Add Purchase</h2>
    </div>
    <form className="purchase-form" onSubmit={handleSubmit}>
      {/* Form Fields Row */}
      <div className="form-fields-row">
        {/* Supplier Field */}
        <div className="form-field-group">
          <label>Supplier:</label>
          <div className="supplier-input-wrapper">
            <input
              type="text"
              placeholder="Type contact number"
              value={supplierName}
              onChange={handleSupplierChange}
              onFocus={() => supplierName && setShowSuggestions(true)}
              onBlur={handleInputBlur}
            />
            {showSuggestions && (
              <div className="suggestions-container">
                {isLoadingSuggestions ? (
                  <div className="suggestion-item">Loading...</div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((supplier) => (
                    <div
                      key={supplier._id}
                      className="suggestion-item"
                      onMouseDown={() => handleSuggestionClick(supplier)}
                    >
                      {supplier.supplier_name} ({supplier.contact_number})
                    </div>
                  ))
                ) : (
                  <div className="suggestion-item no-suggestions">
                    {supplierName ? "No suppliers found" : "Type to search suppliers"}
                  </div>
                )}
              </div>
            )}
          </div>
          {shouldShowAddSupplier() && (
            <button 
              type="button" 
              className="add-supplier-btn" 
              onClick={openModal}
            >
              Add new Supplier for {supplierName}
            </button>
          )}
        </div>
  
        {/* Invoice Number */}
        <div className="form-field-group">
          <label>Invoice Number:</label>
          <input
            type="text"
            placeholder="Invoice Number"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
          />
        </div>
  
        {/* Payment Type */}
        <div className="form-field-group">
          <label>Payment Type:</label>
          <select 
            value={paymentType} 
            onChange={(e) => setPaymentType(e.target.value)}
          >
            <option value="Cash Payment">Cash Payment</option>
            <option value="UPI">UPI</option>
            <option value="Net Banking">Net Banking</option>
            <option value="Cards">Cards</option>
            <option value="Payment Due">Payment Due</option>
          </select>
        </div>
  
        {/* Date */}
        <div className="form-field-group">
          <label>Date:</label>
          <input 
            type="date" 
            value={date} 
            onChange={handleDateChange}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>
  
    

  


          
        <table className="product-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Generic Name</th>
              <th>Category</th>
              <th>GST %</th>
              <th>Packing</th>
              <th>Batch ID</th>
              <th>Ex. Date (mm/yy)</th>
              <th>Quantity</th>
              <th>MRP</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index}>
                <td>
                  <div className="product-input-wrapper">
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={product.productName}
                      onChange={(e) => handleProductNameChange(e, index)}
                      onFocus={() => {
                        setCurrentProductIndex(index);
                        if (product.productName) {
                          setShowProductSuggestions(true);
                          fetchProductSuggestions(product.productName, index);
                        }
                      }}
                      onBlur={handleInputBlur}
                    />
                    {showProductSuggestions && currentProductIndex === index && (
                      <div className="suggestions-container">
                        {isLoadingProductSuggestions ? (
                          <div className="suggestion-item">Loading...</div>
                        ) : productSuggestions.length > 0 ? (
                          productSuggestions.map((product) => (
                            <div
                              key={product._id}
                              className="suggestion-item"
                              onMouseDown={() => handleProductSuggestionClick(product, index)}
                            >
                              {product.productName} ({product.genericName})
                            </div>
                          ))
                        ) : (
                          <div className="suggestion-item no-suggestions">
                            No products found
                            <button
                              className="add-new-product-btn"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleOpenAddProductModal(index);
                              }}
                            >
                              + Add New Product
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Generic Name"
                    value={product.genericName}
                    onChange={(e) => handleProductChange(index, "genericName", e.target.value)}
                  />
                </td>
                <td>
                  <select
                    value={product.category}
                    onChange={(e) => handleProductChange(index, "category", e.target.value)}
                  >
                    <option value="Creams">Creams</option>
                    <option value="Syrups">Syrups</option>
                    <option value="Tablets">Tablets</option>
                    <option value="Capsules">Capsules</option>
                    <option value="Injections">Injections</option>
                    <option value="Ointments">Ointments</option>
                    <option value="Essentials">Essentials (Devices, Masks, Gloves)</option>
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    value={product.gst}
                    onChange={(e) => handleProductChange(index, "gst", e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={product.packing}
                    onChange={(e) => handleProductChange(index, "packing", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={product.batchId}
                    onChange={(e) => handleProductChange(index, "batchId", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={product.expiryDate}
                    onChange={(e) => handleProductChange(index, "expiryDate", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={product.quantity}
                    onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={product.mrp}
                    onChange={(e) => handleProductChange(index, "mrp", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={product.rate}
                    onChange={(e) => handleProductChange(index, "rate", e.target.value)}
                  />
                </td>
                <td>{product.amount.toFixed(2)}</td>
                <td>
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => handleRemoveProductRow(index)}
                  >
                    -
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" className="add-btn" onClick={handleAddProductRow}>
          + Add Product
        </button>
        <div className="total-row">
          <label>Grand Total:</label>
          <div className="grand-total-box">{grandTotal.toFixed(2)}</div>
        </div>
        <button type="submit" className="submit-btn">
          Add Purchase
        </button>
      </form>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Add Supplier Modal"
        className="custom-modal"
        overlayClassName="custom-overlay"
      >
        <h2>Add New Supplier</h2>
        <div>
          <label>Supplier Name:</label>
          <input
            type="text"
            value={newSupplierName}
            onChange={(e) => setNewSupplierName(e.target.value)}
          />
        </div>
        <div>
          <label>Contact No:</label>
          <input
            type="text"
            value={newSupplierContactNo}
            onChange={(e) => setNewSupplierContactNo(e.target.value)}
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={newSupplierEmail}
            onChange={(e) => setNewSupplierEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Organisation:</label>
          <input
            type="text"
            value={newSupplierOrganisation}
            onChange={(e) => setNewSupplierOrganisation(e.target.value)}
          />
        </div>
        <button onClick={handleAddSupplier}>Add Supplier</button>
        <button onClick={closeModal}>Close</button>
      </Modal>

      {showAddProductModal && (
        <AddProductModal 
          onClose={() => setShowAddProductModal(false)}
          onAddProduct={handleAddNewProduct}
        />
      )}
    </div>
  );
};

export default AddPurchase;