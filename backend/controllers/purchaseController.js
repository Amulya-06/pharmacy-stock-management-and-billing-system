import Stock from '../models/stockModel.js';
import Purchase from '../models/purchaseModel.js';

// Add a new purchase and update stock
export const addPurchase = async (req, res) => {
  try {
    const { supplierName, invoiceNumber, paymentType, products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Products field must be a non-empty array' });
    }

    const productsWithGst = products.map(product => {
      product.quantity = Number(product.quantity);
      product.rate = Number(product.rate);
      product.gst = Number(product.gst) || 0; // Default to 0 if not provided
      const baseAmount = product.rate * product.quantity;
      const gstAmount = baseAmount * (product.gst / 100);
      product.amount = baseAmount + gstAmount;
      return product;
    });

    const grandTotal = productsWithGst.reduce((total, product) => total + product.amount, 0);

    // Create and save purchase entry
    const newPurchase = new Purchase({
      supplierName,
      invoiceNumber,
      paymentType,
      products: productsWithGst, // Save the products array with GST and calculated amounts
      grandTotal,
    });

    await newPurchase.save();

    // Update or add stock
    for (const product of productsWithGst) {
      const { 
        productName, 
        batchId, 
        mrp, 
        rate, 
        packing, 
        quantity, 
        expiryDate, 
        genericName, 
        category, 
        gst 
      } = product;

      let stockItem = await Stock.findOne({
        productName,
        batchId,
        rate: Number(rate),
      });

      if (stockItem) {
        stockItem.quantity += quantity;
      } else {
        stockItem = new Stock({
          productName,
          genericName,
          category,
          batchId,
          mrp,
          rate: Number(rate),
          packing,
          quantity,
          expiryDate,
          supplierName,
          gst, // Add GST to stock item
        });
      }

      await stockItem.save();
    }

    res.status(201).json({ message: 'Purchase added and stock updated successfully!', data: newPurchase });
  } catch (error) {
    res.status(500).json({ message: 'Error processing purchase', error: error.message });
  }
};

// Update an existing purchase
export const updatePurchase = async (req, res) => {
  const { id } = req.params;
  const { supplierName, invoiceNumber, paymentType, products } = req.body;

  try {
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Products field must be a non-empty array' });
    }

    const productsWithGst = products.map(product => {
      product.quantity = Number(product.quantity);
      product.rate = Number(product.rate);
      product.gst = Number(product.gst) || 0;
      const baseAmount = product.rate * product.quantity;
      const gstAmount = baseAmount * (product.gst / 100);
      product.amount = baseAmount + gstAmount;
      return product;
    });

    const grandTotal = productsWithGst.reduce((total, product) => total + product.amount, 0);

    const updatedPurchase = await Purchase.findByIdAndUpdate(
      id,
      { 
        supplierName, 
        invoiceNumber, 
        paymentType, 
        products: productsWithGst,
        grandTotal 
      },
      { new: true }
    );

    res.status(200).json({ 
      message: 'Purchase updated successfully', 
      data: updatedPurchase 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating purchase', 
      error: error.message 
    });
  }
};

// Get all purchases
export const getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find();
    res.status(200).json({ data: purchases });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching purchases', error: error.message });
  }
};

// Delete a purchase
export const deletePurchase = async (req, res) => {
  const { id } = req.params;

  try {
    await Purchase.findByIdAndDelete(id);
    res.status(200).json({ message: 'Purchase deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting purchase', error: error.message });
  }
};

// Get purchase report with date range
export const getPurchaseReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate inputs
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false,
        message: 'Both start and end dates are required' 
      });
    }

    // Create dates at start and end of day in UTC
    const start = new Date(startDate);
    start.setUTCHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999);

    // Get purchases in date range
    const purchases = await Purchase.find({
      date: {
        $gte: start,
        $lte: end
      }
    }).sort({ date: 1 });

    const totalAmount = purchases.reduce(
      (sum, purchase) => sum + (purchase.grandTotal || 0), 0
    );

    res.status(200).json({ 
      success: true,
      purchases, 
      totalAmount 
    });

  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};