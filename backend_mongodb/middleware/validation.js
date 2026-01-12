/**
 * Input Validation Middleware
 * Provides validation utilities for API requests
 */

import { validationError } from '../utils/apiResponse.js';

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (password && password.length > 100) {
    errors.push('Password must be less than 100 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize string input - remove HTML tags and trim
 * @param {string} str - String to sanitize
 * @returns {string}
 */
const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
};

/**
 * Validate signup request body
 */
export const validateSignup = (req, res, next) => {
  const { storeEmail, storeName, _password, address } = req.body;
  const errors = [];
  
  // Email validation
  if (!storeEmail) {
    errors.push({ field: 'storeEmail', message: 'Email is required' });
  } else if (!isValidEmail(storeEmail)) {
    errors.push({ field: 'storeEmail', message: 'Invalid email format' });
  }
  
  // Store name validation
  if (!storeName) {
    errors.push({ field: 'storeName', message: 'Store name is required' });
  } else if (storeName.length < 2 || storeName.length > 100) {
    errors.push({ field: 'storeName', message: 'Store name must be 2-100 characters' });
  }
  
  // Password validation
  if (!_password) {
    errors.push({ field: '_password', message: 'Password is required' });
  } else {
    const passwordValidation = validatePassword(_password);
    if (!passwordValidation.isValid) {
      errors.push({ field: '_password', message: passwordValidation.errors[0] });
    }
  }
  
  // Address validation
  if (!address) {
    errors.push({ field: 'address', message: 'Address is required' });
  } else if (address.length < 5 || address.length > 200) {
    errors.push({ field: 'address', message: 'Address must be 5-200 characters' });
  }
  
  if (errors.length > 0) {
    return validationError(res, errors);
  }
  
  // Sanitize inputs
  req.body.storeName = sanitizeString(storeName);
  req.body.address = sanitizeString(address);
  req.body.storeEmail = storeEmail.toLowerCase().trim();
  
  next();
};

/**
 * Validate login request body
 */
export const validateLogin = (req, res, next) => {
  const { storeEmail, _password } = req.body;
  const errors = [];
  
  if (!storeEmail) {
    errors.push({ field: 'storeEmail', message: 'Email is required' });
  } else if (!isValidEmail(storeEmail)) {
    errors.push({ field: 'storeEmail', message: 'Invalid email format' });
  }
  
  if (!_password) {
    errors.push({ field: '_password', message: 'Password is required' });
  }
  
  if (errors.length > 0) {
    return validationError(res, errors);
  }
  
  req.body.storeEmail = storeEmail.toLowerCase().trim();
  
  next();
};

/**
 * Validate billing request body
 */
export const validateBilling = (req, res, next) => {
  const { formName, formAge, formPhone, medSchemaBasedData, totalAmount } = req.body;
  const errors = [];
  
  if (!formName) {
    errors.push({ field: 'formName', message: 'Customer name is required' });
  }
  
  if (!formAge || isNaN(parseInt(formAge)) || parseInt(formAge) < 1 || parseInt(formAge) > 150) {
    errors.push({ field: 'formAge', message: 'Valid age is required (1-150)' });
  }
  
  if (!formPhone) {
    errors.push({ field: 'formPhone', message: 'Phone number is required' });
  }
  
  if (!medSchemaBasedData) {
    errors.push({ field: 'medSchemaBasedData', message: 'Medicine data is required' });
  } else {
    try {
      const parsed = JSON.parse(medSchemaBasedData);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        errors.push({ field: 'medSchemaBasedData', message: 'At least one medicine is required' });
      }
    } catch (e) {
      errors.push({ field: 'medSchemaBasedData', message: 'Invalid medicine data format' });
    }
  }
  
  if (errors.length > 0) {
    return validationError(res, errors);
  }
  
  req.body.formName = sanitizeString(formName);
  
  next();
};

/**
 * Validate add medicine request
 */
export const validateAddMedicine = (req, res, next) => {
  const { medID, name, medType, medicineQuantityToAdd } = req.body;
  const errors = [];
  
  if (!medID) {
    errors.push({ field: 'medID', message: 'Medicine ID is required' });
  }
  
  if (!name) {
    errors.push({ field: 'name', message: 'Medicine name is required' });
  }
  
  if (!medType) {
    errors.push({ field: 'medType', message: 'Medicine type is required' });
  }
  
  if (!medicineQuantityToAdd || isNaN(parseInt(medicineQuantityToAdd)) || parseInt(medicineQuantityToAdd) < 1) {
    errors.push({ field: 'medicineQuantityToAdd', message: 'Valid quantity is required (min 1)' });
  }
  
  if (errors.length > 0) {
    return validationError(res, errors);
  }
  
  next();
};

export default {
  validateSignup,
  validateLogin,
  validateBilling,
  validateAddMedicine,
  isValidEmail,
  validatePassword,
  sanitizeString
};
