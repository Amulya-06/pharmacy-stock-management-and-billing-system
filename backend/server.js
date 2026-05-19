import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import productRoutes from './routes/productRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import salesRoutes from './routes/salesRoutes.js';



import connectDB from './config/db.js';

dotenv.config();
connectDB(); // Connect to MongoDB using your config

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3001", "https://pharmacy-stock-management-and-billing.onrender.com"] }));
app.use(express.json());
app.use(bodyParser.json());

// Example Auth Route
app.use('/api/auth', authRoutes);

// Add all other routes
// app.use('/api', customerRoutes);

app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api', supplierRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/stocks', stockRoutes);

// Add our new user routes
// Ensure correct user routes registration
app.use('/api/users', userRoutes);
app.use('/api/admins', adminRoutes);  // ✅ FIX: Now it's explicitly under `/api/users`
app.use('/api/sales', salesRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
