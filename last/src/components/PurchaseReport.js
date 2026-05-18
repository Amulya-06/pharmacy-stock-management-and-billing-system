import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import API from "../api";
import './PurchaseReport.css';

const PurchaseReport = () => {
  const [purchaseData, setPurchaseData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const monthAbbreviations = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    const fetchPurchaseData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API}/api/purchases`);
        
        // Data normalization with enhanced error handling
        const data = response?.data?.data || response?.data || [];
        const isArrayWithData = Array.isArray(data) && data.length > 0;

        const normalizedData = isArrayWithData ? data.map(purchase => ({
          id: purchase._id || Math.random().toString(36).substr(2, 9),
          date: purchase.date || new Date().toISOString(),
          supplierName: purchase.supplierName || 'Unknown Supplier',
          totalAmount: parseFloat(purchase.grandTotal) || 0,
          products: (purchase.products || []).map(product => ({
            productName: product.productName || 'Unknown Product',
            genericName: product.genericName || '',
            category: product.category || 'Uncategorized',
            quantity: parseInt(product.quantity, 10) || 0,
            rate: parseFloat(product.rate) || 0,
            amount: parseFloat(product.amount) || 0,
            mrp: parseFloat(product.mrp) || 0,
            batchId: product.batchId || '',
            expiryDate: product.expiryDate || null
          }))
        })) : [];

        setPurchaseData(normalizedData);

        // Year extraction with fallback
        const extractedYears = normalizedData.length > 0 
          ? [...new Set(normalizedData.map(p => new Date(p.date).getFullYear()))]
          : [new Date().getFullYear()];
        setYears(extractedYears.sort((a, b) => b - a));

        setError(null);
      } catch (err) {
        console.error('Data fetch error:', err);
        setError('Failed to fetch purchase data. Please check the API connection.');
        setPurchaseData([]);
        setYears([new Date().getFullYear()]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPurchaseData();
  }, []);

  const processData = {
    // Inside processData object
getLast7Days: () => {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 6); // Changed to -6 to include 7 days total

  const filteredData = purchaseData
    .filter(p => {
      const pDate = new Date(p.date);
      return pDate >= startDate && pDate <= endDate;
    })
    .reduce((acc, p) => {
      const day = new Date(p.date).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short'
      });
      acc[day] = (acc[day] || 0) + p.totalAmount;
      return acc;
    }, {});

  // Convert to array format for Recharts
  return Object.entries(filteredData).map(([date, total]) => ({ date, total }));
},

    getMonthlyData: (year) => {
      return monthAbbreviations.map((month, index) => {
        const total = purchaseData
          .filter(p => {
            const pDate = new Date(p.date);
            return pDate.getFullYear() === year && pDate.getMonth() === index;
          })
          .reduce((sum, p) => sum + p.totalAmount, 0);
          
        return { month, total };
      });
    },

    getYearlyData: () => {
      return years.map(year => ({
        year,
        total: purchaseData
          .filter(p => new Date(p.date).getFullYear() === year)
          .reduce((sum, p) => sum + p.totalAmount, 0)
      }));
    },

    getTopProducts: (month) => {
      const monthlyProducts = purchaseData
        .filter(p => new Date(p.date).getMonth() === month)
        .flatMap(p => p.products)
        .filter(Boolean);

      if (!monthlyProducts.length) return [];

      const productMap = monthlyProducts.reduce((acc, product) => {
        const name = product.productName || 'Unknown Product';
        acc[name] = (acc[name] || 0) + product.amount;
        return acc;
      }, {});

      return Object.entries(productMap)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([product, total]) => ({ product, total }));
    }
  };

  if (loading) return <div className="loading-message">Loading purchase data...</div>;
  if (error) return (
    <div className="error-message">
      <h3>Error</h3>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="purchase-analytics-container">
      <h2>Purchase Analytics Dashboard</h2>
      
      {purchaseData.length === 0 && (
        <div className="warning-banner">
          No purchase data available. Please check your data source.
        </div>
      )}
      
      <div className="filters">
        <div className="filter-item">
          <label>Year: </label>
          <select 
            value={selectedYear} 
            onChange={e => setSelectedYear(Number(e.target.value))}
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-item">
          <label>Month: </label>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
          >
            {monthAbbreviations.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="charts-grid">
        {/* Last 7 Days Trend */}
        <div className="chart-card">
  <h3>Weekly Purchase Trend</h3>
  <ResponsiveContainer width="100%" height={350}>
    {processData.getLast7Days().length > 0 ? (
      <LineChart data={processData.getLast7Days()}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={value => [`₹${value.toFixed(2)}`, 'Amount']} />
        <Line dataKey="total" stroke="#4f46e5" strokeWidth={2} />
      </LineChart>
    ) : (
      <div className="no-data">No recent purchases in the last 7 days</div>
    )}
  </ResponsiveContainer>
</div>

        {/* Monthly Breakdown */}
        <div className="chart-card">
          <h3>{selectedYear} Monthly Overview</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={processData.getMonthlyData(selectedYear)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={value => [`₹${value.toFixed(2)}`, 'Total']} />
              <Bar dataKey="total" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Yearly Comparison */}
        <div className="chart-card">
          <h3>Annual Comparison</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={processData.getYearlyData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={value => [`₹${value.toFixed(2)}`, 'Total']} />
              <Bar dataKey="total" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products Pie Chart */}
        <div className="chart-card">
          <h3>Top Products in {monthAbbreviations[selectedMonth]}</h3>
          <ResponsiveContainer width="100%" height={350}>
            {processData.getTopProducts(selectedMonth)?.length > 0 ? (
              <PieChart>
                <Pie
                  data={processData.getTopProducts(selectedMonth)}
                  dataKey="total"
                  nameKey="product"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={40}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {processData.getTopProducts(selectedMonth).map((_, i) => (
                    <Cell key={i} fill={`hsl(${i * 36}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Tooltip formatter={value => [`₹${value.toFixed(2)}`, 'Amount']} />
                <Legend 
                  formatter={value => (
                    <span style={{ fontSize: 12 }}>
                      {value?.length > 20 ? `${value.slice(0,17)}...` : value}
                    </span>
                  )}
                />
              </PieChart>
            ) : <div className="no-data">No products this month</div>}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReport;