/**
 * Medicine Controller
 * Handles HTTP requests for medicine operations
 */

import medicineService from '../services/medicineService.js';
import { errorResponse, successResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

/**
 * Add new medicine to global database
 */
export async function addGlobalMedicine(req, res) {
  try {
    const medicine = await medicineService.createMedicine(req.body);
    return successResponse(res, medicine, 'Medicine added successfully', 201);
  } catch (error) {
    if (error.message === 'MEDICINE_EXISTS') {
      return errorResponse(res, 'Medicine ID already exists', 409);
    }
    logger.error('Error adding global medicine', { error: error.message });
    return errorResponse(res, 'Failed to add medicine', 500);
  }
}

/**
 * Get medicines by type
 */
export async function getMedicinesByType(req, res, type) {
  try {
    // Check if pagination is requested via query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    
    const result = await medicineService.getMedicinesByType(type, { page, limit });
    
    // Backward compatibility - return array directly if requested
    if (!req.query.page) {
      return res.json(result.items);
    }
    
    return successResponse(res, result);
  } catch (error) {
    logger.error(`Error searching for ${type}`, { error: error.message });
    return errorResponse(res, `Error searching for ${type}`, 500);
  }
}

/**
 * Search medicines
 */
export async function searchMedicines(req, res) {
  try {
    const { query } = req.body;
    const result = await medicineService.searchMedicines(query, { limit: 20 });
    
    // Backward compatibility - return array directly
    return res.send(result.items);
  } catch (error) {
    logger.error('Error searching medicines', { error: error.message });
    return errorResponse(res, 'Search failed', 500);
  }
}

export default {
  addGlobalMedicine,
  getMedicinesByType,
  searchMedicines,
};
