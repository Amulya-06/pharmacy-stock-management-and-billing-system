import express from "express";
import {
  addSupplier,
  getSuppliers,
  deleteSupplier,
  updateSupplier,
} from "../controllers/supplierController.js";

const router = express.Router();

router.post("/suppliers", addSupplier); // Add a new supplier
router.get("/suppliers", getSuppliers); // Get all suppliers
router.put("/suppliers/:id", updateSupplier); // Update a supplier
router.delete("/suppliers/:id", deleteSupplier); // Delete a supplier
// Make sure you're passing the search query as search in the URL
router.get("/suppliers/suggestions", getSuppliers); // Fetch suppliers based on search query

export default router;