/**
 * Alerts API Routes
 */

import express from 'express';
import alertsController from '../../controllers/alertsController.js';
import { validateStore } from '../../middleware/index.js';

const alertsApi = express.Router();

alertsApi.use(validateStore);

// Get expiring medicines
alertsApi.post('/expiring', alertsController.getExpiringMedicines);

// Get low stock alerts
alertsApi.post('/low-stock', alertsController.getLowStockAlerts);

export default alertsApi;
