/**
 * API Response Utilities
 * Standardized response format for all API endpoints
 */

/**
 * Success response helper
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Optional success message
 * @param {number} statusCode - HTTP status code (default 200)
 */
export const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Error response helper
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default 400)
 * @param {string} errorCode - Optional error code for client handling
 */
export const errorResponse = (res, message = 'An error occurred', statusCode = 400, errorCode = null) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: errorCode,
      statusCode
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Validation error response
 * @param {Object} res - Express response object
 * @param {Array} errors - Array of validation errors
 */
export const validationError = (res, errors = []) => {
  return res.status(422).json({
    success: false,
    error: {
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Not found response
 * @param {Object} res - Express response object
 * @param {string} resource - Resource name that wasn't found
 */
export const notFoundResponse = (res, resource = 'Resource') => {
  return res.status(404).json({
    success: false,
    error: {
      message: `${resource} not found`,
      code: 'NOT_FOUND'
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Custom message
 */
export const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return res.status(401).json({
    success: false,
    error: {
      message,
      code: 'UNAUTHORIZED'
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Custom message
 */
export const forbiddenResponse = (res, message = 'Access denied') => {
  return res.status(403).json({
    success: false,
    error: {
      message,
      code: 'FORBIDDEN'
    },
    timestamp: new Date().toISOString()
  });
};

export default {
  successResponse,
  errorResponse,
  validationError,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse
};
