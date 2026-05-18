import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import API from "../api";
import './SalesReport.css';

const SalesReport = () => {
  const [salesData, setSalesData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  const monthAbbreviations = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await axios.get(`${API}/api/sales`);
        console.log('API response:', response.data);
        
        // Ensure we're setting an array to the state
        let data = response.data;
        if (!Array.isArray(data)) {
          // Try to find an array in the response object
          if (data && typeof data === 'object') {
            const possibleArrayProps = ['sales', 'data', 'items', 'results'];
            for (const prop of possibleArrayProps) {
              if (Array.isArray(data[prop])) {
                data = data[prop];
                console.log(`Found array in response.data.${prop}`);
                break;
              }
            }
          }
          
          // If we still don't have an array, set an empty one
          if (!Array.isArray(data)) {
            console.error('API did not return an array and no array property was found');
            data = [];
          }
        }
        
        setSalesData(data);
        
        if (data.length > 0) {
          const uniqueYears = [...new Set(data.map(sale => 
            new Date(sale.date).getFullYear()
          ))];
          setYears(uniqueYears.sort((a, b) => b - a));
        } else {
          setYears([new Date().getFullYear()]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        setSalesData([]);  // Ensure it's an array even after error
        setYears([new Date().getFullYear()]);
        setLoading(false);
      }
    };
    fetchSalesData();
  }, []);

  const processData = {
    getLast7Days: () => {
      // Guard clause to ensure salesData is an array
      if (!Array.isArray(salesData)) {
        console.error('salesData is not an array in getLast7Days');
        return {};
      }
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      
      return salesData.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= startDate && saleDate <= endDate;
      }).reduce((acc, sale) => {
        const saleDate = new Date(sale.date);
        const day = saleDate.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short'
        });
        acc[day] = (acc[day] || 0) + sale.totalAmount;
        return acc;
      }, {});
    },

    getMonthlyData: (year) => {
      // Guard clause to ensure salesData is an array
      if (!Array.isArray(salesData)) {
        console.error('salesData is not an array in getMonthlyData');
        return Array.from({ length: 12 }, (_, month) => ({
          month: monthAbbreviations[month],
          total: 0
        }));
      }
      
      return Array.from({ length: 12 }, (_, month) => {
        const monthSales = salesData.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate.getFullYear() === year && saleDate.getMonth() === month;
        });
        return {
          month: monthAbbreviations[month],
          total: monthSales.reduce((sum, sale) => sum + sale.totalAmount, 0)
        };
      });
    },

    getYearlyData: () => {
      // Guard clause to ensure salesData is an array
      if (!Array.isArray(salesData)) {
        console.error('salesData is not an array in getYearlyData');
        return years.map(year => ({ year, total: 0 }));
      }
      
      return years.map(year => ({
        year,
        total: salesData.filter(sale => 
          new Date(sale.date).getFullYear() === year
        ).reduce((sum, sale) => sum + sale.totalAmount, 0)
      }));
    },

    getMonthlyTopProducts: (month) => {
      // Guard clause to ensure salesData is an array
      if (!Array.isArray(salesData)) {
        console.error('salesData is not an array in getMonthlyTopProducts');
        return [{ product: 'No data available', total: 0 }];
      }
      
      const monthlySales = salesData.filter(sale => 
        new Date(sale.date).getMonth() === month
      );
      
      // If no sales or no items, return placeholder data
      if (monthlySales.length === 0 || 
          !monthlySales.some(sale => Array.isArray(sale.items) && sale.items.length > 0)) {
        return [{ product: 'No data available', total: 0 }];
      }
      
      const productMap = monthlySales.flatMap(sale => 
        Array.isArray(sale.items) ? sale.items.map(item => ({
          product: item.productName,
          total: item.total
        })) : []
      ).reduce((acc, item) => {
        if (item && item.product) {
          acc[item.product] = (acc[item.product] || 0) + (item.total || 0);
        }
        return acc;
      }, {});

      return Object.entries(productMap)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([product, total]) => ({ product, total }));
    }
  };

  if (loading) return <div className="loading-message">Loading sales data...</div>;

  return (
    <div className="sales-analytics-container">
      <h2>Sales Analytics Dashboard</h2>
      
      <div className="filters">
        <div className="filter-item">
          <label>Select Year: </label>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-item">
          <label>Select Month: </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {monthAbbreviations.map((month, index) => (
              <option key={month} value={index}>{month}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="charts-grid">
        {/* Last 7 Days Trend */}
        <div className="chart-card">
          <h3>Last 7 Days Sales Trend</h3>
          <ResponsiveContainer width="100%" height={350}>
            {Object.keys(processData.getLast7Days()).length > 0 ? (
              <LineChart 
                data={Object.entries(processData.getLast7Days()).map(([date, total]) => ({ 
                  date, 
                  total 
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                />
              </LineChart>
            ) : (
              <div className="no-data-message">No recent sales data available</div>
            )}
          </ResponsiveContainer>
        </div>

        {/* Monthly Sales */}
        <div className="chart-card">
          <h3>Monthly Sales ({selectedYear})</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={processData.getMonthlyData(selectedYear)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="total" 
                fill="#16a34a" 
                name="Total Sales"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Yearly Comparison */}
        <div className="chart-card">
          <h3>Yearly Sales Comparison</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={processData.getYearlyData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="total" 
                fill="#ea580c" 
                name="Annual Sales"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="chart-card">
          <h3>Top 10 Products in {monthAbbreviations[selectedMonth]}</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={processData.getMonthlyTopProducts(selectedMonth)}
                dataKey="total"
                nameKey="product"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={40}
                label
              >
                {processData.getMonthlyTopProducts(selectedMonth).map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`hsl(${index * 36}, 70%, 50%)`}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => (
                  <span style={{ fontSize: '12px' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;