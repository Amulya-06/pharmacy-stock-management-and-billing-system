import mongoose from 'mongoose';
import Sales from '../models/Sales.js';
import Stock from '../models/stockModel.js';
import Customer from '../models/customerModel.js';

// Create new sale with transaction support
export const createSale = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const { customer, items, paymentType = 'Cash', totalDiscount = 0, redeemPoints = 0 } = req.body;
  
      // Validate required fields
      if (!customer || !customer.name || !customer.contact) {
        throw new Error('Customer name and contact are required');
      }
  
      if (!items || items.length === 0) {
        throw new Error('At least one sale item is required');
      }
  
      // Process items and calculate totals
      let subtotal = 0;
      let gstTotal =  0;
      const processedItems = [];
      const stockUpdates = [];
  
      for (const item of items) {
        // Validate item fields
        if (!item.productName || !item.batchId || !item.quantity || !item.mrp) {
          throw new Error('Product name, batch ID, quantity and MRP are required');
        }
  
        // Convert and validate numeric values
        const quantity = Number(item.quantity);
        const mrp = Number(item.mrp);
        const gst = Number(item.gst || 0);
        const discount = Number(item.discount || 0);
  
        if (isNaN(quantity) || quantity <= 0) throw new Error('Invalid quantity');
        if (isNaN(mrp) || mrp <= 0) throw new Error('Invalid MRP');
        if (isNaN(gst) || gst < 0) throw new Error('Invalid GST');
        if (isNaN(discount) || discount < 0) throw new Error('Invalid discount');
  
        // Get all batches for this product, sorted by expiry (FEFO)
        const productBatches = await Stock.find({ 
          productName: item.productName,
          quantity: { $gt: 0 }
        })
          .sort({ expiryDate: 1 }) // Sort by nearest expiry first
          .session(session);
  
        if (!productBatches.length) {
          throw new Error(`Product ${item.productName} not found in stock`);
        }
  
        // Find the specific batch being sold
        const stockItem = productBatches.find(b => b.batchId === item.batchId);
        if (!stockItem) {
          throw new Error(`Batch ${item.batchId} not available for ${item.productName}`);
        }
  
        if (stockItem.quantity < quantity) {
          throw new Error(`Only ${stockItem.quantity} available for ${item.productName} (Batch: ${item.batchId})`);
        }
  
        // Calculate item totals
        const priceAfterDiscount = mrp - discount;
        const totalAfterDiscount = priceAfterDiscount * quantity;
        const itemGst = totalAfterDiscount * (gst / 100);
        const itemTotal = totalAfterDiscount + itemGst;
  
        subtotal += mrp * quantity;
        gstTotal += itemGst;
  
        // Prepare stock update
        stockUpdates.push({
          updateOne: {
            filter: { 
              productName: item.productName,
              batchId: item.batchId 
            },
            update: { $inc: { quantity: -quantity } }
          }
        });
  
        // Prepare sale item
        processedItems.push({
          productName: item.productName,
          batchId: item.batchId,
          packing: stockItem.packing,
          quantity,
          mrp,
          gst,
          discount,
          expiryDate: stockItem.expiryDate,
          total: itemTotal
        });
      }
  
      // Validate discount
      if (totalDiscount > subtotal) {
        throw new Error('Total discount cannot exceed subtotal');
      }
  
      // Calculate final totals
      const totalAmount = subtotal - totalDiscount + gstTotal;
  
      // Fetch or create customer for loyalty points
      let customerRecord = await Customer.findOne({ customerContact: customer.contact }).session(session);
      if (!customerRecord) {
        customerRecord = new Customer({
          customerName: customer.name,
          customerContact: customer.contact,
          email: customer.email || ""
        });
        await customerRecord.save({ session });
      }

      // Validate redemption
      const parsedRedeemPoints = Number(redeemPoints) || 0;
      if (parsedRedeemPoints > 0) {
        if (parsedRedeemPoints % 50 !== 0) {
          throw new Error('Points must be redeemed in multiples of 50');
        }
        if (customerRecord.loyaltyPoints < parsedRedeemPoints) {
          throw new Error('Insufficient loyalty points');
        }
      }

      const loyaltyDiscount = parsedRedeemPoints; // 1 point = ₹1
      const finalAmountAfterDiscount = totalAmount - loyaltyDiscount;

      if (finalAmountAfterDiscount < 0) {
        throw new Error('Redemption discount cannot exceed total amount');
      }

      const pointsEarned = Math.floor(finalAmountAfterDiscount / 100);

      // Create sale record
      const sale = new Sales({
        customer: {
          name: customer.name,
          contact: customer.contact,
          ...(customer.email && { email: customer.email })
        },
        items: processedItems,
        paymentType,
        subtotal: parseFloat(subtotal.toFixed(2)),
        totalDiscount: parseFloat(totalDiscount.toFixed(2)),
        gstTotal: parseFloat(gstTotal.toFixed(2)),
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        pointsEarned,
        pointsRedeemed: parsedRedeemPoints,
        finalAmountAfterDiscount: parseFloat(finalAmountAfterDiscount.toFixed(2))
      });
  
      // Execute all operations in transaction
      await sale.save({ session });

      // Update customer points and purchases
      await Customer.updateOne(
        { _id: customerRecord._id },
        { 
          $inc: { 
            loyaltyPoints: pointsEarned - parsedRedeemPoints,
            totalPurchases: finalAmountAfterDiscount
          } 
        },
        { session }
      );

      if (stockUpdates.length > 0) {
        await Stock.bulkWrite(stockUpdates, { session });
      }
      await session.commitTransaction();
  
      res.status(201).json({
        success: true,
        data: sale,
        message: 'Sale completed successfully'
      });
  
    } catch (error) {
      await session.abortTransaction();
      console.error('Sale creation error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to process sale'
      });
    } finally {
      session.endSession();
    }
};
// Get all sales with pagination
export const getAllSales = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.contact': { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const sales = await Sales.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const count = await Sales.countDocuments(query);

    res.json({
      success: true,
      data: sales,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales'
    });
  }
};

// Get sale details by ID
export const getSaleById = async (req, res) => {
  try {
    const sale = await Sales.findById(req.params.id).lean();
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }
    res.json({
      success: true,
      data: sale
    });
  } catch (error) {
    console.error('Error fetching sale:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sale details'
    });
  }
};

// Update sale
export const updateSale = async (req, res) => {
  try {
    const updatedSale = await Sales.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedSale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }
    res.json({ success: true, data: updatedSale });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete sale
export const deleteSale = async (req, res) => {
  try {
    const deletedSale = await Sales.findByIdAndDelete(req.params.id);
    if (!deletedSale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Search product suggestions
export const searchProductSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim().length < 2) {
      return res.json([]);
    }

    const suggestions = await Stock.aggregate([
      {
        $match: {
          $and: [
            { quantity: { $gt: 0 } },
            {
              $or: [
                { productName: { $regex: query, $options: 'i' } },
                { batchId: { $regex: query, $options: 'i' } }
              ]
            }
          ]
        }
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          label: { $concat: ['$productName', ' - ', '$packing', ' (Batch: ', '$batchId', ')'] },
          productName: 1,
          packing: 1,
          batchId: 1,
          mrp: 1,
          rate: 1,
          gst: 1,
          quantity: 1,
          expiryDate: 1
        }
      },
      { $limit: 10 }
    ]);

    res.json(suggestions);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suggestions'
    });
  }
};

// Generate sales report
export const generateSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }

    const dateFormat = {
      day: '%Y-%m-%d',
      month: '%Y-%m',
      year: '%Y'
    }[groupBy] || '%Y-%m-%d';

    const report = await Sales.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: dateFormat,
              date: '$date'
            }
          },
          totalSales: { $sum: '$totalAmount' },
          totalItems: { $sum: { $size: '$items' } },
          totalDiscount: { $sum: '$totalDiscount' },
          totalGST: { $sum: '$gstTotal' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          date: '$_id',
          totalSales: 1,
          totalItems: 1,
          totalDiscount: 1,
          totalGST: 1,
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: report,
      parameters: {
        startDate,
        endDate,
        groupBy
      }
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate report'
    });
  }
};
// Replace all the individual exports at the bottom of your file with:
export default {
    createSale,
    getAllSales,
    getSaleById,
    updateSale,
    deleteSale,
    searchProductSuggestions,
    generateSalesReport
  };