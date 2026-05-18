import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  supplierName: { type: String, required: true },
  invoiceNumber: { type: String, required: true },
  date: { type: Date, default: Date.now },
  paymentType: {
    type: String,
    enum: ['Cash Payment', 'UPI', 'Net Banking', 'Cards', 'Payment Due'],
    required: true
  },
  products: [{
    productName: { type: String, required: true },  // Changed from medicineName to productName
    genericName: { type: String, required: true },  // Kept genericName as requested
    batchId: { type: String, required: true },
    category: {  
      type: String,  
      enum: ['Tablets', 'Capsules', 'Syrups', 'Injections', 'Creams', 'Ointments', 'Essentials'], 
      required: true 
    },  // Kept original medicine categories as requested
    mrp: { type: Number, required: true },
    packing: { type: String, required: true },
    quantity: { type: Number, required: true },
    rate: { type: Number, required: true },
    gst: { type: Number, required: true }, // GST percentage
    amount: { type: Number, required: true },  // rate * quantity
    expiryDate: { type: Date, required: true }
  }],
  grandTotal: { type: Number, required: true }
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

export default Purchase;