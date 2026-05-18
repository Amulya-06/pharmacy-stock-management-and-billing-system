import mongoose from 'mongoose';

const salesItemSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  batchId: { type: String, required: true },
  mrp: { type: Number, required: true },
  gst: { type: Number, required: true },
  packing: { type: String, required: true },
  quantity: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  supplierName: { type: String }, // Made optional
  genericName: { type: String }, // Made optional
  category: { type: String }, // Made optional
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
}, { _id: false });

const salesSchema = new mongoose.Schema({
  invoiceNumber: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => `INV-${Math.floor(100000 + Math.random() * 900000)}`
  },
  date: { 
    type: Date, 
    required: true, 
    default: Date.now 
  },
  customer: {
    name: { type: String, required: true },
    contact: { type: String, required: true },
    email: { type: String },
  },
  items: [salesItemSchema],
  subtotal: { type: Number, required: true },
  totalDiscount: { type: Number, required: true, default: 0 },
  gstTotal: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  pointsEarned: { type: Number, default: 0 },
  pointsRedeemed: { type: Number, default: 0 },
  finalAmountAfterDiscount: { type: Number, required: true },
  paymentType: {
    type: String,
    required: true,
    enum: ['Cash', 'Card', 'Online'],
    default: 'Cash'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better performance
salesSchema.index({ invoiceNumber: 1 });
salesSchema.index({ 'customer.contact': 1 });
salesSchema.index({ date: 1 });

const Sales = mongoose.model('Sales', salesSchema);

export default Sales;