/**
 * Store Query API Routes
 * Handles store-related queries using the new controller architecture
 */

import express from 'express';
import storeController from '../../controllers/storeController.js';
import { validateStore } from '../../middleware/index.js';
import { validateAddMedicine, validateBilling } from '../../middleware/validation.js';
import { auditAction } from '../../services/auditService.js';

const queryApi = express.Router();

// Apply store validation to all routes in this router
queryApi.use(validateStore);

// Get store data
queryApi.post('/getStoreData', storeController.getStoreData);

// Stock operations
queryApi.post('/addMed', validateAddMedicine, auditAction('STOCK_ADD', 'Stock'), storeController.addMedicineToStock);
queryApi.post('/querryStock', storeController.queryStock); // Keeping legacy path for frontend compatibility
queryApi.post('/queryStock', storeController.queryStock);  // New standard path
queryApi.post('/removeMed', auditAction('STOCK_REMOVE', 'Stock'), storeController.removeMedicineFromStock);
queryApi.post('/updateStock', auditAction('STOCK_UPDATE', 'Stock'), storeController.updateStockItem);

// Billing operations
queryApi.post('/billing', validateBilling, auditAction('BILLING_CREATE', 'Billing'), storeController.createBilling);
queryApi.post('/getBillsByName', storeController.getBillsByName);
queryApi.post('/getBillsByPhone', storeController.getBillsByPhone);
queryApi.post('/getBillByMed', storeController.getBillsByMedicine);

// Dashboard operations
queryApi.post('/dashboard/stats', storeController.getDashboardStats);

export default queryApi;
