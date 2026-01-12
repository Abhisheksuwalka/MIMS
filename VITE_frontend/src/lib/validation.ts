export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Common validation patterns
 */
const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\d{10}$/,
  PASSWORD_MIN_LENGTH: 6,
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): string | null => {
  if (!email) return "Email is required";
  if (!PATTERNS.EMAIL.test(email)) return "Invalid email format";
  return null;
};

/**
 * Validate phone number (10 digits)
 */
export const validatePhone = (phone: string): string | null => {
  if (!phone) return "Phone number is required";
  if (!PATTERNS.PHONE.test(phone)) return "Phone must be exactly 10 digits";
  return null;
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): string | null => {
  if (!password) return "Password is required";
  if (password.length < PATTERNS.PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PATTERNS.PASSWORD_MIN_LENGTH} characters`;
  }
  return null;
};

/**
 * Validate positive quantity
 */
export const validateQuantity = (quantity: number | string, max?: number): string | null => {
  const num = Number(quantity);
  if (!quantity || isNaN(num)) return "Quantity is required";
  if (num <= 0) return "Quantity must be greater than 0";
  if (!Number.isInteger(num)) return "Quantity must be a whole number";
  if (max !== undefined && num > max) return `Quantity cannot exceed ${max}`;
  return null;
};

/**
 * Validate Signup Form
 */
export const validateSignupForm = (data: any): ValidationResult => {
  const errors: Record<string, string> = {};
  
  const emailError = validateEmail(data.storeEmail);
  if (emailError) errors.storeEmail = emailError;

  const passwordError = validatePassword(data._password);
  if (passwordError) errors.password = passwordError;

  if (!data.storeName?.trim()) errors.storeName = "Store name is required";
  if (!data.address?.trim()) errors.address = "Address is required";

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate Billing Form
 */
export const validateBillingForm = (data: any): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.formName?.trim()) errors.formName = "Customer name is required";
  
  const age = Number(data.formAge);
  if (!data.formAge || isNaN(age) || age < 1 || age > 120) {
    errors.formAge = "Invalid age (1-120)";
  }

  const phoneError = validatePhone(data.formPhone);
  if (phoneError) errors.formPhone = phoneError;

  if (!data.medSchemaBasedData || data.medSchemaBasedData.length === 0) {
    errors.products = "Cart is empty";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
