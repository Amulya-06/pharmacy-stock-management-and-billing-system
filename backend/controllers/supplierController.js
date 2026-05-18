import Supplier from "../models/supplierModel.js";
import axios from "axios";

// ✅ Add a new supplier
export const addSupplier = async (req, res) => {
  try {
    const { supplier_name, contact_number, email, organisation } = req.body;

    // Check if all fields are provided
    if (!supplier_name || !contact_number || !email || !organisation) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if supplier with this contact number already exists
    const existingSupplier = await Supplier.findOne({ contact_number });
    if (existingSupplier) {
      return res.status(409).json({ 
        error: "Supplier with this contact number already exists." 
      });
    }

    // Create a new supplier
    const newSupplier = new Supplier({
      supplier_name,
      contact_number,
      email,
      organisation,
    });

    // Save to database
    await newSupplier.save();

    res.status(201).json({ 
      message: "Supplier added successfully!",
      supplier: newSupplier 
    });
  } catch (error) {
    console.error("Error adding supplier:", error);
    res.status(500).json({
      error: "Failed to add supplier.",
      details: error.message,
    });
  }
};

// ✅ Get all suppliers (with search functionality)
export const getSuppliers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    let searchFields = [];

    if (search) {
      // Check if search term is a phone number (digits only)
      if (/^\d+$/.test(search)) {
        // Search by contact number (exact match or partial)
        query = {
          $or: [
            { contact_number: { $regex: search, $options: "i" } },
            { contact_number: { $eq: search } }
          ]
        };
        searchFields.push('contact number');
      } else {
        // Search by supplier name (prefix match)
        query = {
          supplier_name: { $regex: `^${search}`, $options: "i" }
        };
        searchFields.push('supplier name');
      }
    }

    const suppliers = await Supplier.find(query)
      .select('supplier_name contact_number email organisation') // Only return these fields
      .sort({ supplier_name: 1 }) // Sort alphabetically
      .limit(20); // Limit results for performance

    // If no results and search was by contact number, try name search as fallback
    if (suppliers.length === 0 && search && /^\d+$/.test(search)) {
      const fallbackResults = await Supplier.find({
        supplier_name: { $regex: search, $options: "i" }
      })
      .select('supplier_name contact_number email organisation')
      .sort({ supplier_name: 1 })
      .limit(20);

      if (fallbackResults.length > 0) {
        return res.json(fallbackResults);
      }
    }

    res.json(suppliers);

  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({ 
      error: "Failed to fetch suppliers.",
      details: error.message 
    });
  }
};

// ✅ Delete a supplier by ID
export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSupplier = await Supplier.findByIdAndDelete(id);
    if (!deletedSupplier) {
      return res.status(404).json({ error: "Supplier not found." });
    }

    res.status(200).json({ message: "Supplier deleted successfully!" });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    res.status(500).json({ error: "Failed to delete supplier." });
  }
};

// ✅ Update supplier details
export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplier_name, contact_number, email, organisation } = req.body;

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      id,
      { supplier_name, contact_number, email, organisation },
      { new: true }
    );

    if (!updatedSupplier) {
      return res.status(404).json({ error: "Supplier not found." });
    }

    res.status(200).json(updatedSupplier);
  } catch (error) {
    console.error("Error updating supplier:", error);
    res.status(500).json({ error: "Failed to update supplier." });
  }
};

// ✅ Fetch supplier suggestions dynamically
export const fetchSupplierSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.json([]);
    }

    const suppliers = await Supplier.find({
      supplier_name: { $regex: `^${query}`, $options: "i" },
    }).sort({ supplier_name: 1 });

    res.json(suppliers);
  } catch (error) {
    console.error("Error fetching supplier suggestions:", error);
    res.status(500).json({ error: "Failed to fetch supplier suggestions." });
  }
};

// ✅ Handle supplier input change (For frontend use)
export const handleSupplierChange = async (e, setSupplierName, setShowSuggestions, setSuggestions) => {
  const query = e.target.value;
  setSupplierName(query);
  setShowSuggestions(true);

  try {
    const response = await axios.get(`http://localhost:5000/api/suppliers?search=${query}`);
    setSuggestions(response.data); // Update suggestions list
  } catch (error) {
    console.error("Error fetching supplier suggestions:", error);
  }
};
