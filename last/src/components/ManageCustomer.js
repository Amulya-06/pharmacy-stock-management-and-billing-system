import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Popconfirm } from "antd";
import API from "../api";
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined
} from "@ant-design/icons";
import "./ManageCustomer.css";

const ManageCustomer = () => {
  const [customers, setCustomers] = useState([]);
  const [editCustomerId, setEditCustomerId] = useState(null); // Track the customer being edited
  const [updatedData, setUpdatedData] = useState({
    customerName: "",
    customerContact: "",
    email: "",
    loyaltyPoints: 0,
    totalPurchases: 0,
  });

  const [searchCustomerName, setSearchCustomerName] = useState("");
  const [searchCustomerContact, setSearchCustomerContact] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  // Fetch customer data from the backend
  useEffect(() => {
    axios.get(`${API}/api/customers`)
      .then((response) => {
        const customersWithDefaults = response.data.map((customer) => ({
          ...customer,
          customerName: customer.customerName || "", // Default to empty string
          customerContact: customer.customerContact || "",
          email: customer.email || "",
          loyaltyPoints: customer.loyaltyPoints || 0,
          totalPurchases: customer.totalPurchases || 0,
        }));
        setCustomers(customersWithDefaults);
      })
      .catch((error) => {
        console.error("Error fetching customers:", error);
      });
  }, []);

  // Handle edit button click (set the customer to edit)
  const handleEdit = (customer) => {
    setEditCustomerId(customer._id);
    setUpdatedData({
      customerName: customer.customerName,
      customerContact: customer.customerContact,
      email: customer.email || "",
      loyaltyPoints: customer.loyaltyPoints || 0,
      totalPurchases: customer.totalPurchases || 0,
    });
  };

  // Handle update form input change
  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData({ ...updatedData, [name]: value });
  };

  // Update customer details
  // Update customer details (frontend)
  const handleUpdate = async (customerId) => {
    try {
      const response = await axios.put(
        `${API}/api/customers/${customerId}`,
        updatedData // Make sure updatedData contains the necessary fields
      );
      setCustomers(customers.map((customer) =>
        customer._id === customerId ? { ...customer, ...updatedData } : customer
      ));
      setEditCustomerId(null); // Reset edit state after saving
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  };


  // Cancel editing
  const handleCancelEdit = () => {
    setEditCustomerId(null); // Reset edit state
    setUpdatedData({
      customerName: "",
      customerContact: "",
      email: "",
      loyaltyPoints: 0,
      totalPurchases: 0,
    });
  };

  // Delete customer by ID
  // Delete customer (frontend)
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/customers/${id}`);
      setCustomers(customers.filter((customer) => customer._id !== id));
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };


  // Reset search fields
  const resetSearch = () => {
    setSearchCustomerName("");
    setSearchCustomerContact("");
    setSearchEmail("");
  };

  // Filter customers based on search inputs
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.customerName?.toLowerCase().includes(searchCustomerName.toLowerCase()) &&
      customer.customerContact?.includes(searchCustomerContact) &&
      customer.email?.toLowerCase().includes(searchEmail.toLowerCase())
  );

  return (
    <div className="manage-customer-container">
      <h2>Manage Customers</h2>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by Customer Name"
          value={searchCustomerName}
          onChange={(e) => setSearchCustomerName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by Contact Number"
          value={searchCustomerContact}
          onChange={(e) => setSearchCustomerContact(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by Email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
        />
        <button onClick={resetSearch}>Reset</button>
      </div>

      {/* Customers Table */}
      <table className="customer-table">
        <thead>
          <tr>
            <th>SL</th>
            <th>Customer Name</th>
            <th>Contact Number</th>
            <th>Email</th>
            <th>Loyalty Points</th>
            <th>Total Purchases</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.map((customer, index) => (
            <tr key={customer._id}>
              <td>{index + 1}</td>
              <td>
                {editCustomerId === customer._id ? (
                  <input
                    type="text"
                    name="customerName"
                    value={updatedData.customerName}
                    onChange={handleUpdateChange}
                    placeholder="Customer Name"
                  />
                ) : (
                  customer.customerName
                )}
              </td>
              <td>
                {editCustomerId === customer._id ? (
                  <input
                    type="text"
                    name="customerContact"
                    value={updatedData.customerContact}
                    onChange={handleUpdateChange}
                    placeholder="Contact Number"
                  />
                ) : (
                  customer.customerContact
                )}
              </td>
              <td>
                {editCustomerId === customer._id ? (
                  <input
                    type="email"
                    name="email"
                    value={updatedData.email}
                    onChange={handleUpdateChange}
                    placeholder="Email"
                  />
                ) : (
                  customer.email || "N/A"
                )}
              </td>
              <td>
                {editCustomerId === customer._id ? (
                  <input
                    type="number"
                    name="loyaltyPoints"
                    value={updatedData.loyaltyPoints}
                    onChange={handleUpdateChange}
                    placeholder="Points"
                    style={{ width: '80px' }}
                  />
                ) : (
                  customer.loyaltyPoints || 0
                )}
              </td>
              <td>
                {editCustomerId === customer._id ? (
                  <input
                    type="number"
                    name="totalPurchases"
                    value={updatedData.totalPurchases}
                    onChange={handleUpdateChange}
                    placeholder="Purchases"
                    style={{ width: '100px' }}
                  />
                ) : (
                  `₹${(customer.totalPurchases || 0).toFixed(2)}`
                )}
              </td>
              <td>
                {editCustomerId === customer._id ? (
                  <>
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      onClick={() => handleUpdate(customer._id)}
                      className="action-btn"
                    />
                    <Button
                      danger
                      icon={<CloseOutlined />}
                      onClick={handleCancelEdit}
                      className="action-btn"
                    />
                  </>
                ) : (
                  <>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(customer)}
                      className="action-btn"
                    />
                    <Popconfirm
                      title="Are you sure to delete this customer?"
                      onConfirm={() => handleDelete(customer._id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        className="action-btn"
                      />
                    </Popconfirm>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageCustomer;