/**
 * Analytics Controller
 * Handles HTTP requests for sales analytics
 */

import analyticsService from '../services/analyticsService.js';
import { errorResponse, notFoundResponse, successResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

/**
 * Get sales analytics for a period
 */
export async function getSalesAnalytics(req, res) {
  try {
    const { storeEmail, period, startDate, endDate } = req.body;
    
    const analytics = await analyticsService.getSalesAnalytics(
      storeEmail, 
      period || 'today',
      startDate,
      endDate
    );
    
    return successResponse(res, analytics);
  } catch (error) {
    if (error.message === 'STORE_NOT_FOUND') {
      return notFoundResponse(res, 'Store not found');
    }
    if (error.message === 'INVALID_PERIOD') {
      return errorResponse(res, 'Invalid period specified', 400);
    }
    logger.error('Error fetching analytics', { error: error.message });
    return errorResponse(res, 'Failed to fetch analytics', 500);
  }
}

/**
 * Get top selling medicines
 */
export async function getTopSelling(req, res) {
  try {
    const { storeEmail, period, limit } = req.body;
    
    const topSelling = await analyticsService.getTopSellingMedicines(
      storeEmail,
      period || 'thisMonth',
      parseInt(limit) || 10
    );
    
    return successResponse(res, topSelling);
  } catch (error) {
    if (error.message === 'STORE_NOT_FOUND') {
      return notFoundResponse(res, 'Store not found');
    }
    logger.error('Error fetching top selling', { error: error.message });
    return errorResponse(res, 'Failed to fetch top selling medicines', 500);
  }
}

export default {
  getSalesAnalytics,
  getTopSelling,
};
