import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API from "../api";
import { QRCodeCanvas } from 'qrcode.react';
import './InvoicePage.css';
import AddCustomer from './AddCustomer';

const formatCurrency = (value) => {
  const num = Number(value);
  return isNaN(num) ? '₹0.00' : `₹${num.toFixed(2)}`;
};

const InvoicePage = () => {
  const [invoice, setInvoice] = useState({
    number: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
    date: new Date().toISOString().split('T')[0],
    paymentType: 'Cash',
    subtotal: 0,
    gstTotal: 0,
    totalAmount: 0,
    totalDiscount: 0,
  });

  const [customer, setCustomer] = useState({
    name: '',
    contact: '',
    email: '',
    loyaltyPoints: 0
  });
  const [redeemPoints, setRedeemPoints] = useState(0);

  const [items, setItems] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [notification, setNotification] = useState('');

  // Fetch stock data
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const { data } = await axios.get(`${API}/api/stocks`);
        const formattedData = data.data.map(item => ({
          ...item,
          quantity: Number(item.quantity) || 0,
          mrp: Number(item.mrp) || 0,
          gst: Number(item.gst) || 0,
          expiryDate: item.expiryDate || 'N/A'
        }));
        setStockData(formattedData || []);
      } catch (error) {
        console.error('Error fetching stock data:', error);
        setStockData([]);
      }
    };
    fetchStockData();
  }, []);

  // Fetch customer suggestions
  useEffect(() => {
    if (isSelected) {
      setIsSelected(false);
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      if (customer.contact.length >= 3 && customer.contact.length < 10) {
        fetchCustomerSuggestions(customer.contact);
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [customer.contact, isSelected]);

  const fetchCustomerSuggestions = async (query) => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/customers/search`, {
        params: { contact: query },
      });
      setSuggestions(data);
      setShowAddCustomer(data.length === 0);
    } catch (error) {
      console.error('Customer search failed:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addNewProductRow = () => {
    setItems([...items, { 
      productName: '', 
      batchId: '', 
      packing: '', 
      quantity: '', 
      discount: '',
      stockQuantity: '',
      expiryDate: '',
      mrp: '',
      gst: '',
      packingOptions: [],
      total: 0,
      newRow: true 
    }]);
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...items];
    const currentItem = updatedItems[index];

    if (field === 'productName') {
      const productBatches = stockData.filter(item => item.productName === value);
      
      updatedItems[index] = {
        ...currentItem,
        productName: value,
        batchId: '',
        packing: '',
        stockQuantity: '',
        expiryDate: '',
        mrp: '',
        gst: '',
        packingOptions: [...new Set(productBatches.map(b => b.packing))],
        quantity: '',
        discount: '',
        total: 0
      };
    } 
    else if (field === 'batchId' && value) {
      const selectedBatch = stockData.find(item => 
        item.batchId === value && 
        item.productName === currentItem.productName
      );
      
      if (selectedBatch) {
        updatedItems[index] = {
          ...currentItem,
          batchId: value,
          packing: selectedBatch.packing,
          stockQuantity: Number(selectedBatch.quantity) || 0,
          expiryDate: selectedBatch.expiryDate || 'N/A',
          mrp: Number(selectedBatch.mrp) || 0,
          gst: Number(selectedBatch.gst) || 0,
          packingOptions: [selectedBatch.packing],
          quantity: currentItem.quantity || '',
          discount: currentItem.discount || 0
        };
      }
    }
    else if (field === 'packing' && value) {
      const matchingBatch = stockData.find(item => 
        item.productName === currentItem.productName && 
        item.packing === value
      );
      
      if (matchingBatch) {
        updatedItems[index] = {
          ...currentItem,
          packing: value,
          batchId: matchingBatch.batchId,
          stockQuantity: Number(matchingBatch.quantity) || 0,
          expiryDate: matchingBatch.expiryDate || 'N/A',
          mrp: Number(matchingBatch.mrp) || 0,
          gst: Number(matchingBatch.gst) || 0,
          packingOptions: [matchingBatch.packing]
        };
      }
    }
    else {
      updatedItems[index][field] = field === 'quantity' || field === 'discount' 
        ? Number(value) || 0 
        : value;
    }

    if (['quantity', 'discount', 'mrp', 'gst', 'packing', 'batchId'].includes(field)) {
      updatedItems[index].total = calculateItemTotal(updatedItems[index]);
    }

    setItems(updatedItems);
    updateTotals(updatedItems);
  };

  const calculateItemTotal = (item) => {
    const mrp = Number(item.mrp) || 0;
    const quantity = Number(item.quantity) || 0;
    const discount = Number(item.discount) || 0;
    const gst = Number(item.gst) || 0;

    const priceAfterDiscount = mrp - discount;
    const totalAfterDiscount = priceAfterDiscount * quantity;
    const gstAmount = totalAfterDiscount * (gst / 100);
    
    return totalAfterDiscount + gstAmount;
  };

  const updateTotals = (items) => {
    const totals = items.reduce((acc, item) => {
      const mrp = Number(item.mrp) || 0;
      const quantity = Number(item.quantity) || 0;
      const discount = Number(item.discount) || 0;
      const gst = Number(item.gst) || 0;

      acc.subtotal += mrp * quantity;
      acc.totalDiscount += discount * quantity;
      acc.gstTotal += (mrp * quantity - discount * quantity) * (gst / 100);
      return acc;
    }, { subtotal: 0, totalDiscount: 0, gstTotal: 0 });

    setInvoice({
      ...invoice,
      subtotal: Number(totals.subtotal.toFixed(2)),
      totalDiscount: Number(totals.totalDiscount.toFixed(2)),
      gstTotal: Number(totals.gstTotal.toFixed(2)),
      totalAmount: Number((totals.subtotal - totals.totalDiscount + totals.gstTotal).toFixed(2)),
    });
  };

  const handleFinalizeSale = async () => {
    if (!customer.name || !customer.contact) {
      setNotification('Customer name and contact are required');
      setTimeout(() => setNotification(''), 3000);
      return;
    }
  
    if (items.length === 0) {
      setNotification('At least one item is required');
      setTimeout(() => setNotification(''), 3000);
      return;
    }
  
    const invalidItems = items.filter(item => {
      const quantity = Number(item.quantity);
      const mrp = Number(item.mrp);
      const total = calculateItemTotal(item);
      
      return (
        !item.productName || 
        !item.batchId || 
        isNaN(quantity) || 
        quantity <= 0 ||
        isNaN(mrp) ||
        mrp <= 0 ||
        isNaN(total) ||
        total <= 0
      );
    });
  
    if (invalidItems.length > 0) {
      setNotification('All items must have valid product details and positive values');
      setTimeout(() => setNotification(''), 3000);
      return;
    }
  
    try {
      const calculatedTotals = items.reduce((acc, item) => {
        const quantity = Number(item.quantity);
        const mrp = Number(item.mrp);
        const discount = Number(item.discount || 0);
        const gst = Number(item.gst || 0);
        const itemTotal = calculateItemTotal(item);

        acc.subtotal += mrp * quantity;
        acc.totalDiscount += discount * quantity;
        acc.gstTotal += (mrp * quantity - discount * quantity) * (gst / 100);
        return acc;
      }, { subtotal: 0, totalDiscount: 0, gstTotal: 0 });

      const totalAmount = calculatedTotals.subtotal - calculatedTotals.totalDiscount + calculatedTotals.gstTotal;

      const saleData = {
        customer,
        items: items.map((item) => ({
          productName: item.productName,
          batchId: item.batchId,
          packing: item.packing,
          quantity: Number(item.quantity),
          mrp: Number(item.mrp),
          gst: Number(item.gst || 0),
          discount: Number(item.discount || 0),
          expiryDate: item.expiryDate,
          total: calculateItemTotal(item)
        })),
        paymentType: invoice.paymentType,
        subtotal: Number(calculatedTotals.subtotal.toFixed(2)),
        totalDiscount: Number(calculatedTotals.totalDiscount.toFixed(2)),
        gstTotal: Number(calculatedTotals.gstTotal.toFixed(2)),
        totalAmount: Number(totalAmount.toFixed(2)),
        redeemPoints: Number(redeemPoints)
      };

      await axios.post(`${API}/api/sales`, saleData);
      
      setNotification('Sale completed successfully!');
      setTimeout(() => setNotification(''), 3000);
      
      // Reset form
      setItems([]);
      setRedeemPoints(0);
      setCustomer({ name: '', contact: '', email: '', loyaltyPoints: 0 });
      setInvoice({
        number: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toISOString().split('T')[0],
        paymentType: 'Cash',
        subtotal: 0,
        gstTotal: 0,
        totalAmount: 0,
        totalDiscount: 0,
      });

    } catch (error) {
      console.error('Sale creation failed:', error.response?.data || error.message);
      setNotification(`Error: ${error.response?.data?.message || error.message}`);
      setTimeout(() => setNotification(''), 5000);
    }
  };

  const handleCustomerChange = (e) => {
    setIsSelected(false);
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleSuggestionClick = (customerData) => {
    setCustomer({
      contact: customerData.customerContact,
      name: customerData.customerName,
      email: customerData.email || '',
      loyaltyPoints: customerData.loyaltyPoints || 0
    });
    setSuggestions([]);
    setIsSelected(true);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoice.number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .invoice-header { border-bottom: 2px solid #000; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .totals { margin-top: 30px; float: right; width: 300px; }
            .totals div { display: flex; justify-content: space-between; margin: 10px 0; }
            .grand-total { font-weight: bold; font-size: 1.2em; }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <h1>Invoice #${invoice.number}</h1>
            <p>Date: ${new Date(invoice.date).toLocaleDateString()}</p>
          </div>
          <div class="customer-details">
            <h3>Customer Information</h3>
            <p>Name: ${customer.name}</p>
            <p>Contact: ${customer.contact}</p>
            ${customer.email ? `<p>Email: ${customer.email}</p>` : ''}
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Packing</th>
                <th>Batch</th>
                <th>Expiry</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Discount</th>
                <th>GST</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (item) => `
                <tr>
                  <td>${item.productName || ''}</td>
                  <td>${item.packing || ''}</td>
                  <td>${item.batchId || ''}</td>
                  <td>${item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}</td>
                  <td>${formatCurrency(item.mrp)}</td>
                  <td>${item.quantity || 0}</td>
                  <td>${formatCurrency(item.discount)}</td>
                  <td>${item.gst ? `${Number(item.gst)}%` : '0%'}</td>
                  <td>${formatCurrency(item.total)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          <div class="totals">
            <div>
              <span>Subtotal:</span>
              <span>${formatCurrency(invoice.subtotal)}</span>
            </div>
            <div>
              <span>Total Discount:</span>
              <span>${formatCurrency(invoice.totalDiscount)}</span>
            </div>
            <div>
              <span>GST Total:</span>
              <span>${formatCurrency(invoice.gstTotal)}</span>
            </div>
            ${redeemPoints > 0 ? `
            <div style="color: green;">
              <span>Loyalty Discount (${redeemPoints} pts):</span>
              <span>-${formatCurrency(redeemPoints)}</span>
            </div>
            ` : ''}
            <div class="grand-total">
              <span>Grand Total:</span>
              <span>${formatCurrency(Math.max(0, invoice.totalAmount - redeemPoints))}</span>
            </div>
            <hr style="margin: 15px 0; border: 0; border-top: 1px dashed #ccc;" />
            <div style="font-size: 0.9em; color: #555;">
              <h4 style="margin: 0 0 10px 0;">Loyalty Summary</h4>
              <div><span>Points Before:</span> <span>${customer.loyaltyPoints}</span></div>
              <div><span>Points Redeemed:</span> <span>-${redeemPoints}</span></div>
              <div><span>Points Earned:</span> <span>+${Math.floor(Math.max(0, invoice.totalAmount - redeemPoints) / 100)}</span></div>
              <div><strong>New Balance:</strong> <strong>${customer.loyaltyPoints - redeemPoints + Math.floor(Math.max(0, invoice.totalAmount - redeemPoints) / 100)}</strong></div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); }
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const generateQRCode = () => {
    const finalAmount = Math.max(0, invoice.totalAmount - redeemPoints);
    const paymentUrl = `upi://pay?pa=your-upi-id@upi&pn=Your%20Business&mc=&tid=&tr=${invoice.number}&tn=Invoice%20Payment&am=${finalAmount}&cu=INR`;
    setQrCode(paymentUrl);
  };

  return (
    <div className="invoice-container">
      <h2>New Invoice</h2>

      {notification && <div className="notification">{notification}</div>}

      <div className="horizontal-form">
        <div className="input-group">
          <label>Contact Number</label>
          <input
            type="text"
            name="contact"
            value={customer.contact}
            onChange={(e) => {
              setIsSelected(false);
              setCustomer((prev) => ({ ...prev, contact: e.target.value }));
            }}
            placeholder="Start typing..."
            autoComplete="off"
          />
          {isLoading && <div className="spinner">Loading...</div>}
          {suggestions.length > 0 && (
            <ul className="suggestions-dropdown">
              {suggestions.map((customer) => (
                <li key={customer._id} onClick={() => handleSuggestionClick(customer)}>
                  {customer.customerContact} - {customer.customerName}
                </li>
              ))}
            </ul>
          )}
          {showAddCustomer && (
            <button className="add-customer-button" onClick={() => setIsModalOpen(true)}>
              Add Customer
            </button>
          )}
        </div>
        <div className="input-group">
          <label>Customer Name</label>
          <input type="text" name="name" value={customer.name} onChange={handleCustomerChange} />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input type="email" name="email" value={customer.email} onChange={handleCustomerChange} />
        </div>
      </div>

      <div className="product-section">
        <h3>Add Products</h3>
        <button className="add-product-btn" onClick={addNewProductRow}>
          Add Product
        </button>
      </div>

      <div className="items-table">
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Batch ID</th>
              <th>Packing</th>
              <th>Available Qty</th>
              <th>Expiry</th>
              <th>Quantity</th>
              <th>MRP</th>
              <th>GST</th>
              <th>Discount (₹)</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    value={item.productName}
                    onChange={(e) => updateItem(index, 'productName', e.target.value)}
                    list={`product-options-${index}`}
                  />
                  <datalist id={`product-options-${index}`}>
                    {[...new Set(stockData.map(s => s.productName))].map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </td>
                <td>
                  <select
                    value={item.batchId}
                    onChange={(e) => updateItem(index, 'batchId', e.target.value)}
                    disabled={!item.productName}
                  >
                    <option value="">Select Batch</option>
                    {stockData
                      .filter(stock => stock.productName === item.productName)
                      .map((batch) => (
                        <option key={batch.batchId} value={batch.batchId}>
                          {batch.batchId} (Exp: {new Date(batch.expiryDate).toLocaleDateString()})
                        </option>
                      ))}
                  </select>
                </td>
                <td>
                  <select
                    value={item.packing}
                    onChange={(e) => updateItem(index, 'packing', e.target.value)}
                    disabled={!item.productName}
                  >
                    <option value="">Select Packing</option>
                    {item.packingOptions?.map((pack) => (
                      <option key={pack} value={pack}>{pack}</option>
                    ))}
                  </select>
                </td>
                <td>{item.stockQuantity || 0}</td>
                <td>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    max={item.stockQuantity || 0}
                    value={item.quantity || ''}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    disabled={!item.batchId}
                  />
                </td>
                <td>{formatCurrency(item.mrp)}</td>
                <td>{item.gst ? `${Number(item.gst)}%` : '0%'}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={item.discount || 0}
                    onChange={(e) => updateItem(index, 'discount', e.target.value)}
                  />
                </td>
                <td>{formatCurrency(item.total)}</td>
                <td>
                  <button onClick={() => setItems(items.filter((_, i) => i !== index))}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="totals-section">
        <div className="total-row">
          <span>Subtotal:</span>
          <span>{formatCurrency(invoice.subtotal)}</span>
        </div>
        <div className="total-row">
          <span>Total Discount:</span>
          <span>{formatCurrency(invoice.totalDiscount)}</span>
        </div>
        <div className="total-row">
          <span>GST Total:</span>
          <span>{formatCurrency(invoice.gstTotal)}</span>
        </div>
        <div className="total-row grand-total">
          <span>Total:</span>
          <span>{formatCurrency(invoice.totalAmount)}</span>
        </div>
      </div>

      <div className="loyalty-section" style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginTop: '15px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0, color: '#2b6cb0' }}>Loyalty Rewards</h3>
        <p>Available Points: <strong>{customer.loyaltyPoints}</strong></p>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: customer.loyaltyPoints >= 50 ? 'pointer' : 'not-allowed', fontWeight: 'bold', opacity: customer.loyaltyPoints >= 50 ? 1 : 0.6 }}>
            <input
              type="checkbox"
              checked={redeemPoints > 0}
              disabled={customer.loyaltyPoints < 50}
              onChange={(e) => {
                if (e.target.checked) {
                  setRedeemPoints(50); // Default to minimum redemption (50 points)
                } else {
                  setRedeemPoints(0);
                }
              }}
              style={{ width: '18px', height: '18px', cursor: customer.loyaltyPoints >= 50 ? 'pointer' : 'not-allowed' }}
            />
            Redeem Loyalty Points for Discount
          </label>
          {customer.loyaltyPoints < 50 && (
            <p style={{ color: '#e53e3e', fontSize: '0.9em', marginTop: '5px' }}>
              Must have at least 50 points to redeem (Current: {customer.loyaltyPoints})
            </p>
          )}
        </div>

        {redeemPoints > 0 && (
          <div className="input-group" style={{ marginTop: '10px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Select Points to Redeem</label>
            <select
              value={redeemPoints}
              onChange={(e) => setRedeemPoints(Number(e.target.value))}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '1rem', backgroundColor: '#fff' }}
            >
              {Array.from(
                { length: Math.floor(customer.loyaltyPoints / 50) },
                (_, i) => (i + 1) * 50
              ).map((pts) => (
                <option key={pts} value={pts}>
                  Redeem {pts} Points (Save ₹{pts})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="total-row grand-total" style={{ color: '#28a745', marginTop: '15px', fontSize: '1.2em' }}>
          <span>Final Amount To Pay:</span>
          <span>{formatCurrency(Math.max(0, invoice.totalAmount - redeemPoints))}</span>
        </div>
        <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
          Points to Earn on this sale: <strong>{Math.floor(Math.max(0, invoice.totalAmount - redeemPoints) / 100)}</strong>
        </p>
      </div>

      <div className="horizontal-form">
        <div className="input-group">
          <label>Invoice Number</label>
          <input type="text" value={invoice.number} readOnly />
        </div>
        <div className="input-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={invoice.date}
            onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
          />
        </div>
        <div className="input-group payment-type">
          <label>Payment Type</label>
          <select
            name="paymentType"
            value={invoice.paymentType}
            onChange={(e) => setInvoice({ ...invoice, paymentType: e.target.value })}
          >
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Online">Online</option>
          </select>
        </div>
      </div>

     

      {/* Action Buttons */}
      <div className="action-buttons">
        <button onClick={handleFinalizeSale} className="btn-primary">
          Finalize Sale
        </button>
        <button onClick={handlePrint} className="btn-secondary">
          Print Invoice
        </button>
        <button onClick={generateQRCode} className="btn-tertiary">
          Generate UPI QR
        </button>
      </div>

      {/* QR Code Display */}
      {qrCode && (
        <div className="qr-container">
          <h3>Scan to Pay</h3>
          <QRCodeCanvas value={qrCode} size={200} />
        </div>
      )}

      {/* Notifications */}
      {notification && <div className="notification">{notification}</div>}

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AddCustomer onClose={() => setIsModalOpen(false)} />
            <button className="close-button" onClick={() => setIsModalOpen(false)}>
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicePage;