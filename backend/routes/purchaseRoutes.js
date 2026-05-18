import express from 'express';
import { 
  addPurchase, 
  getAllPurchases, 
  updatePurchase, 
  deletePurchase,
  getPurchaseReport  // Make sure this is imported
} from '../controllers/purchaseController.js';

const router = express.Router();

// All purchases routes will be prefixed with /api/purchases
router.post('/add', addPurchase);
router.get('/', getAllPurchases);
router.get('/report', getPurchaseReport);  // This is the report endpoint
router.put('/:id', updatePurchase);
router.delete('/:id', deletePurchase);

export default router;