/**
 * Audit Logging Service & Middleware
 * Records critical actions to the database
 */

import AuditLog from '../schema/auditLog/index.js';
import logger from '../utils/logger.js';

/**
 * Log an action to the audit log
 * @param {Object} data - Audit data
 */
export async function logAudit(data) {
  try {
    const { action, performedBy, entity, entityId, details, req, status = 'SUCCESS' } = data;
    
    const auditEntry = {
      action,
      performedBy: performedBy || 'SYSTEM',
      entity,
      entityId,
      details,
      status,
      timestamp: new Date()
    };

    if (req) {
      auditEntry.ipAddress = req.ip || req.connection.remoteAddress;
      auditEntry.userAgent = req.get('User-Agent');
    }

    await AuditLog.create(auditEntry);
    logger.debug(`Audit log created: ${action}`, { performedBy, entity });
  } catch (error) {
    // We don't want audit logging to break the application, just log the error
    logger.error('Failed to create audit log', { error: error.message });
  }
}

/**
 * Middleware to strictly log specific actions
 * Usage: router.post('/route', auditMiddleware('ACTION_NAME', 'ENTITY'), controller)
 */
export function auditAction(actionName, entityName) {
  return async (req, res, next) => {
    // Capture the original send to log status after response
    const originalSend = res.send;
    const storeEmail = req.store?.storeEmail || req.body.storeEmail || 'ANONYMOUS';

    res.send = function (data) {
      const status = res.statusCode >= 400 ? 'FAILURE' : 'SUCCESS';
      
      // Log asynchronously to not block response
      logAudit({
        action: actionName,
        performedBy: storeEmail,
        entity: entityName,
        details: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode
        },
        req,
        status
      });

      originalSend.apply(res, arguments);
    };

    next();
  };
}

export default {
  logAudit,
  auditAction
};
