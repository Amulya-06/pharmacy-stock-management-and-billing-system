import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerContact: { type: String, required: true, unique: true },
  email: { type: String, default: "" },
  loyaltyPoints: { type: Number, default: 0 },
  totalPurchases: { type: Number, default: 0 }
}, { timestamps: true });

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;