// controllers/stockController.js
import Stock from '../models/stockModel.js';

export const addStockFromPurchase = async (req, res) => {
  try {
    const { products, supplierName } = req.body;
    const newStockItems = [];

    for (const product of products) {
      const existingStock = await Stock.findOne({
        productName: product.productName,
        batchId: product.batchId
      });

      if (existingStock) {
        existingStock.quantity += Number(product.quantity);
        await existingStock.save();
        newStockItems.push(existingStock);
      } else {
        const newStock = new Stock({
          ...product,
          supplierName,
          quantity: Number(product.quantity),
          rate: Number(product.rate),
          gst: Number(product.gst),
          mrp: Number(product.mrp)
        });
        await newStock.save();
        newStockItems.push(newStock);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Stock added successfully',
      data: newStockItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add stock',
      error: error.message
    });
  }
};

export const getAllStock = async (req, res) => {
  try {
    const stock = await Stock.find();
    res.status(200).json({
      success: true,
      data: stock
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock',
      error: error.message
    });
  }
};

export const updateStock = async (req, res) => {
  try {
    const updatedStock = await Stock.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedStock) {
      return res.status(404).json({
        success: false,
        message: 'Stock item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: updatedStock
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message
    });
  }
};

export const deleteStock = async (req, res) => {
  try {
    const deletedStock = await Stock.findByIdAndDelete(req.params.id);

    if (!deletedStock) {
      return res.status(404).json({
        success: false,
        message: 'Stock item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Stock deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete stock',
      error: error.message
    });
  }
};