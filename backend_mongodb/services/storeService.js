/**
 * Store Service
 * Business logic for store operations with Transaction Support
 */

import mongoose from 'mongoose';
import Stores from '../schema/store/index.js';
import logger from '../utils/logger.js';

/**
 * Find store by email
 * @param {string} email - Store email
 * @returns {Promise<Object|null>} Store document or null
 */
export async function findStoreByEmail(email) {
  const normalizedEmail = email?.toLowerCase()?.trim();
  return await Stores.findOne({ storeEmail: normalizedEmail });
}

/**
 * Get store data (public info only)
 * @param {string} email - Store email
 * @returns {Promise<Object>} Store public data
 */
export async function getStorePublicData(email) {
  const store = await findStoreByEmail(email);
  if (!store) {
    throw new Error('STORE_NOT_FOUND');
  }
  return store.toJSON();
}

/**
 * Query stock by search term
 * @param {string} email - Store email
 * @param {string} query - Search query
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Stock items with pagination
 */
export async function queryStock(email, query = '', options = {}) {
  const { page = 1, limit = 50 } = options;
  
  const store = await findStoreByEmail(email);
  if (!store) {
    throw new Error('STORE_NOT_FOUND');
  }

  let filteredStock = store.stock;
  
  if (query && query.trim() !== '') {
    const searchTerm = query.toLowerCase().trim();
    filteredStock = store.stock.filter(med => {
      const name = med.medData?.name?.toLowerCase() || '';
      const secName = med.medData?.secName?.toLowerCase() || '';
      const medID = med.medData?.medID?.toLowerCase() || '';
      
      return name.includes(searchTerm) || 
             secName.includes(searchTerm) || 
             medID.includes(searchTerm);
    });
  }

  // Apply pagination
  const total = filteredStock.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedStock = filteredStock.slice(startIndex, endIndex);

  return {
    items: paginatedStock,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: endIndex < total,
    },
  };
}

/**
 * Add medicine to stock
 * @param {string} email - Store email
 * @param {Object} medicineData - Medicine data
 * @param {number} quantity - Quantity to add
 * @returns {Promise<Object>} Updated stock item
 */
export async function addToStock(email, medicineData, quantity) {
  const store = await findStoreByEmail(email);
  if (!store) {
    throw new Error('STORE_NOT_FOUND');
  }

  const { 
    medID, name, secName, sellingType, medType, pricePerTab, cardPerBox, pricePerBox,
    expiryDate, batchNumber, purchasePrice // NEW fields
  } = medicineData;
  const quantityNum = parseInt(quantity, 10);

  if (isNaN(quantityNum) || quantityNum < 1) {
    throw new Error('INVALID_QUANTITY');
  }

  // Check if medicine already exists in stock (with same batch if provided)
  let existingIndex = -1;
  if (batchNumber) {
    // If batch number provided, match by medID AND batch
    existingIndex = store.stock.findIndex(med => 
      med.medData?.medID === medID && med.batchNumber === batchNumber
    );
  } else {
    // Legacy: just match by medID
    existingIndex = store.stock.findIndex(med => med.medData?.medID === medID);
  }

  if (existingIndex >= 0) {
    // Update existing stock quantity
    store.stock[existingIndex].quantity += quantityNum;
    // Update expiry if provided and newer
    if (expiryDate) {
      store.stock[existingIndex].expiryDate = new Date(expiryDate);
    }
    logger.info('Stock quantity updated', { medID, addedQuantity: quantityNum, newQuantity: store.stock[existingIndex].quantity });
  } else {
    // Add new medicine to stock
    const price = parseFloat(pricePerTab) || parseFloat(pricePerBox) || 0;
    
    store.stock.push({
      medData: {
        medID,
        name,
        secName: secName || '',
        sellingType: sellingType || '',
        medType: medType || '',
        pricePerTab: price,
        cardPerBox: parseInt(cardPerBox, 10) || 0,
      },
      quantity: quantityNum,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      batchNumber: batchNumber || '',
      purchasePrice: parseFloat(purchasePrice) || 0,
    });
    logger.info('New medicine added to stock', { medID, quantity: quantityNum, batchNumber });
  }

  await store.save();
  
  return {
    medID,
    name,
    quantity: existingIndex >= 0 ? store.stock[existingIndex].quantity : quantityNum,
    action: existingIndex >= 0 ? 'updated' : 'added',
  };
}

/**
 * Remove medicine from stock
 * @param {string} email - Store email
 * @param {string} medID - Medicine ID
 * @param {number} quantity - Quantity to remove
 * @returns {Promise<Object>} Updated stock info
 */
export async function removeFromStock(email, medID, quantity) {
  const store = await findStoreByEmail(email);
  if (!store) {
    throw new Error('STORE_NOT_FOUND');
  }

  const quantityNum = parseInt(quantity, 10);
  if (isNaN(quantityNum) || quantityNum < 1) {
    throw new Error('INVALID_QUANTITY');
  }

  const existingIndex = store.stock.findIndex(med => med.medData?.medID === medID);
  
  if (existingIndex < 0) {
    throw new Error('MEDICINE_NOT_FOUND');
  }

  const currentQuantity = store.stock[existingIndex].quantity;
  
  if (quantityNum > currentQuantity) {
    throw new Error('INSUFFICIENT_STOCK');
  }

  const newQuantity = currentQuantity - quantityNum;
  
  if (newQuantity === 0) {
    // Remove item entirely
    store.stock.splice(existingIndex, 1);
    logger.info('Medicine removed from stock', { medID, removedQuantity: quantityNum });
  } else {
    store.stock[existingIndex].quantity = newQuantity;
    logger.info('Stock quantity reduced', { medID, removedQuantity: quantityNum, remainingQuantity: newQuantity });
  }

  await store.save();

  return {
    medID,
    removedQuantity: quantityNum,
    remainingQuantity: newQuantity,
    removed: newQuantity === 0,
  };
}

/**
 * Update an existing stock item
 * @param {string} email - Store email
 * @param {string} medID - Medicine ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated stock item
 */
export async function updateStockItem(email, medID, updates) {
  const store = await findStoreByEmail(email);
  if (!store) {
    throw new Error('STORE_NOT_FOUND');
  }

  const existingIndex = store.stock.findIndex(med => med.medData?.medID === medID);
  
  if (existingIndex < 0) {
    throw new Error('MEDICINE_NOT_FOUND');
  }

  const stockItem = store.stock[existingIndex];
  
  // Update allowed fields
  if (updates.pricePerTab !== undefined) {
    stockItem.medData.pricePerTab = parseFloat(updates.pricePerTab);
  }
  if (updates.quantity !== undefined) {
    stockItem.quantity = parseInt(updates.quantity, 10);
  }
  if (updates.expiryDate !== undefined) {
    stockItem.expiryDate = updates.expiryDate ? new Date(updates.expiryDate) : null;
  }
  if (updates.batchNumber !== undefined) {
    stockItem.batchNumber = updates.batchNumber;
  }
  if (updates.cardPerBox !== undefined) {
    stockItem.medData.cardPerBox = parseInt(updates.cardPerBox, 10);
  }
  if (updates.name !== undefined) {
    stockItem.medData.name = updates.name;
  }
  if (updates.isDiscontinued !== undefined) {
    stockItem.isDiscontinued = updates.isDiscontinued;
  }

  await store.save();
  
  logger.info('Stock item updated', { medID, updates: Object.keys(updates) });
  
  return {
    medID,
    updated: true,
    item: stockItem,
  };
}

/**
 * Create a billing record and update stock
 * Uses ACID transactions for data integrity
 * @param {string} email - Store email
 * @param {Object} billingData - Billing information
 * @returns {Promise<Object>} Created billing record
 */
export async function createBilling(email, billingData) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const store = await Stores.findOne({ storeEmail: email?.toLowerCase() }).session(session);
    
    if (!store) {
      throw new Error('STORE_NOT_FOUND');
    }

    const { customerName, customerAge, phone, products, totalAmount } = billingData;

    // Validate and Deduct Stock
    for (const product of products) {
      const medIdToFind = product.medData?.medID;
      const quantityToDeduct = product.quantity;

      const stockIndex = store.stock.findIndex(med => med.medData?.medID === medIdToFind);
      
      if (stockIndex === -1) {
        throw new Error(`MEDICINE_NOT_FOUND:${medIdToFind}`);
      }
      
      if (store.stock[stockIndex].quantity < quantityToDeduct) {
        throw new Error(`INSUFFICIENT_STOCK:${medIdToFind}`);
      }

      store.stock[stockIndex].quantity -= quantityToDeduct;

      // Clean up 0 quantity items
      if (store.stock[stockIndex].quantity <= 0) {
        store.stock.splice(stockIndex, 1);
      }
    }

    // Create billing record
    const billing = {
      storeId: store._id,
      customerName,
      customerAge: parseInt(customerAge, 10),
      phone,
      productList: products,
      totalAmount: parseFloat(totalAmount),
      createdAt: new Date(), // Explicitly set date for consistency in transaction
    };

    store.billingHistory.push(billing);

    await store.save({ session });
    await session.commitTransaction();
    
    logger.info('Billing created successfully with transaction', { 
      customerName, 
      productCount: products.length, 
      totalAmount 
    });

    return {
      billingId: store.billingHistory[store.billingHistory.length - 1]._id,
      customerName,
      totalAmount,
      productCount: products.length,
    };

  } catch (error) {
    await session.abortTransaction();
    logger.error('Billing transaction aborted', { error: error.message });
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Search billing history
 * @param {string} email - Store email
 * @param {string} query - Search query
 * @param {string} searchBy - Field to search (name, phone, medicine)
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Bills with pagination
 */
export async function searchBillingHistory(email, query = '', searchBy = 'name', options = {}) {
  const { page = 1, limit = 20 } = options;
  
  const store = await findStoreByEmail(email);
  if (!store) {
    throw new Error('STORE_NOT_FOUND');
  }

  let filteredBills = store.billingHistory;

  if (query && query.trim() !== '') {
    const searchTerm = query.toLowerCase().trim();
    
    switch (searchBy) {
      case 'phone':
        filteredBills = store.billingHistory.filter(bill => 
          String(bill.phone).includes(searchTerm)
        );
        break;
      case 'medicine':
        filteredBills = store.billingHistory.filter(bill =>
          bill.productList.some(product => 
            product.medData?.medID?.toLowerCase().includes(searchTerm) ||
            product.medData?.name?.toLowerCase().includes(searchTerm)
          )
        );
        break;
      case 'name':
      default:
        filteredBills = store.billingHistory.filter(bill =>
          bill.customerName?.toLowerCase().includes(searchTerm)
        );
    }
  }

  // Sort by date (newest first)
  filteredBills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Apply pagination
  const total = filteredBills.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedBills = filteredBills.slice(startIndex, endIndex);

  return {
    items: paginatedBills,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: endIndex < total,
    },
  };
}

/**
 * Get dashboard statistics
 * @param {string} email - Store email
 * @returns {Promise<Object>} Dashboard statistics
 */
export async function getDashboardStats(email) {
  const store = await findStoreByEmail(email);
  if (!store) {
    throw new Error('STORE_NOT_FOUND');
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Stock statistics
  const totalProducts = store.stock.length;
  const lowStockItems = store.stock.filter(med => med.quantity < 10).length;
  const outOfStockItems = store.stock.filter(med => med.quantity === 0).length;
  const totalStockValue = store.stock.reduce((acc, med) => {
    const price = med.medData?.pricePerTab || 0;
    return acc + (price * med.quantity);
  }, 0);

  // Sales statistics
  const todaysBills = store.billingHistory.filter(bill => 
    new Date(bill.createdAt) >= today
  );
  const monthlyBills = store.billingHistory.filter(bill => 
    new Date(bill.createdAt) >= monthStart
  );

  const todaysSales = todaysBills.reduce((acc, bill) => acc + (bill.totalAmount || 0), 0);
  const monthlySales = monthlyBills.reduce((acc, bill) => acc + (bill.totalAmount || 0), 0);
  const todaysTransactions = todaysBills.length;
  const monthlyTransactions = monthlyBills.length;

  // Top selling medicines (this month)
  const medicinesSold = {};
  monthlyBills.forEach(bill => {
    bill.productList?.forEach(product => {
      const medID = product.medData?.medID;
      if (medID) {
        medicinesSold[medID] = medicinesSold[medID] || { 
          medID, 
          name: product.medData?.name,
          quantity: 0,
          revenue: 0,
        };
        medicinesSold[medID].quantity += product.quantity || 0;
        medicinesSold[medID].revenue += (product.medData?.pricePerTab || 0) * (product.quantity || 0);
      }
    });
  });

  const topSelling = Object.values(medicinesSold)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return {
    stock: {
      totalProducts,
      lowStockItems,
      outOfStockItems,
      totalValue: Math.round(totalStockValue * 100) / 100,
    },
    sales: {
      today: {
        amount: Math.round(todaysSales * 100) / 100,
        transactions: todaysTransactions,
      },
      monthly: {
        amount: Math.round(monthlySales * 100) / 100,
        transactions: monthlyTransactions,
      },
    },
    topSelling,
  };
}

export default {
  findStoreByEmail,
  getStorePublicData,
  queryStock,
  addToStock,
  removeFromStock,
  updateStockItem,
  createBilling,
  searchBillingHistory,
  getDashboardStats,
};
