/**
 * Store Controller
 * Handles HTTP requests for store operations
 */

import storeService from '../services/storeService.js';
import { errorResponse, notFoundResponse, successResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

/**
 * Get store data
 */
export async function getStoreData(req, res) {
  try {
    const { storeEmail } = req.body;
    const store = await storeService.getStorePublicData(storeEmail);
    return successResponse(res, store);
  } catch (error) {
    if (error.message === 'STORE_NOT_FOUND') {
      return notFoundResponse(res, 'Store not found');
    }
    logger.error('Error getting store data', { error: error.message });
    return errorResponse(res, 'Failed to fetch store data', 500);
  }
}

/**
 * Query stock with search and pagination
 */
export async function queryStock(req, res) {
  try {
    const { storeEmail, query, page, limit } = req.body;
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    };
    
    const result = await storeService.queryStock(storeEmail, query, options);
    
    // For backward compatibility, return array if pagination not requested
    if (!page && !limit) {
      return res.json(result.items);
    }
    
    return successResponse(res, result);
  } catch (error) {
    if (error.message === 'STORE_NOT_FOUND') {
      return notFoundResponse(res, 'Store not found');
    }
    logger.error('Error querying stock', { error: error.message });
    return errorResponse(res, 'Failed to query stock', 500);
  }
}

/**
 * Add medicine to stock
 */
export async function addMedicineToStock(req, res) {
  try {
    const { 
      storeEmail, 
      medicineQuantityToAdd, 
      medID, 
      name, 
      secName, 
      sellingType, 
      medType, 
      pricePerTab, 
      cardPerBox, 
      pricePerBox,
      expiryDate,      // NEW
      batchNumber,     // NEW
      purchasePrice    // NEW
    } = req.body;
    
    const medicineData = { 
      medID, 
      name, 
      secName, 
      sellingType, 
      medType, 
      pricePerTab, 
      cardPerBox, 
      pricePerBox,
      expiryDate,      // NEW
      batchNumber,     // NEW
      purchasePrice    // NEW
    };
    
    const result = await storeService.addToStock(storeEmail, medicineData, medicineQuantityToAdd);
    return successResponse(res, result, 'Stock updated successfully');
  } catch (error) {
    if (error.message === 'STORE_NOT_FOUND') {
      return notFoundResponse(res, 'Store not found');
    }
    logger.error('Error adding stock', { error: error.message });
    return errorResponse(res, 'Failed to add stock', 500);
  }
}

/**
 * Remove medicine from stock
 */
export async function removeMedicineFromStock(req, res) {
  try {
    const { storeEmail, medID, quantityToRemove } = req.body;
    
    const result = await storeService.removeFromStock(storeEmail, medID, quantityToRemove);
    return successResponse(res, result, 'Stock removed successfully');
  } catch (error) {
    if (error.message === 'STORE_NOT_FOUND') {
      return notFoundResponse(res, 'Store not found');
    }
    if (error.message === 'INSUFFICIENT_STOCK') {
      return errorResponse(res, 'Quantity exceeds available stock', 400);
    }
    logger.error('Error removing stock', { error: error.message });
    return errorResponse(res, 'Failed to remove stock', 500);
  }
}

/**
 * Update existing stock item
 */
export async function updateStockItem(req, res) {
  try {
    const { 
      storeEmail, 
      medID, 
      pricePerTab, 
      quantity, 
      expiryDate, 
      batchNumber, 
      cardPerBox,
      name,
      isDiscontinued 
    } = req.body;
    
    if (!medID) {
      return errorResponse(res, 'Medicine ID is required', 400);
    }
    
    const updates = {};
    if (pricePerTab !== undefined) updates.pricePerTab = pricePerTab;
    if (quantity !== undefined) updates.quantity = quantity;
    if (expiryDate !== undefined) updates.expiryDate = expiryDate;
    if (batchNumber !== undefined) updates.batchNumber = batchNumber;
    if (cardPerBox !== undefined) updates.cardPerBox = cardPerBox;
    if (name !== undefined) updates.name = name;
    if (isDiscontinued !== undefined) updates.isDiscontinued = isDiscontinued === 'true' || isDiscontinued === true;
    
    const result = await storeService.updateStockItem(storeEmail, medID, updates);
    return successResponse(res, result, 'Stock updated successfully');
  } catch (error) {
    if (error.message === 'STORE_NOT_FOUND') {
      return notFoundResponse(res, 'Store not found');
    }
    if (error.message === 'MEDICINE_NOT_FOUND') {
      return notFoundResponse(res, 'Medicine not found in stock');
    }
    logger.error('Error updating stock', { error: error.message });
    return errorResponse(res, 'Failed to update stock', 500);
  }
}

/**
 * Create billing record
 */
export async function createBilling(req, res) {
  try {
    const { 
      storeEmail, 
      formName, 
      formAge, 
      formPhone, 
      medSchemaBasedData, 
      totalAmount 
    } = req.body;
    
    // Parse medicine data if sent as string (backward compatibility)
    let products = medSchemaBasedData;
    if (typeof medSchemaBasedData === 'string') {
      try {
        products = JSON.parse(medSchemaBasedData);
      } catch (e) {
        return errorResponse(res, 'Invalid medicine data format', 400);
      }
    }
    
    const billingData = {
      customerName: formName,
      customerAge: formAge,
      phone: formPhone,
      products,
      totalAmount,
    };
    
    const result = await storeService.createBilling(storeEmail, billingData);
    return successResponse(res, result, 'Bill created successfully', 201);
  } catch (error) {
    if (error.message.startsWith('INSUFFICIENT_STOCK')) {
      const medId = error.message.split(':')[1];
      return errorResponse(res, `Insufficient stock for medicine ID: ${medId}`, 400);
    }
    logger.error('Error processing billing', { error: error.message });
    return errorResponse(res, 'Failed to process billing', 500);
  }
}

/**
 * Search billing history by name
 */
export async function getBillsByName(req, res) {
  try {
    const { storeEmail, query } = req.body;
    const result = await storeService.searchBillingHistory(storeEmail, query, 'name');
    
    // Backward compatibility - return array directly
    return res.json(result.items);
  } catch (error) {
    logger.error('Error searching bills by name', { error: error.message });
    return errorResponse(res, 'Failed to search bills', 500);
  }
}

/**
 * Search billing history by phone
 */
export async function getBillsByPhone(req, res) {
  try {
    const { storeEmail, query } = req.body;
    const result = await storeService.searchBillingHistory(storeEmail, query, 'phone');
    
    // Backward compatibility - return array directly
    return res.status(200).send(result.items);
  } catch (error) {
    logger.error('Error searching bills by phone', { error: error.message });
    return errorResponse(res, 'Failed to search bills', 500);
  }
}

/**
 * Search billing history by medicine
 */
export async function getBillsByMedicine(req, res) {
  try {
    const { storeEmail, query } = req.body;
    const result = await storeService.searchBillingHistory(storeEmail, query, 'medicine');
    
    // Backward compatibility - return array directly
    return res.status(200).send(result.items);
  } catch (error) {
    logger.error('Error searching bills by medicine', { error: error.message });
    return errorResponse(res, 'Failed to search bills', 500);
  }
}

/**
 * Get dashboard stats
 */
export async function getDashboardStats(req, res) {
  try {
    const { storeEmail } = req.body;
    const stats = await storeService.getDashboardStats(storeEmail);
    return successResponse(res, stats);
  } catch (error) {
    logger.error('Error fetching dashboard stats', { error: error.message });
    return errorResponse(res, 'Failed to fetch dashboard statistics', 500);
  }
}

export default {
  getStoreData,
  queryStock,
  addMedicineToStock,
  removeMedicineFromStock,
  updateStockItem,
  createBilling,
  getBillsByName,
  getBillsByPhone,
  getBillsByMedicine,
  getDashboardStats,
};
