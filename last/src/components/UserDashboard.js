import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API from "../api";
import { 
  Table, Button, Input, Card, Tag, Popconfirm, 
  message, Tabs, Statistic, Row, Col, Space 
} from 'antd';
import { 
  SearchOutlined, ExclamationCircleOutlined,
  WarningOutlined, StopOutlined, EditOutlined,
  DeleteOutlined, SyncOutlined, CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import './AdminDashboard.css';

const { TabPane } = Tabs;

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [stocks, setStocks] = useState([]);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [nearExpiryDays, setNearExpiryDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    productName: '',
    batchId: '',
    mrp: 0,
    packing: '',
    quantity: 0,
    expiryDate: '',
    supplierName: ''
  });
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await axios.get(`${API}/api/stocks`);
        setStocks(response.data.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stock data:', error);
        message.error('Failed to load stock data');
        setLoading(false);
      }
    };
    fetchStocks();
  }, []);

  const getLowStockItems = () => stocks.filter(item => item.quantity <= lowStockThreshold);
  const getExpiredItems = () => stocks.filter(item => new Date(item.expiryDate) <= new Date());
  
  const getNearExpiryItems = () => {
    const today = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(today.getDate() + nearExpiryDays);
    return stocks.filter(item => {
      const itemExpiry = new Date(item.expiryDate);
      return itemExpiry > today && itemExpiry <= expiryDate;
    });
  };

  const filteredItems = (items) => items.filter(item => 
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleEdit = (record) => {
    setEditingId(record._id);
    setEditFormData({
      productName: record.productName,
      batchId: record.batchId,
      mrp: record.mrp,
      packing: record.packing,
      quantity: record.quantity,
      expiryDate: record.expiryDate,
      supplierName: record.supplierName
    });
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
  };
  
  const handleSaveEdit = async (id) => {
    try {
      await axios.put(`${API}/api/stocks/${id}`, editFormData);
      const updatedStocks = stocks.map(item => 
        item._id === id ? { ...item, ...editFormData } : item
      );
      setStocks(updatedStocks);
      setEditingId(null);
      message.success('Item updated successfully');
    } catch (error) {
      console.error('Error updating item:', error);
      message.error('Failed to update item');
    }
  };
  
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/stocks/${id}`);
      setStocks(stocks.filter(item => item._id !== id));
      message.success('Item deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Failed to delete item');
    }
  };

  const columns = [
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
      render: (text, record) => {
        if (editingId === record._id) {
          return (
            <Input
              name="productName"
              value={editFormData.productName}
              onChange={handleEditFormChange}
            />
          );
        }
        return text;
      }
    },
    {
      title: 'Batch ID',
      dataIndex: 'batchId',
      key: 'batchId',
      render: (text, record) => {
        if (editingId === record._id) {
          return (
            <Input
              name="batchId"
              value={editFormData.batchId}
              onChange={handleEditFormChange}
            />
          );
        }
        return text;
      }
    },
    {
      title: 'MRP',
      dataIndex: 'mrp',
      key: 'mrp',
      render: (text, record) => {
        if (editingId === record._id) {
          return (
            <Input
              type="number"
              name="mrp"
              value={editFormData.mrp}
              onChange={handleEditFormChange}
            />
          );
        }
        return `₹${text.toFixed(2)}`;
      }
    },
    {
      title: 'Packing',
      dataIndex: 'packing',
      key: 'packing',
      render: (text, record) => {
        if (editingId === record._id) {
          return (
            <Input
              name="packing"
              value={editFormData.packing}
              onChange={handleEditFormChange}
            />
          );
        }
        return text;
      }
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => {
        if (editingId === record._id) {
          return (
            <Input
              type="number"
              name="quantity"
              value={editFormData.quantity}
              onChange={handleEditFormChange}
            />
          );
        }
        return (
          <Tag color={quantity <= lowStockThreshold ? 'red' : 'green'}>
            {quantity}
          </Tag>
        );
      }
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date, record) => {
        if (editingId === record._id) {
          return (
            <Input
              type="date"
              name="expiryDate"
              value={editFormData.expiryDate}
              onChange={handleEditFormChange}
            />
          );
        }
        const expiryDate = new Date(date);
        const today = new Date();
        const isExpired = expiryDate <= today;
        const isNearExpiry = !isExpired && 
          (expiryDate.getTime() - today.getTime()) <= (nearExpiryDays * 24 * 60 * 60 * 1000);
        
        return (
          <Tag 
            color={isExpired ? 'red' : isNearExpiry ? 'orange' : 'green'}
            icon={isExpired ? <StopOutlined /> : isNearExpiry ? <WarningOutlined /> : null}
          >
            {expiryDate.toLocaleDateString()}
          </Tag>
        );
      }
    },
    {
      title: 'Supplier',
      dataIndex: 'supplierName',
      key: 'supplierName',
      render: (text, record) => {
        if (editingId === record._id) {
          return (
            <Input
              name="supplierName"
              value={editFormData.supplierName}
              onChange={handleEditFormChange}
            />
          );
        }
        return text;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        if (editingId === record._id) {
          return (
            <Space size="middle">
              <Button 
                type="primary" 
                icon={<CheckOutlined />} 
                onClick={() => handleSaveEdit(record._id)}
              />
              <Button 
                danger 
                icon={<CloseOutlined />} 
                onClick={handleCancelEdit}
              />
            </Space>
          );
        }
        return (
          <Space size="middle">
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
            <Popconfirm
              title="Are you sure to delete this item?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        );
      }
    }
  ];
  if (loading) {
    return (
      <div className="loading-container">
        <SyncOutlined spin style={{ fontSize: 24 }} />
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1>Pharmacy Management Dashboard</h1>
        
        <div className="dashboard-controls">
          <Input
            placeholder="Search products..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          
          <div className="threshold-controls">
            <Input
              addonBefore="Low Stock Threshold"
              type="number"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(Number(e.target.value))}
              style={{ width: 220 }}
              min={1}
            />
            <Input
              addonBefore="Near Expiry Days"
              type="number"
              value={nearExpiryDays}
              onChange={(e) => setNearExpiryDays(Number(e.target.value))}
              style={{ width: 200 }}
              min={1}
            />
          </div>
        </div>
        
        <Row gutter={16} className="stats-cards">
          <Col span={6}>
            <Card onClick={() => setActiveTab('inventory')}>
              <Statistic title="Total Inventory" value={stocks.length} />
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              onClick={() => setActiveTab('lowStock')}
              className={activeTab === 'lowStock' ? 'active-card' : ''}
            >
              <Statistic 
                title="Low Stock" 
                value={getLowStockItems().length} 
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              onClick={() => setActiveTab('nearExpiry')}
              className={activeTab === 'nearExpiry' ? 'active-card' : ''}
            >
              <Statistic 
                title="Near Expiry" 
                value={getNearExpiryItems().length} 
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              onClick={() => setActiveTab('expired')}
              className={activeTab === 'expired' ? 'active-card' : ''}
            >
              <Statistic 
                title="Expired" 
                value={getExpiredItems().length} 
                prefix={<StopOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>
        
        <Tabs activeKey={activeTab} onChange={setActiveTab} className="dashboard-tabs">
          <TabPane tab="Full Inventory" key="inventory">
            <Table 
              columns={columns} 
              dataSource={filteredItems(stocks)} 
              rowKey="_id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab={`Low Stock (${getLowStockItems().length})`} key="lowStock">
            <Table 
              columns={columns} 
              dataSource={filteredItems(getLowStockItems())} 
              rowKey="_id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab={`Near Expiry (${getNearExpiryItems().length})`} key="nearExpiry">
            <Table 
              columns={columns} 
              dataSource={filteredItems(getNearExpiryItems())} 
              rowKey="_id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab={`Expired (${getExpiredItems().length})`} key="expired">
            <Table 
              columns={columns} 
              dataSource={filteredItems(getExpiredItems())} 
              rowKey="_id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;