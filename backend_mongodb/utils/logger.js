/**
 * Structured Logger Utility
 * Provides consistent logging across the application with levels and metadata
 */

import { randomUUID } from 'crypto';

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

// ANSI color codes for terminal output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m',
};

// Current log level from environment
const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] ?? LOG_LEVELS.DEBUG;

/**
 * Format log message with timestamp, level, and metadata
 */
function formatMessage(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  
  return {
    timestamp,
    level,
    message,
    ...meta,
  };
}

/**
 * Get color for log level
 */
function getColor(level) {
  switch (level) {
    case 'ERROR': return COLORS.red;
    case 'WARN': return COLORS.yellow;
    case 'INFO': return COLORS.green;
    case 'DEBUG': return COLORS.gray;
    default: return COLORS.reset;
  }
}

/**
 * Print log to console with formatting
 */
function printLog(level, message, meta = {}) {
  if (LOG_LEVELS[level] > currentLevel) return;

  const logData = formatMessage(level, message, meta);
  const color = getColor(level);
  const timestamp = COLORS.gray + logData.timestamp + COLORS.reset;
  const levelStr = color + `[${level}]`.padEnd(7) + COLORS.reset;
  const metaStr = Object.keys(meta).length > 0 
    ? COLORS.cyan + ' ' + JSON.stringify(meta) + COLORS.reset 
    : '';

  console.log(`${timestamp} ${levelStr} ${message}${metaStr}`);
}

/**
 * Logger object with methods for each level
 */
const logger = {
  error: (message, meta = {}) => printLog('ERROR', message, meta),
  warn: (message, meta = {}) => printLog('WARN', message, meta),
  info: (message, meta = {}) => printLog('INFO', message, meta),
  debug: (message, meta = {}) => printLog('DEBUG', message, meta),
  
  /**
   * Create a child logger with preset metadata
   */
  child: (defaultMeta = {}) => ({
    error: (message, meta = {}) => printLog('ERROR', message, { ...defaultMeta, ...meta }),
    warn: (message, meta = {}) => printLog('WARN', message, { ...defaultMeta, ...meta }),
    info: (message, meta = {}) => printLog('INFO', message, { ...defaultMeta, ...meta }),
    debug: (message, meta = {}) => printLog('DEBUG', message, { ...defaultMeta, ...meta }),
  }),
};

/**
 * Generate unique request ID
 */
export function generateRequestId() {
  return randomUUID().split('-')[0];
}

/**
 * Request logging middleware
 * Attaches requestId and logs request/response
 */
export function requestLogger(req, res, next) {
  const requestId = generateRequestId();
  req.requestId = requestId;
  
  const startTime = Date.now();
  
  // Log incoming request
  logger.info(`→ ${req.method} ${req.path}`, {
    requestId,
    method: req.method,
    path: req.path,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    ip: req.ip,
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    const logFn = statusCode >= 500 ? logger.error 
      : statusCode >= 400 ? logger.warn 
      : logger.info;
    
    logFn(`← ${req.method} ${req.path} ${statusCode} ${duration}ms`, {
      requestId,
      statusCode,
      duration,
    });
  });

  next();
}

/**
 * Error logging helper
 */
export function logError(error, context = {}) {
  logger.error(error.message || 'Unknown error', {
    ...context,
    stack: error.stack,
    name: error.name,
  });
}

export default logger;
