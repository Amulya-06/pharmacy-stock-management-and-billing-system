import express from 'express';
import { searchCustomers, addCustomer, getCustomers, deleteCustomer, updateCustomer } from '../controllers/customerController.js'; // Make sure this is correct

const router = express.Router();

// Define your routes
router.get("/search", searchCustomers);  // This is where the search is handled
router.post("/add", addCustomer);
router.get("/", getCustomers);
router.delete("/:id", deleteCustomer);
router.put("/:id", updateCustomer);

export default router;
