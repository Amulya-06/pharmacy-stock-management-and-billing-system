import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import API from '../api';
import { 
  Button, Popconfirm, Input, DatePicker, InputNumber, 
  Table, Card, Tag, Tabs, Statistic, Row, Col, Space, message, 
  Typography, Divider
} from "antd";
import { 
  EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined,
  SearchOutlined, ExclamationCircleOutlined, WarningOutlined, 
  StopOutlined, SyncOutlined, FrownOutlined, 
  DollarOutlined, ShoppingCartOutlined, StockOutlined, LineChartOutlined
} from "@ant-design/icons";
import dayjs from 'dayjs';
import "./ManageMedicineStock.css";

const { Title, Text } = Typography;

const ManageProductStock = () => {
  // State management
  const [activeTab, setActiveTab] = useState('inventory');
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [stockProducts, setStockProducts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchGenericName, setSearchGenericName] = useState("");
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [supplierFilter, setSupplierFilter] = useState([]);
  
  // Configuration states
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [nearExpiryDays, setNearExpiryDays] = useState(30);
  
  // Editing and modal states
  const [editId, setEditId] = useState(null);
  const [editedProduct, setEditedProduct] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Calculate financial metrics
  const financialMetrics = useMemo(() => {
    const totalPurchases = purchases.reduce((sum, purchase) => sum + (purchase.grandTotal || 0), 0);
    const totalSales = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    const totalStockValue = stockProducts.reduce((sum, product) => sum + ((product.rate || 0) * (product.quantity || 0)), 0);
    const profitLoss = totalSales - totalPurchases;
    
    return {
      totalPurchases,
      totalSales,
      totalStockValue,
      profitLoss
    };
  }, [purchases, sales, stockProducts]);

  // Fetch all required data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [stocksRes, purchasesRes, salesRes, productsRes] = await Promise.all([
        axios.get(`${API}/api/stocks`),
        axios.get(`${API}/api/purchases`),
        axios.get(`${API}/api/sales`),
        axios.get(`${API}/api/products`)
      ]);
      
      // Process data with defensive checks to handle potentially malformed responses
      const stockData = stocksRes.data?.data || stocksRes.data || [];
      setStockProducts(stockData);
      
      // Process financial data with defensive checks
      setPurchases(purchasesRes.data?.data || purchasesRes.data || []);
      setSales(salesRes.data?.data || salesRes.data || []);
      
      // Process product data with defensive checks
      const productData = productsRes.data?.data || productsRes.data || [];
      setAllProducts(productData);
      
      // Extract unique categories and suppliers for filters
      const categories = [...new Set(productData.map(p => p.category).filter(Boolean))];
      const suppliers = [...new Set(stockData.map(s => s.supplierName).filter(Boolean))];
      setCategoryFilter(categories);
      setSupplierFilter(suppliers);
      
      // More robust out of stock detection (from second code)
      // Create a set of lowercase product names that are in stock (with defensive checks)
      const stockedProductNames = new Set(
        stockData
          .filter(stock => stock.productName && typeof stock.productName === 'string')
          .map(stock => stock.productName.toLowerCase().trim())
      );
      
      // Find products that are not in stock (with defensive checks)
      const missingProducts = productData
        .filter(product => {
          // Ensure product name exists and is a string
          if (!product.productName || typeof product.productName !== 'string') {
            console.warn('Invalid product entry (missing or invalid productName):', product);
            return false;
          }
          const productName = product.productName.toLowerCase().trim();
          return !stockedProductNames.has(productName);
        })
        .map(product => ({
          ...product,
          quantity: 0,
          batchId: "N/A",
          expiryDate: "",
          supplierName: "Not stocked",
          packing: "N/A",
          isOutOfStock: true
        }));
      
      setOutOfStockProducts(missingProducts);
      
      // Log debug info for easy verification
      console.log('Stock Data:', stockData);
      console.log('Product Data:', productData);
      console.log('Out of Stock Products:', missingProducts);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data");
      message.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter functions for different stock statuses
  const getLowStockItems = useCallback(() => 
    stockProducts.filter(item => item.quantity <= lowStockThreshold && item.quantity > 0), 
    [stockProducts, lowStockThreshold]
  );

  const getExpiredItems = useCallback(() => 
    stockProducts.filter(item => item.expiryDate && new Date(item.expiryDate) <= new Date()), 
    [stockProducts]
  );
  
  const getNearExpiryItems = useCallback(() => {
    const today = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(today.getDate() + nearExpiryDays);
    return stockProducts.filter(item => {
      if (!item.expiryDate) return false;
      const itemExpiry = new Date(item.expiryDate);
      return itemExpiry > today && itemExpiry <= expiryDate;
    });
  }, [stockProducts, nearExpiryDays]);

  // Product filtering logic
  const filteredProducts = useMemo(() => {
    const filterFunction = (product) => {
      const matchesSearchTerm = searchTerm 
        ? (product.productName || "").toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      
      const matchesGenericName = searchGenericName
        ? (product.genericName || "").toLowerCase().includes(searchGenericName.toLowerCase())
        : true;
      
      return matchesSearchTerm && matchesGenericName;
    };

    switch (activeTab) {
      case 'inventory':
        return stockProducts.filter(filterFunction);
      case 'outOfStock':
        return outOfStockProducts.filter(filterFunction);
      case 'lowStock':
        return getLowStockItems().filter(filterFunction);
      case 'nearExpiry':
        return getNearExpiryItems().filter(filterFunction);
      case 'expired':
        return getExpiredItems().filter(filterFunction);
      default:
        return stockProducts.filter(filterFunction);
    }
  }, [
    stockProducts, 
    outOfStockProducts, 
    activeTab, 
    searchTerm, 
    searchGenericName,
    getLowStockItems,
    getNearExpiryItems,
    getExpiredItems
  ]);

  // CRUD Operations
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/stocks/${id}`);
      setStockProducts(prev => prev.filter(product => product._id !== id));
      message.success('Item deleted successfully');
    } catch (error) {
      console.error("Error deleting product:", error);
      message.error('Failed to delete item');
    }
  };

  const handleEdit = (product) => {
    setEditId(product._id);
    setEditedProduct({ ...product });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditedProduct({});
  };

  const handleSave = async () => {
    if (!editedProduct.genericName || !editedProduct.category) {
      message.error("Please fill in all required fields.");
      return;
    }
    try {
      await axios.put(`${API}/api/stocks/${editId}`, editedProduct);
      setStockProducts(prev => prev.map(prod => 
        prod._id === editId ? editedProduct : prod
      ));
      setEditId(null);
      setEditedProduct({});
      message.success('Item updated successfully');
    } catch (error) {
      console.error("Error updating product:", error);
      message.error('Failed to update item');
    }
  };

  // Event handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (name, value) => {
    setEditedProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date, dateString) => {
    setEditedProduct(prev => ({ ...prev, expiryDate: dateString }));
  };

  // Table column definitions
  const outOfStockColumns = [
    {
      title: 'SL',
      dataIndex: 'index',
      key: 'index',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
      sorter: (a, b) => a.productName.localeCompare(b.productName)
    },
    {
      title: 'Generic Name',
      dataIndex: 'genericName',
      key: 'genericName',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    }
  ];

  const columns = [
    {
      title: 'SL',
      dataIndex: 'index',
      key: 'index',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
      render: (text, record) => editId === record._id ? (
        <Input
          name="productName"
          value={editedProduct.productName}
          onChange={handleChange}
        />
      ) : text || 'N/A',
      sorter: (a, b) => (a.productName || '').localeCompare(b.productName || '')
    },
    {
      title: 'Generic Name',
      dataIndex: 'genericName',
      key: 'genericName',
      render: (text, record) => editId === record._id ? (
        <Input
          name="genericName"
          value={editedProduct.genericName}
          onChange={handleChange}
        />
      ) : text || 'N/A',
      sorter: (a, b) => (a.genericName || '').localeCompare(b.genericName || '')
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text, record) => editId === record._id ? (
        <Input
          name="category"
          value={editedProduct.category}
          onChange={handleChange}
        />
      ) : text || 'N/A',
      sorter: (a, b) => (a.category || '').localeCompare(b.category || '')
    },
    {
      title: 'Batch ID',
      dataIndex: 'batchId',
      key: 'batchId',
      render: (text, record) => editId === record._id ? (
        <Input
          name="batchId"
          value={editedProduct.batchId}
          onChange={handleChange}
        />
      ) : text || 'N/A'
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date, record) => {
        if (editId === record._id) {
          return (
            <DatePicker 
              value={editedProduct.expiryDate ? dayjs(editedProduct.expiryDate) : null}
              onChange={handleDateChange}
              style={{ width: '100%' }}
            />
          );
        }
        if (!date) return 'N/A';
        
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
      render: (text, record) => editId === record._id ? (
        <Input
          name="supplierName"
          value={editedProduct.supplierName}
          onChange={handleChange}
        />
      ) : text || 'N/A',
      sorter: (a, b) => (a.supplierName || '').localeCompare(b.supplierName || '')
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => editId === record._id ? (
        <InputNumber 
          min={0}
          value={editedProduct.quantity}
          onChange={(value) => handleNumberChange('quantity', value)}
          style={{ width: '100%' }}
        />
      ) : (
        <Tag color={quantity <= lowStockThreshold ? 'red' : quantity === 0 ? 'volcano' : 'green'}>
          {quantity || 0}
        </Tag>
      ),
      sorter: (a, b) => (a.quantity || 0) - (b.quantity || 0)
    },
    {
      title: 'MRP (₹)',
      dataIndex: 'mrp',
      key: 'mrp',
      render: (text, record) => editId === record._id ? (
        <InputNumber 
          min={0}
          value={editedProduct.mrp}
          onChange={(value) => handleNumberChange('mrp', value)}
          style={{ width: '100%' }}
        />
      ) : `₹${(text || 0).toFixed(2)}`,
      sorter: (a, b) => (a.mrp || 0) - (b.mrp || 0)
    },
    {
      title: 'Rate (₹)',
      dataIndex: 'rate',
      key: 'rate',
      render: (text, record) => editId === record._id ? (
        <InputNumber 
          min={0}
          value={editedProduct.rate}
          onChange={(value) => handleNumberChange('rate', value)}
          style={{ width: '100%' }}
        />
      ) : `₹${(text || 0).toFixed(2)}`,
      sorter: (a, b) => (a.rate || 0) - (b.rate || 0)
    },
    {
      title: 'GST (%)',
      dataIndex: 'gst',
      key: 'gst',
      render: (text, record) => editId === record._id ? (
        <InputNumber 
          min={0}
          value={editedProduct.gst}
          onChange={(value) => handleNumberChange('gst', value)}
          style={{ width: '100%' }}
        />
      ) : `${text || 0}%`,
      sorter: (a, b) => (a.gst || 0) - (b.gst || 0)
    },
    {
      title: 'Packing',
      dataIndex: 'packing',
      key: 'packing',
      render: (text, record) => editId === record._id ? (
        <Input
          name="packing"
          value={editedProduct.packing}
          onChange={handleChange}
        />
      ) : text || 'N/A'
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => {
        if (editId === record._id) {
          return (
            <Space size="middle">
              <Button type="primary" icon={<CheckOutlined />} onClick={handleSave} />
              <Button danger icon={<CloseOutlined />} onClick={handleCancelEdit} />
            </Space>
          );
        }
        return (
          <Space size="middle">
            <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
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

  // Tab configuration
  const tabItems = [
    {
      key: 'inventory',
      label: 'Full Inventory',
      children: (
        <Table 
          columns={columns} 
          dataSource={filteredProducts.map((item, index) => ({ ...item, index }))} 
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1800 }}
          loading={loading}
        />
      ),
    },
    {
      key: 'outOfStock',
      label: `Out of Stock (${outOfStockProducts.length})`,
      children: (
        <Table 
          columns={outOfStockColumns} 
          dataSource={filteredProducts.map((item, index) => ({ ...item, index }))} 
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          loading={loading}
        />
      ),
    },
    {
      key: 'lowStock',
      label: `Low Stock (${getLowStockItems().length})`,
      children: (
        <Table 
          columns={columns} 
          dataSource={filteredProducts.map((item, index) => ({ ...item, index }))} 
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1800 }}
          loading={loading}
        />
      ),
    },
    {
      key: 'nearExpiry',
      label: `Near Expiry (${getNearExpiryItems().length})`,
      children: (
        <Table 
          columns={columns} 
          dataSource={filteredProducts.map((item, index) => ({ ...item, index }))} 
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1800 }}
          loading={loading}
        />
      ),
    },
    {
      key: 'expired',
      label: `Expired (${getExpiredItems().length})`,
      children: (
        <Table 
          columns={columns} 
          dataSource={filteredProducts.map((item, index) => ({ ...item, index }))} 
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1800 }}
          loading={loading}
        />
      ),
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <SyncOutlined spin style={{ fontSize: 24 }} />
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="manage-product-stock-container">
      <div className="header-section">
        <Title level={2} className="page-title">
          <StockOutlined /> Pharmacy Stock Management
        </Title>
       
      </div>

      {/* Financial Summary Section */}
      <div className="financial-summary-section">
        <Title level={4} className="section-title">Financial Overview</Title>
        <Divider />
        <Row gutter={16}>
          <Col span={6}>
            <Card className="summary-card">
              <Statistic 
                title="Total Purchases" 
                value={`₹${financialMetrics.totalPurchases.toFixed(2)}`} 
                prefix={<ShoppingCartOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="summary-card">
              <Statistic 
                title="Total Sales" 
                value={`₹${financialMetrics.totalSales.toFixed(2)}`} 
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="summary-card">
              <Statistic 
                title="Current Stock Value" 
                value={`₹${financialMetrics.totalStockValue.toFixed(2)}`} 
                prefix={<StockOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="summary-card">
              <Statistic 
                title="Net Profit/Loss" 
                value={`₹${Math.abs(financialMetrics.profitLoss).toFixed(2)}`} 
                valueStyle={{ color: financialMetrics.profitLoss >= 0 ? '#3f8600' : '#cf1322' }}
                prefix={financialMetrics.profitLoss >= 0 ? <LineChartOutlined /> : <ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Search and Filter Controls */}
      <div className="control-section">
        <Title level={4} className="section-title">Inventory Controls</Title>
        <Divider />
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Space size="large">
              <Input
                placeholder="Search by product name"
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />
              <Input
                placeholder="Search by generic name"
                prefix={<SearchOutlined />}
                value={searchGenericName}
                onChange={e => setSearchGenericName(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />
            </Space>
          </Col>
          <Col span={24}>
            <Space size="large">
              <InputNumber
                addonBefore="Low Stock Threshold"
                value={lowStockThreshold}
                onChange={value => setLowStockThreshold(value)}
                min={1}
                style={{ width: 220 }}
              />
              <InputNumber
                addonBefore="Near Expiry Days"
                value={nearExpiryDays}
                onChange={value => setNearExpiryDays(value)}
                min={1}
                style={{ width: 220 }}
              />
              <Button 
                icon={<SyncOutlined />}
                onClick={fetchData}
              >
                Refresh Data
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Status Summary Cards */}
      <div className="status-summary-section">
        <Row gutter={16}>
          <Col span={6}>
            <Card 
              className={`status-card ${activeTab === 'outOfStock' ? 'active-card' : ''}`}
              onClick={() => setActiveTab('outOfStock')}
            >
              <Statistic 
                title="Out of Stock" 
                value={outOfStockProducts.length} 
                prefix={<FrownOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              className={`status-card ${activeTab === 'lowStock' ? 'active-card' : ''}`}
              onClick={() => setActiveTab('lowStock')}
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
              className={`status-card ${activeTab === 'nearExpiry' ? 'active-card' : ''}`}
              onClick={() => setActiveTab('nearExpiry')}
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
              className={`status-card ${activeTab === 'expired' ? 'active-card' : ''}`}
              onClick={() => setActiveTab('expired')}
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
      </div>

      {/* Main Inventory Table */}
      <div className="inventory-table-section">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          className="dashboard-tabs"
          items={tabItems}
          tabBarExtraContent={{
            right: (
              <Text strong style={{ marginRight: 16 }}>
                Showing {filteredProducts.length} items
              </Text>
            )
          }}
        />
      </div>
    </div>
  );
};

export default ManageProductStock;