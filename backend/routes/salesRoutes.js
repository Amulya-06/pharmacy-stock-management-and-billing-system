import express from 'express';
import { 
  createSale,
  getAllSales,
  getSaleById,
  updateSale,
  deleteSale,
  searchProductSuggestions,
  generateSalesReport
} from '../controllers/salesController.js';

const router = express.Router();

// CRUD Operations
router.post('/', createSale);
router.get('/', getAllSales);
router.get('/:id', getSaleById);
router.put('/:id', updateSale);
router.delete('/:id', deleteSale);

// Search & Reports
router.get('/search/products', searchProductSuggestions);
router.get('/reports/sales', generateSalesReport);

export default router;