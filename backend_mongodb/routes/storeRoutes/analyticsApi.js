/**
 * Analytics API Routes
 */

import express from 'express';
import analyticsController from '../../controllers/analyticsController.js';

const router = express.Router();

// Get sales analytics
router.post('/sales', analyticsController.getSalesAnalytics);

// Get top selling medicines
router.post('/top-selling', analyticsController.getTopSelling);

export default router;
