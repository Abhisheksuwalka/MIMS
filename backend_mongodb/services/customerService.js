/**
 * Customer Service
 * Business logic for customer management
 */

import Customer from '../schema/customer/index.js';
import logger from '../utils/logger.js';

/**
 * Find or create customer by phone
 * @param {ObjectId} storeId - Store ID
 * @param {string} phone - Customer phone
 * @param {Object} data - Customer data (for creation)
 */
export async function findOrCreateCustomer(storeId, phone, data = {}) {
  const normalizedPhone = phone.replace(/\D/g, ''); // Remove non-digits
  
  let customer = await Customer.findOne({ storeId, phone: normalizedPhone });
  
  if (!customer) {
    customer = new Customer({
      storeId,
      phone: normalizedPhone,
      name: data.name || 'Customer',
      email: data.email || '',
      address: data.address || '',
    });
    await customer.save();
    logger.info('New customer created', { phone: normalizedPhone, storeId });
  }
  
  return customer;
}

/**
 * Search customers by phone or name
 */
export async function searchCustomers(storeId, query, limit = 10) {
  const searchTerm = query.trim();
  
  // Search by phone (exact or partial) or name (fuzzy)
  const customers = await Customer.find({
    storeId,
    $or: [
      { phone: { $regex: searchTerm, $options: 'i' } },
      { name: { $regex: searchTerm, $options: 'i' } }
    ],
    isActive: true
  })
  .limit(limit)
  .select('phone name loyaltyPoints totalSpent visitCount lastVisit')
  .sort({ lastVisit: -1 });
  
  return customers;
}

/**
 * Get customer by ID
 */
export async function getCustomer(storeId, customerId) {
  return await Customer.findOne({ _id: customerId, storeId });
}

/**
 * Get customer by phone
 */
export async function getCustomerByPhone(storeId, phone) {
  const normalizedPhone = phone.replace(/\D/g, '');
  return await Customer.findOne({ storeId, phone: normalizedPhone });
}

/**
 * Update customer
 */
export async function updateCustomer(storeId, customerId, updates) {
  const allowedUpdates = ['name', 'email', 'address', 'dateOfBirth', 'notes', 'creditBalance'];
  const sanitizedUpdates = {};
  
  for (const key of allowedUpdates) {
    if (updates[key] !== undefined) {
      sanitizedUpdates[key] = updates[key];
    }
  }
  
  const customer = await Customer.findOneAndUpdate(
    { _id: customerId, storeId },
    sanitizedUpdates,
    { new: true }
  );
  
  return customer;
}

/**
 * Record a purchase for a customer
 */
export async function recordPurchase(storeId, phone, amount) {
  const customer = await getCustomerByPhone(storeId, phone);
  if (customer) {
    customer.addPurchase(amount);
    await customer.save();
    logger.info('Customer purchase recorded', { phone, amount, loyaltyPoints: customer.loyaltyPoints });
    return customer;
  }
  return null;
}

/**
 * Get top customers for a store
 */
export async function getTopCustomers(storeId, limit = 10) {
  return await Customer.find({ storeId, isActive: true })
    .sort({ totalSpent: -1 })
    .limit(limit)
    .select('phone name totalSpent visitCount loyaltyPoints lastVisit');
}

export default {
  findOrCreateCustomer,
  searchCustomers,
  getCustomer,
  getCustomerByPhone,
  updateCustomer,
  recordPurchase,
  getTopCustomers
};
