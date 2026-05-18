import React, { useState, useEffect } from "react";
import { Table, Input, Pagination, Button, Popconfirm, Select, DatePicker, InputNumber } from "antd";
import axios from "axios";
import API from "../api";
import { 
  EditOutlined, 
  DeleteOutlined, 
  CheckOutlined, 
  CloseOutlined, 
  SearchOutlined 
} from "@ant-design/icons";
import "./ManageMedicine.css";

const ManageProduct = () => {
  const [products, setProducts] = useState([]);
  const [editProductId, setEditProductId] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    productName: "",
    genericName: "",
    category: "",
    purpose: "",
    gst: 0,
  });
  const [searchProductName, setSearchProductName] = useState("");
  const [searchGenericName, setSearchGenericName] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchPurpose, setSearchPurpose] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "" // 'success' or 'error'
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/api/products`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      showNotification("Failed to fetch products", "error");
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleEdit = (product) => {
    setEditProductId(product._id);
    setUpdatedData({
      productName: product.productName,
      genericName: product.genericName,
      category: product.category,
      purpose: product.purpose,
      gst: product.gst,
    });
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `${API}/api/products/${editProductId}`,
        updatedData
      );
      
      if (response.status === 200) {
        showNotification("Product updated successfully!", "success");
        setProducts(products.map(product => 
          product._id === editProductId ? { ...product, ...updatedData } : product
        ));
        setEditProductId(null);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      showNotification("Failed to update product", "error");
    }
  };

  const handleCancel = () => {
    setEditProductId(null);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/products/${id}`);
      setProducts(products.filter((product) => product._id !== id));
      showNotification("Product deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting product:", error);
      showNotification("Failed to delete product", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData({
      ...updatedData,
      [name]: value
    });
  };

  const resetSearch = () => {
    setSearchProductName("");
    setSearchGenericName("");
    setSearchCategory("");
    setSearchPurpose("");
  };

  const filteredProducts = products.filter(
    (product) =>
      product.productName?.toLowerCase().includes(searchProductName.toLowerCase()) &&
      product.genericName?.toLowerCase().includes(searchGenericName.toLowerCase()) &&
      product.category?.toLowerCase().includes(searchCategory.toLowerCase()) &&
      product.purpose?.toLowerCase().includes(searchPurpose.toLowerCase())
  );

  return (
    <div className="manage-product-container">
      <h2>Manage Products</h2>

      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by Product Name"
          value={searchProductName}
          onChange={(e) => setSearchProductName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by Generic Name"
          value={searchGenericName}
          onChange={(e) => setSearchGenericName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by Category"
          value={searchCategory}
          onChange={(e) => setSearchCategory(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by Purpose"
          value={searchPurpose}
          onChange={(e) => setSearchPurpose(e.target.value)}
        />
        <button onClick={resetSearch}>Reset</button>
      </div>

      <table className="product-table">
        <thead>
          <tr>
            <th>SL</th>
            <th>Product Name</th>
            <th>Generic Name</th>
            <th>Category</th>
            <th>Purpose</th>
            <th>GST (%)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product, index) => (
            <tr key={product._id}>
              <td>{index + 1}</td>
              
              {editProductId === product._id ? (
                <>
                  <td>
                    <input
                      type="text"
                      name="productName"
                      value={updatedData.productName}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="genericName"
                      value={updatedData.genericName}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="category"
                      value={updatedData.category}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="purpose"
                      value={updatedData.purpose}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="gst"
                      value={updatedData.gst}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                  <Button type="primary" icon={<CheckOutlined />} onClick={handleSave} />
                  <Button danger icon={<CloseOutlined />} onClick={handleCancel} />
                  </td>
                </>
              ) : (
                <>
                  <td>{product.productName}</td>
                  <td>{product.genericName}</td>
                  <td>{product.category}</td>
                  <td>{product.purpose}</td>
                  <td>{product.gst}</td>
                  <td>
                  <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(product)} />
                    <Popconfirm 
                      title="Are you sure to delete this invoice?" 
                      onConfirm={() => handleDelete(product._id)} 
                      okText="Yes" 
                      cancelText="No"
                    >
                      <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageProduct;
