// routes/stockRoutes.js
import express from 'express';
import {
  addStockFromPurchase,
  getAllStock,
  updateStock,
  deleteStock
} from '../controllers/stockController.js';

const router = express.Router();

// Stock management routes
router.post('/add-stock', addStockFromPurchase);
router.get('/', getAllStock);
router.put('/:id', updateStock);
router.delete('/:id', deleteStock);

export default router;