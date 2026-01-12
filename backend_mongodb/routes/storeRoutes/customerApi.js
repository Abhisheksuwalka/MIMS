/**
 * Customer API Routes
 */

import express from 'express';
import customerController from '../../controllers/customerController.js';

const router = express.Router();

// Search customers
router.post('/search', customerController.searchCustomers);

// Get customer by phone
router.post('/lookup', customerController.getCustomerByPhone);

// Create or update customer
router.post('/save', customerController.upsertCustomer);

// Get top customers
router.post('/top', customerController.getTopCustomers);

export default router;
