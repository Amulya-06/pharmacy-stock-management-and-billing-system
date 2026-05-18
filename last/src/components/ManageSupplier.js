import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Popconfirm, Input, Space } from "antd";
import API from "../api";
import { 
  EditOutlined, 
  DeleteOutlined, 
  CheckOutlined, 
  CloseOutlined,
  SearchOutlined,
  SyncOutlined
} from "@ant-design/icons";
import "./ManageSupplier.css";

const ManageSupplier = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [editSupplierId, setEditSupplierId] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    supplierName: "",
    contactNumber: "",
    email: "",
    organisation: "",
  });
  const [searchFields, setSearchFields] = useState({
    supplierName: "",
    contactNumber: "",
    email: "",
    organisation: "",
  });
  const [loading, setLoading] = useState(false);

  // Fetch supplier data
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/api/suppliers`);
      setSuppliers(response.data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEdit = (supplier) => {
    setEditSupplierId(supplier._id);
    setUpdatedData({
      supplierName: supplier.supplier_name,
      contactNumber: supplier.contact_number,
      email: supplier.email || "",
      organisation: supplier.organisation || "",
    });
  };

  // Handle form input change for editing
  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData({ ...updatedData, [name]: value });
  };

  // Update supplier details
  const handleUpdate = async (supplierId) => {
    try {
      await axios.put(
        `${API}/api/suppliers/${supplierId}`,
        updatedData
      );
      setSuppliers(
        suppliers.map((supplier) =>
          supplier._id === supplierId
            ? {
                ...supplier,
                supplier_name: updatedData.supplierName,
                contact_number: updatedData.contactNumber,
                email: updatedData.email,
                organisation: updatedData.organisation,
              }
            : supplier
        )
      );
      setEditSupplierId(null);
    } catch (error) {
      console.error("Error updating supplier:", error);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditSupplierId(null);
    setUpdatedData({
      supplierName: "",
      contactNumber: "",
      email: "",
      organisation: "",
    });
  };

  // Delete supplier
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/suppliers/${id}`);
      setSuppliers(suppliers.filter((supplier) => supplier._id !== id));
    } catch (error) {
      console.error("Error deleting supplier:", error);
    }
  };

  // Handle search field changes
  const handleSearchChange = (e, field) => {
    const { value } = e.target;
    setSearchFields(prev => ({ ...prev, [field]: value }));
  };

  // Reset search fields
  const resetSearch = () => {
    setSearchFields({
      supplierName: "",
      contactNumber: "",
      email: "",
      organisation: "",
    });
  };

  // Filter suppliers based on search inputs
  const filteredSuppliers = suppliers.filter((supplier) =>
    Object.entries(searchFields).every(([key, value]) => {
      if (!value) return true;
      
      const fieldValue = key === 'supplierName' ? supplier.supplier_name :
                        key === 'contactNumber' ? supplier.contact_number :
                        key === 'organisation' ? supplier.organisation :
                        supplier.email;
      
      return fieldValue?.toString().toLowerCase().includes(value.toLowerCase());
    })
  );

  return (
    <div className="manage-supplier-container">
      <h2>Manage Suppliers</h2>

      {/* Search Bar */}
      <div className="search-bar">
        <Input
          placeholder="Search by Supplier Name"
          prefix={<SearchOutlined />}
          value={searchFields.supplierName}
          onChange={(e) => handleSearchChange(e, "supplierName")}
          className="search-input"
        />
        <Input
          placeholder="Search by Contact Number"
          prefix={<SearchOutlined />}
          value={searchFields.contactNumber}
          onChange={(e) => handleSearchChange(e, "contactNumber")}
          className="search-input"
        />
        <Input
          placeholder="Search by Email"
          prefix={<SearchOutlined />}
          value={searchFields.email}
          onChange={(e) => handleSearchChange(e, "email")}
          className="search-input"
        />
        <Input
          placeholder="Search by Organisation"
          prefix={<SearchOutlined />}
          value={searchFields.organisation}
          onChange={(e) => handleSearchChange(e, "organisation")}
          className="search-input"
        />
        <Button 
          icon={<SyncOutlined />} 
          onClick={resetSearch}
          className="reset-btn"
        >
          Reset
        </Button>
      </div>

      {/* Suppliers Table */}
      <div className="table-container">
        <table className="supplier-table">
          <thead>
            <tr>
              <th>SL</th>
              <th>Supplier Name</th>
              <th>Contact Number</th>
              <th>Email</th>
              <th>Organisation</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="loading-row">Loading suppliers...</td>
              </tr>
            ) : filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((supplier, index) => (
                <tr key={supplier._id}>
                  <td>{index + 1}</td>
                  <td>
                    {editSupplierId === supplier._id ? (
                      <Input
                        name="supplierName"
                        value={updatedData.supplierName}
                        onChange={handleUpdateChange}
                      />
                    ) : (
                      supplier.supplier_name
                    )}
                  </td>
                  <td>
                    {editSupplierId === supplier._id ? (
                      <Input
                        name="contactNumber"
                        value={updatedData.contactNumber}
                        onChange={handleUpdateChange}
                      />
                    ) : (
                      supplier.contact_number
                    )}
                  </td>
                  <td>
                    {editSupplierId === supplier._id ? (
                      <Input
                        name="email"
                        value={updatedData.email}
                        onChange={handleUpdateChange}
                      />
                    ) : (
                      supplier.email || "N/A"
                    )}
                  </td>
                  <td>
                    {editSupplierId === supplier._id ? (
                      <Input
                        name="organisation"
                        value={updatedData.organisation}
                        onChange={handleUpdateChange}
                      />
                    ) : (
                      supplier.organisation || "N/A"
                    )}
                  </td>
                  <td className="action-cell">
                    {editSupplierId === supplier._id ? (
                      <Space>
                        <Button 
                          type="primary" 
                          icon={<CheckOutlined />} 
                          onClick={() => handleUpdate(supplier._id)}
                        />
                        <Button 
                          danger 
                          icon={<CloseOutlined />} 
                          onClick={handleCancelEdit}
                        />
                      </Space>
                    ) : (
                      <Space>
                        <Button 
                          type="primary" 
                          icon={<EditOutlined />} 
                          onClick={() => handleEdit(supplier)}
                        />
                        <Popconfirm
                          title="Are you sure to delete this supplier?"
                          onConfirm={() => handleDelete(supplier._id)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <Button 
                            danger 
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>
                      </Space>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">No suppliers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageSupplier;