/**
 * Alerts Controller
 * Handles requests for alerts and notifications
 */

import storeService from '../services/storeService.js';
import { errorResponse, successResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

/**
 * Get expiring medicines
 * Returns medicines expiring within X days (default 30)
 */
export async function getExpiringMedicines(req, res) {
  try {
    const { storeEmail, days = 90 } = req.body; // Default 3 months warning
    
    // Logic would be in storeService, but since we rely on `expiryDate` 
    // which was just added as a new schema field (and might be empty for old data),
    // we'll filter what we can.
    
    const store = await storeService.findStoreByEmail(storeEmail);
    if (!store) {
      return errorResponse(res, 'Store not found', 404);
    }

    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + parseInt(days));

    const expiringStock = store.stock.filter(item => {
      // Check expiry date on stock item (not nested in medData)
      if (!item.expiryDate) return false;
      
      const expiry = new Date(item.expiryDate);
      return expiry <= futureDate;
    }).map(item => ({
      ...item.toObject(),
      daysUntilExpiry: Math.ceil((new Date(item.expiryDate) - today) / (1000 * 60 * 60 * 24))
    }));

    // Sort by most urgent (expired first, then nearest expiry)
    expiringStock.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

    return successResponse(res, {
      count: expiringStock.length,
      items: expiringStock,
      thresholdDays: parseInt(days)
    });

  } catch (error) {
    logger.error('Error fetching expiring medicines', { error: error.message });
    return errorResponse(res, 'Failed to fetch alerts', 500);
  }
}

/**
 * Get low stock alerts
 */
export async function getLowStockAlerts(req, res) {
  try {
    const { storeEmail, threshold = 10 } = req.body;
    
    const store = await storeService.findStoreByEmail(storeEmail);
    if (!store) {
      return errorResponse(res, 'Store not found', 404);
    }

    const lowStock = store.stock.filter(item => {
      // Use item specific threshold if available, else global default
      const limit = item.medData?.lowStockThreshold || parseInt(threshold);
      return item.quantity <= limit;
    });

    return successResponse(res, {
      count: lowStock.length,
      items: lowStock,
      threshold: parseInt(threshold)
    });
  } catch (error) {
    logger.error('Error fetching low stock alerts', { error: error.message });
    return errorResponse(res, 'Failed to fetch alerts', 500);
  }
}

export default {
  getExpiringMedicines,
  getLowStockAlerts
};
