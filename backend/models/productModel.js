import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  genericName: { type: String, required: true },
  category: { type: String, required: true },
  purpose: { type: String, required: true },
  gst: { type: Number, required: true, default: 0 } // Added GST field
});

const Product = mongoose.model("Product", productSchema);

export default Product;