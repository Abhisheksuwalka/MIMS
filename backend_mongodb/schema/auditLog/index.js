/**
 * Audit Log Schema
 * Tracks important system actions for security and accountability
 */

import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        index: true
    },
    performedBy: {
        type: String, // Store Email or User ID
        required: true,
        index: true
    },
    entity: {
        type: String, // e.g., 'Medicine', 'Store', 'Billing'
        required: true
    },
    entityId: {
        type: String, // ID of the affected entity
    },
    details: {
        type: mongoose.Schema.Types.Mixed, // Free-form JSON for flexibility
    },
    ipAddress: {
        type: String,
    },
    userAgent: {
        type: String,
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILURE'],
        default: 'SUCCESS'
    }
}, { timestamps: true });

// Expires logs after 90 days to save space
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
