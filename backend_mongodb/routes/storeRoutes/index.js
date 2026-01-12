import bcrypt from "bcryptjs";
import express from "express";
import Jwt from "jsonwebtoken";
import { authenticateToken, rateLimit } from "../../middleware/index.js";
import { validateLogin, validateSignup } from "../../middleware/validation.js";
import Stores from "../../schema/store/index.js";
import { auditAction } from "../../services/auditService.js";
import { errorResponse, successResponse } from "../../utils/apiResponse.js";
import alertsApi from "./alertsApi.js";
import analyticsApi from "./analyticsApi.js";
import customerApi from "./customerApi.js";
import queryApi from "./queryApi.js";

const router = express.Router();

// Apply rate limiting to auth routes
const authRateLimit = rateLimit(10, 60000); // 10 requests per minute

/**
 * GET /store/stores
 * Health check for store routes
 */
router.get("/stores", (req, res) => {
  return successResponse(res, { available: true }, "Store API is running");
});

/**
 * POST /store/signup
 * Create a new store account
 */
router.post("/signup", authRateLimit, validateSignup, auditAction('STORE_SIGNUP', 'Store'), async (req, res) => {
  try {
    const { storeEmail, storeName, _password, address } = req.body;
    
    // Check if store already exists
    const existingStore = await Stores.findOne({ storeEmail: storeEmail.toLowerCase() });
    if (existingStore) {
      return errorResponse(res, "An account with this email already exists", 409, "EMAIL_EXISTS");
    }
    
    // Hash password with higher salt rounds for better security
    const password = await bcrypt.hash(_password, 12);
    
    const newStore = await Stores.create({
      storeEmail: storeEmail.toLowerCase(),
      password,
      storeName,
      address,
    });
    
    console.log(`[Signup] New store created: ${storeEmail}`);
    
    return successResponse(
      res, 
      { storeId: newStore._id }, 
      "Account created successfully", 
      201
    );
  } catch (err) {
    console.error("[Signup Error]", err);
    
    // Handle duplicate key error
    if (err.code === 11000) {
      return errorResponse(res, "An account with this email already exists", 409, "EMAIL_EXISTS");
    }
    
    return errorResponse(res, "Failed to create account", 500, "SIGNUP_ERROR");
  }
});

/**
 * POST /store/login
 * Authenticate store and return JWT token
 */
router.post("/login", authRateLimit, validateLogin, auditAction('STORE_LOGIN', 'Store'), async (req, res) => {
  try {
    const { storeEmail, _password } = req.body;
    
    const store = await Stores.findOne({ storeEmail: storeEmail.toLowerCase() });
    
    if (!store) {
      return errorResponse(res, "No account found with this email", 404, "STORE_NOT_FOUND");
    }
    
    const isValidPassword = await store.isValidPassword(_password);
    
    if (!isValidPassword) {
      return errorResponse(res, "Incorrect password", 401, "INVALID_PASSWORD");
    }
    
    // Generate JWT token with expiry
    const token = Jwt.sign(
      { storeEmail: storeEmail.toLowerCase(), storeId: store._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );
    
    // Save token to store
    store.token = token;
    await store.save();
    
    console.log(`[Login] Store logged in: ${storeEmail}`);
    
    // Return token directly for backward compatibility
    // Frontend expects just the token string
    return res.status(200).send(token);
  } catch (err) {
    console.error("[Login Error]", err);
    return errorResponse(res, "Login failed", 500, "LOGIN_ERROR");
  }
});

/**
 * POST /store/logout
 * Invalidate the current session
 */
router.post("/logout", authenticateToken, auditAction('STORE_LOGOUT', 'Store'), async (req, res) => {
  try {
    const { storeEmail } = req.body;
    
    const store = await Stores.findOne({ storeEmail: storeEmail.toLowerCase() });
    
    if (store) {
      store.token = "";
      await store.save();
    }
    
    return successResponse(res, null, "Logged out successfully");
  } catch (err) {
    console.error("[Logout Error]", err);
    return errorResponse(res, "Logout failed", 500, "LOGOUT_ERROR");
  }
});

// Protected API routes
router.use("/api", authenticateToken, queryApi);
router.use("/alerts", authenticateToken, alertsApi);
router.use("/customers", authenticateToken, customerApi);
router.use("/analytics", authenticateToken, analyticsApi); // Sales analytics

export default router;
