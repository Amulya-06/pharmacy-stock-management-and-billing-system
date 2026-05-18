import Purchase from '../models/Purchase.js';
import Stock from '../models/Stock.js';

const updateStockFromPurchases = async () => {
  try {
    const purchases = await Purchase.find({}); // Fetch all purchases

    for (const purchase of purchases) {
      for (const medicine of purchase.medicines) {
        const existingStock = await Stock.findOne({ batchId: medicine.batchId });

        if (existingStock) {
          // If medicine already exists in stock, update quantity
          existingStock.quantity += medicine.quantity;
          await existingStock.save();
        } else {
          // Insert new medicine into stock
          await Stock.create({
            medicineName: medicine.medicineName,
            batchId: medicine.batchId,
            mrp: medicine.mrp,
            rate: medicine.rate,
            packing: medicine.packing,
            quantity: medicine.quantity,
            expiryDate: medicine.expiryDate,
            supplierName: purchase.supplierName, // Fetching supplier name from purchase
          });
        }
      }
    }

    console.log('Stock updated successfully!');
  } catch (error) {
    console.error('Error updating stock:', error);
  }
};

export default updateStockFromPurchases;
