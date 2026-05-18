import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Popconfirm, Input, DatePicker, Select } from "antd";
import API from "../api";
import { 
  EditOutlined, 
  DeleteOutlined, 
  CheckOutlined, 
  CloseOutlined,
  SearchOutlined
} from "@ant-design/icons";
import dayjs from 'dayjs';
import "./ManagePurchase.css";

const { Option } = Select;

const ManagePurchase = () => {
  const [purchases, setPurchases] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [searchFields, setSearchFields] = useState({
    supplierName: "",
    invoiceNumber: "",
    purchaseDate: "",
    paymentStatus: "All",
  });

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await axios.get(`${API}/api/purchases`);
      const purchaseData = Array.isArray(response.data.data) ? response.data.data : [];
      setPurchases(purchaseData);
      setFilteredPurchases(purchaseData);
    } catch (error) {
      console.error("Error fetching purchases:", error.message);
    }
  };

  const handleSearchChange = (e, field) => {
    const { value } = e.target;
    setSearchFields(prevFields => ({ ...prevFields, [field]: value }));

    const filtered = purchases.filter(purchase => 
      Object.entries({ ...searchFields, [field]: value }).every(([key, val]) => 
        val === "" || val === "All" || purchase[key]?.toString().toLowerCase().includes(val.toLowerCase())
      )
    );

    setFilteredPurchases(filtered);
  };

  const handleInputChange = (e, field, id) => {
    const { value } = e.target;
    setFilteredPurchases(prevPurchases =>
      prevPurchases.map(purchase => (purchase._id === id ? { ...purchase, [field]: value } : purchase))
    );
  };

  const handleEdit = (id) => {
    setEditingRow(id);
  };

  const handleCancel = () => {
    setEditingRow(null);
    fetchPurchases(); // Reset any unsaved changes
  };

  const handleSave = async (id) => {
    setEditingRow(null);
    const updatedPurchase = filteredPurchases.find(purchase => purchase._id === id);

    try {
      const response = await axios.put(`${API}/api/purchases/${id}`, updatedPurchase);
      setPurchases(prev => prev.map(p => (p._id === id ? response.data.data : p)));
      setFilteredPurchases(prev => prev.map(p => (p._id === id ? response.data.data : p)));
    } catch (error) {
      console.error("Error updating purchase:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/purchases/${id}`);
      setPurchases(prev => prev.filter(p => p._id !== id));
      setFilteredPurchases(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      console.error("Error deleting purchase:", error);
    }
  };

  return (
    <div className="manage-purchase-container">
      <h2>Manage Purchase</h2>
      
      <div className="search-filters">
        <Input
          placeholder="Supplier Name"
          prefix={<SearchOutlined />}
          value={searchFields.supplierName}
          onChange={(e) => handleSearchChange(e, "supplierName")}
          className="search-input"
        />
        <Input
          placeholder="Invoice Number"
          prefix={<SearchOutlined />}
          value={searchFields.invoiceNumber}
          onChange={(e) => handleSearchChange(e, "invoiceNumber")}
          className="search-input"
        />
        <DatePicker
          placeholder="Purchase Date"
          value={searchFields.purchaseDate ? dayjs(searchFields.purchaseDate) : null}
          onChange={(date, dateString) => handleSearchChange({ target: { value: dateString }}, "purchaseDate")}
          className="search-input"
        />
        <Select
          value={searchFields.paymentStatus}
          onChange={(value) => handleSearchChange({ target: { value }}, "paymentStatus")}
          className="search-select"
        >
          <Option value="All">All Statuses</Option>
          <Option value="Cash Payment">Cash Payment</Option>
          <Option value="UPI">UPI</Option>
          <Option value="Net Banking">Net Banking</Option>
          <Option value="Cards">Cards</Option>
          <Option value="Payment Due">Payment Due</Option>
        </Select>
      </div>

      <div className="purchase-table-container">
        <table className="purchase-table">
          <thead>
            <tr>
              <th>SL.</th>
              <th>Supplier Name</th>
              <th>Invoice Number</th>
              <th>Purchase Date</th>
              <th>Total Amount</th>
              <th>GST</th>
              <th>Payment Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.length > 0 ? (
              filteredPurchases.map((purchase, index) => (
                <tr key={purchase._id}>
                  <td>{index + 1}</td>
                  <td>
                    {editingRow === purchase._id ? (
                      <Input
                        value={purchase.supplierName}
                        onChange={(e) => handleInputChange(e, "supplierName", purchase._id)}
                      />
                    ) : (
                      purchase.supplierName
                    )}
                  </td>
                  <td>{purchase.invoiceNumber}</td>
                  <td>{purchase.date ? new Date(purchase.date).toLocaleDateString('en-GB') : "N/A"}</td>
                  <td>₹{purchase.grandTotal?.toFixed(2) || "0.00"}</td>
                  <td>₹{purchase.products?.reduce((total, prod) => total + (prod.amount - (prod.rate * prod.quantity)), 0).toFixed(2)}</td>
                  <td>{purchase.paymentType || "N/A"}</td>
                  <td>
                    {editingRow === purchase._id ? (
                      <div className="action-buttons">
                        <Button
                          type="primary"
                          icon={<CheckOutlined />}
                          onClick={() => handleSave(purchase._id)}
                          className="action-btn"
                        />
                        <Button
                          danger
                          icon={<CloseOutlined />}
                          onClick={handleCancel}
                          className="action-btn"
                        />
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(purchase._id)}
                          className="action-btn"
                        />
                        <Popconfirm
                          title="Are you sure to delete this purchase?"
                          onConfirm={() => handleDelete(purchase._id)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            className="action-btn"
                          />
                        </Popconfirm>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">No purchases found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagePurchase;