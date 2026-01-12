/**
 * Customer Controller
 * Handles HTTP requests for customer operations
 */

import customerService from '../services/customerService.js';
import { findStoreByEmail } from '../services/storeService.js';
import { errorResponse, notFoundResponse, successResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

/**
 * Search customers by phone or name
 */
export async function searchCustomers(req, res) {
  try {
    const { storeEmail, query } = req.body;
    
    const store = await findStoreByEmail(storeEmail);
    if (!store) {
      return notFoundResponse(res, 'Store not found');
    }
    
    const customers = await customerService.searchCustomers(store._id, query || '');
    return successResponse(res, customers);
  } catch (error) {
    logger.error('Error searching customers', { error: error.message });
    return errorResponse(res, 'Failed to search customers', 500);
  }
}

/**
 * Get customer by phone
 */
export async function getCustomerByPhone(req, res) {
  try {
    const { storeEmail, phone } = req.body;
    
    const store = await findStoreByEmail(storeEmail);
    if (!store) {
      return notFoundResponse(res, 'Store not found');
    }
    
    const customer = await customerService.getCustomerByPhone(store._id, phone);
    if (!customer) {
      return successResponse(res, null, 'Customer not found');
    }
    
    return successResponse(res, customer);
  } catch (error) {
    logger.error('Error fetching customer', { error: error.message });
    return errorResponse(res, 'Failed to fetch customer', 500);
  }
}

/**
 * Create or update customer
 */
export async function upsertCustomer(req, res) {
  try {
    const { storeEmail, phone, name, email, address, notes } = req.body;
    
    if (!phone) {
      return errorResponse(res, 'Phone number is required', 400);
    }
    
    const store = await findStoreByEmail(storeEmail);
    if (!store) {
      return notFoundResponse(res, 'Store not found');
    }
    
    const customer = await customerService.findOrCreateCustomer(
      store._id, 
      phone, 
      { name, email, address, notes }
    );
    
    // If customer existed, update their info
    if (name || email || address || notes) {
      if (name) customer.name = name;
      if (email) customer.email = email;
      if (address) customer.address = address;
      if (notes) customer.notes = notes;
      await customer.save();
    }
    
    return successResponse(res, customer, 'Customer saved successfully');
  } catch (error) {
    logger.error('Error saving customer', { error: error.message });
    return errorResponse(res, 'Failed to save customer', 500);
  }
}

/**
 * Get top customers
 */
export async function getTopCustomers(req, res) {
  try {
    const { storeEmail, limit = 10 } = req.body;
    
    const store = await findStoreByEmail(storeEmail);
    if (!store) {
      return notFoundResponse(res, 'Store not found');
    }
    
    const customers = await customerService.getTopCustomers(store._id, parseInt(limit));
    return successResponse(res, customers);
  } catch (error) {
    logger.error('Error fetching top customers', { error: error.message });
    return errorResponse(res, 'Failed to fetch top customers', 500);
  }
}

export default {
  searchCustomers,
  getCustomerByPhone,
  upsertCustomer,
  getTopCustomers
};
