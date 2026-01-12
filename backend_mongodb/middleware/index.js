import Jwt from 'jsonwebtoken';
import Stores from "../schema/store/index.js";
import { forbiddenResponse, unauthorizedResponse } from '../utils/apiResponse.js';

/**
 * Authenticate JWT token from Authorization header
 */
const authenticateToken = (req, res, next) => {
  // Check JWT_SECRET is configured
  if (!process.env.JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET is not configured!');
    return res.status(500).json({
      success: false,
      error: { message: 'Server configuration error', code: 'SERVER_CONFIG_ERROR' }
    });
  }

  const token = req.header('Authorization');
  
  if (!token) {
    return unauthorizedResponse(res, 'Access token is required');
  }
  
  // Token format validation
  if (typeof token !== 'string' || token.length < 20) {
    return unauthorizedResponse(res, 'Invalid token format');
  }
  
  try {
    const verified = Jwt.verify(token, process.env.JWT_SECRET);
    
    // Ensure token has required claims
    if (!verified.storeEmail) {
      return unauthorizedResponse(res, 'Token missing required claims');
    }
    
    req.store = verified;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return unauthorizedResponse(res, 'Token has expired. Please login again.');
    }
    if (err.name === 'JsonWebTokenError') {
      return unauthorizedResponse(res, 'Invalid token');
    }
    console.error('Token verification error:', err);
    return unauthorizedResponse(res, 'Token verification failed');
  }
};

/**
 * Validate store exists and token matches
 */
const validateStore = async (req, res, next) => {
  const { storeEmail } = req.body;
  const token = req.header('Authorization');
  
  if (!storeEmail) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Store email is required',
        code: 'MISSING_EMAIL'
      }
    });
  }
  
  try {
    const store = await Stores.findOne({ storeEmail: storeEmail.toLowerCase() });
    
    if (!store) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Store not found',
          code: 'STORE_NOT_FOUND'
        }
      });
    }
    
    if (store.token !== token) {
      return forbiddenResponse(res, 'Session invalid. Please login again.');
    }
    
    // Attach store to request for downstream use
    req.storeData = store;
    next();
  } catch (err) {
    console.error('Store validation error:', err);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Server error during validation',
        code: 'VALIDATION_ERROR'
      }
    });
  }
};

/**
 * Rate limiting middleware (simple in-memory implementation)
 * For production, use redis-based rate limiting
 */
const rateLimitStore = new Map();

const rateLimit = (maxRequests = 100, windowMs = 60000) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitStore.has(ip)) {
      rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const clientData = rateLimitStore.get(ip);
    
    if (now > clientData.resetTime) {
      rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (clientData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: {
          message: 'Too many requests. Please try again later.',
          code: 'RATE_LIMITED',
          retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
        }
      });
    }
    
    clientData.count++;
    next();
  };
};

// Clean up rate limit store periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, 60000);

export {
    authenticateToken, rateLimit, validateStore
};
