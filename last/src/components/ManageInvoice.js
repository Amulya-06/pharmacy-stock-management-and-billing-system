import { useState, useEffect } from "react";
import axios from "axios";
import { Table, Input, Pagination, Button, Popconfirm, Select, DatePicker, InputNumber } from "antd";
import API from "../api";
import { 
  EditOutlined, 
  DeleteOutlined, 
  PrinterOutlined, 
  CheckOutlined, 
  CloseOutlined, 
  SearchOutlined 
} from "@ant-design/icons";
import dayjs from 'dayjs';
import "./ManageInvoice.css";
const { Option } = Select;
const { TextArea } = Input;

const ManageInvoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [editingKey, setEditingKey] = useState(null);
  const [editedInvoice, setEditedInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, [search, page, limit]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/api/sales`, {
        params: { page, limit, search },
      });

      if (response.data.success) {
        setInvoices(response.data.data);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setInvoices([]);
    }
    setLoading(false);
  };

  const handleEdit = (invoice) => {
    setEditingKey(invoice._id);
    setEditedInvoice({ 
      ...invoice,
      date: dayjs(invoice.date),
      items: invoice.items.map(item => ({
        ...item,
        expiryDate: dayjs(item.expiryDate)
      }))
    });
  };

  const handleSave = async () => {
    try {
      const dataToSend = {
        ...editedInvoice,
        date: editedInvoice.date.toDate(),
        items: editedInvoice.items.map(item => ({
          ...item,
          expiryDate: item.expiryDate.toDate()
        }))
      };
      await axios.put(`${API}/api/sales/${editedInvoice._id}`, dataToSend);
      fetchInvoices();
    } catch (error) {
      console.error("Error updating invoice:", error);
    }
    setEditingKey(null);
    setEditedInvoice(null);
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditedInvoice(null);
  };

  const handleChange = (key, value) => {
    setEditedInvoice(prev => ({ ...prev, [key]: value }));
  };

  const handleItemChange = (index, key, value) => {
    setEditedInvoice(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [key]: value };
      
      // Recalculate item total if relevant fields change
      if (['mrp', 'quantity', 'discount', 'gst'].includes(key)) {
        newItems[index].total = calculateItemTotal(newItems[index]);
      }
      
      // Recalculate all invoice totals
      const { subtotal, totalDiscount, gstTotal, totalAmount } = calculateInvoiceTotals(newItems);
      
      return { 
        ...prev, 
        items: newItems,
        subtotal,
        totalDiscount,
        gstTotal,
        totalAmount
      };
    });
  };

  const handleDelete = async (invoiceId) => {
    try {
      await axios.delete(`${API}/api/sales/${invoiceId}`);
      fetchInvoices();
    } catch (error) {
      console.error("Error deleting invoice:", error);
    }
  };
  const calculateItemTotal = (item) => {
    const mrp = item.mrp || 0;
    const quantity = item.quantity || 0;
    const discount = item.discount || 0;
    const gst = item.gst || 0;
    
    const subtotal = mrp * quantity;
    const discountAmount = discount;
    const taxableAmount = subtotal - discountAmount;
    const gstAmount = taxableAmount * (gst / 100);
    return taxableAmount + gstAmount;
  };
  
  const calculateInvoiceTotals = (items) => {
    let subtotal = 0;
    let totalDiscount = 0;
    let gstTotal = 0;
    
    items.forEach(item => {
      const mrp = item.mrp || 0;
      const quantity = item.quantity || 0;
      const discount = item.discount || 0;
      const gst = item.gst || 0;
      
      const itemSubtotal = mrp * quantity;
      const taxableAmount = itemSubtotal - discount;
      const itemGst = taxableAmount * (gst / 100);
      
      subtotal += itemSubtotal;
      totalDiscount += discount;
      gstTotal += itemGst;
    });
    
    return {
      subtotal,
      totalDiscount,
      gstTotal,
      totalAmount: subtotal - totalDiscount + gstTotal
    };
  };
  const handlePrint = (invoice) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
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
            <h1>Invoice #${invoice.invoiceNumber}</h1>
            <p>Date: ${new Date(invoice.date).toLocaleDateString()}</p>
          </div>
          <div class="customer-details">
            <h3>Customer Information</h3>
            <p>Name: ${invoice.customer.name}</p>
            <p>Contact: ${invoice.customer.contact}</p>
            ${invoice.customer.email ? `<p>Email: ${invoice.customer.email}</p>` : ""}
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Packing</th>
                <th>Batch</th>
                <th>Expiry</th>
                <th>MRP</th>
                <th>Qty</th>
                <th>Discount</th>
                <th>GST</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.productName || ""}</td>
                  <td>${item.packing || ""}</td>
                  <td>${item.batchId || ""}</td>
                  <td>${item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "N/A"}</td>
                  <td>₹${(item.mrp || 0).toFixed(2)}</td>
                  <td>${item.quantity || 0}</td>
                  <td>₹${(item.discount || 0).toFixed(2)}</td>
                  <td>${item.gst || 0}%</td>
                  <td>₹${(item.total || 0).toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <div class="totals">
            <div><span>Subtotal:</span> <span>₹${invoice.subtotal?.toFixed(2) || "0.00"}</span></div>
            <div><span>Total Discount:</span> <span>₹${invoice.totalDiscount?.toFixed(2) || "0.00"}</span></div>
            <div><span>GST Total:</span> <span>₹${invoice.gstTotal?.toFixed(2) || "0.00"}</span></div>
            <div class="grand-total"><span>Grand Total:</span> <span>₹${invoice.totalAmount?.toFixed(2) || "0.00"}</span></div>
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

  const expandedRowRender = (record) => {
    const columns = [
      { title: 'Product', dataIndex: 'productName', key: 'productName',width: 120,
        render: (text, _, index) => editingKey === record._id ? (
          <Input 
            value={editedInvoice.items[index].productName} 
            onChange={(e) => handleItemChange(index, 'productName', e.target.value)} 
          />
        ) : text
      },
      
      { title: 'Packing', dataIndex: 'packing', key: 'packing',width: 60,
        render: (text, _, index) => editingKey === record._id ? (
          <Input 
            value={editedInvoice.items[index].packing} 
            onChange={(e) => handleItemChange(index, 'packing', e.target.value)} 
          />
        ) : text
      },
      { title: 'Batch', dataIndex: 'batchId', key: 'batchId',width: 60,
        render: (text, _, index) => editingKey === record._id ? (
          <Input 
            value={editedInvoice.items[index].batchId} 
            onChange={(e) => handleItemChange(index, 'batchId', e.target.value)} 
          />
        ) : text
      },
      { title: 'Expiry', dataIndex: 'expiryDate', key: 'expiryDate',width: 80,
        render: (text, _, index) => editingKey === record._id ? (
          <DatePicker 
            value={editedInvoice.items[index].expiryDate} 
            onChange={(date) => handleItemChange(index, 'expiryDate', date)} 
          />
        ) : text ? new Date(text).toLocaleDateString() : 'N/A'
      },
      { title: 'MRP', dataIndex: 'mrp', key: 'mrp',width: 60,
        render: (text, _, index) => editingKey === record._id ? (
          <InputNumber 
            value={text} 
            onChange={(value) => handleItemChange(index, 'mrp', value)} 
            min={0}
            step={0.01}
          />
        ) : `₹${text?.toFixed(2) || '0.00'}`
      },
      { title: 'Qty', dataIndex: 'quantity', key: 'quantity',width: 40,
        render: (text, _, index) => editingKey === record._id ? (
          <InputNumber 
            value={text} 
            onChange={(value) => handleItemChange(index, 'quantity', value)} 
            min={1}
          />
        ) : text
      },
      { title: 'Discount', dataIndex: 'discount', key: 'discount',width: 60,
        render: (text, _, index) => editingKey === record._id ? (
          <InputNumber 
            value={text} 
            onChange={(value) => handleItemChange(index, 'discount', value)} 
            min={0}
            step={0.01}
          />
        ) : `₹${text?.toFixed(2) || '0.00'}`
      },
      { title: 'GST %', dataIndex: 'gst', key: 'gst',width: 50,
        render: (text, _, index) => editingKey === record._id ? (
          <InputNumber 
            value={text} 
            onChange={(value) => handleItemChange(index, 'gst', value)} 
            min={0}
            max={100}
          />
        ) : `${text}%`
      },
      { 
        title: 'Total', 
        dataIndex: 'total',key: 'total',width:70,
        render: (text) => (
          <span className="font-medium">₹{text?.toFixed(2)}</span>
        )
      },
    ];

    return (
      <Table 
        columns={columns} 
        dataSource={record.items} 
        rowKey={(item, index) => `${record._id}-${index}`}
        pagination={false}
        size="small"
        scroll={{ x: 800 }}
        bordered
      />
    );
  };

  const columns = [
    { 
      title: "Invoice No", 
      dataIndex: "invoiceNumber", 
      key: "invoiceNumber",
      width: 100, // Fixed width
      render: (text) => <span className="font-medium">{text}</span>
    },
    {
      title: "Date",dataIndex: "date",key: "date",width: 80, // Fixed width
      render: (text, record) => editingKey === record._id ? (
        <DatePicker 
          value={editedInvoice.date} 
          onChange={(date) => handleChange('date', date)} 
          format="DD/MM/YYYY"
        />
      ) : new Date(text).toLocaleDateString()
    },
    {
      title: "Customer Name",dataIndex: ["customer", "name"],key: "customerName",width: 120,
      render: (text, record) =>
        editingKey === record._id ? (
          <Input 
            value={editedInvoice.customer.name} 
            onChange={(e) => handleChange("customer", { ...editedInvoice.customer, name: e.target.value })} 
          />
        ) : (
          text || "N/A"
        ),
    },
    {
      title: "Contact",
      dataIndex: ["customer", "contact"],
      key: "contact",width: 100,
      render: (text, record) =>
        editingKey === record._id ? (
          <Input 
            value={editedInvoice.customer.contact} 
            onChange={(e) => handleChange("customer", { ...editedInvoice.customer, contact: e.target.value })} 
          />
        ) : (
          text || "N/A"
        ),
    },
    {
      title: "Email",
      dataIndex: ["customer", "email"],
      key: "email",width: 150, 
      render: (text, record) =>
        editingKey === record._id ? (
          <Input 
            value={editedInvoice.customer.email} 
            onChange={(e) => handleChange("customer", { ...editedInvoice.customer, email: e.target.value })} 
          />
        ) : (
          text || "N/A"
        ),
    },
    {
      title: "Payment Type",
      dataIndex: "paymentType",
      key: "paymentType", width: 80,
      render: (text, record) =>
        editingKey === record._id ? (
          <Select
            value={editedInvoice.paymentType}
            onChange={(value) => handleChange("paymentType", value)}
            style={{ width: '100%' }}
          >
            <Option value="Cash">Cash</Option>
            <Option value="Card">Card</Option>
            <Option value="Online">Online</Option>
          </Select>
        ) : (
          text || "N/A"
        ),
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      key: "subtotal",width: 80,
      render: (text, record) => editingKey === record._id ? (
        <span className="font-medium">₹{editedInvoice.subtotal?.toFixed(2)}</span>
      ) : (
        <span className="font-medium">₹{text?.toFixed(2)}</span>
      )
    },
    {
      title: "Discount",
      dataIndex: "totalDiscount",
      key: "totalDiscount",width: 70,
      render: (text, record) => editingKey === record._id ? (
        <span className="font-medium">₹{editedInvoice.totalDiscount?.toFixed(2)}</span>
      ) : (
        <span className="font-medium">₹{text?.toFixed(2)}</span>
      )
    },
    {
      title: "GST",
      dataIndex: "gstTotal",
      key: "gstTotal",width: 70,
      render: (text, record) => editingKey === record._id ? (
        <span className="font-medium">₹{editedInvoice.gstTotal?.toFixed(2)}</span>
      ) : (
        <span className="font-medium">₹{text?.toFixed(2)}</span>
      )
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",width: 80,
      render: (text, record) => editingKey === record._id ? (
        <span className="font-medium">₹{editedInvoice.totalAmount?.toFixed(2)}</span>
      ) : (
        <span className="font-medium">₹{text?.toFixed(2)}</span>
      )
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, invoice) => (
        <div className="flex gap-2">
          {editingKey === invoice._id ? (
            <>
              <Button type="primary" icon={<CheckOutlined />} onClick={handleSave} />
              <Button danger icon={<CloseOutlined />} onClick={handleCancel} />
            </>
          ) : (
            <>
              <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(invoice)} />
              <Popconfirm 
                title="Are you sure to delete this invoice?" 
                onConfirm={() => handleDelete(invoice._id)} 
                okText="Yes" 
                cancelText="No"
              >
                <Button danger icon={<DeleteOutlined />} />
              </Popconfirm>
              <Button type="default" icon={<PrinterOutlined />} onClick={() => handlePrint(invoice)} />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="invoice-management-container"> {/* Add this wrapper */}
    <div className="p-4 invoice-header">
      <h2 className="invoice-title text-xl font-semibold mb-4">Manage Invoices</h2>
      <div className="invoice-controls flex justify-between mb-4">
        <Input 
          placeholder="Search by customer, invoice or contact" 
          prefix={<SearchOutlined />} 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="search-input"
          allowClear
        />
        <div className="flex items-center gap-2">
          <span>Show:</span>
          <Select 
            value={limit} 
            onChange={(value) => setLimit(value)}
            style={{ width: 80 }}
          >
            <Option value={10}>10</Option>
            <Option value={25}>25</Option>
            <Option value={50}>50</Option>
            <Option value={100}>100</Option>
          </Select>
          <span>entries</span>
        </div>
      </div>
      <Table 
        className="compact-table"
        columns={columns} 
        dataSource={invoices} 
        rowKey="_id" 
        loading={loading} 
        pagination={false}
        expandable={{
          expandedRowRender,
          rowExpandable: (record) => record.items && record.items.length > 0,
          defaultExpandAllRows: false,
          expandRowByClick: true,
        }}
        size="small"
        scroll={{ x: 1200 }} // Set based on your total column widths
        bordered
        />
    
      <div className="flex justify-between mt-4">
        <div>
          Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, invoices.length)} of {invoices.length} entries
        </div>
        <Pagination 
          current={page} 
          total={invoices.length} 
          pageSize={limit} 
          onChange={(p) => setPage(p)} 
          showSizeChanger={false}
        />
      </div>
    </div>
    </div>
  );
};

export default ManageInvoice;