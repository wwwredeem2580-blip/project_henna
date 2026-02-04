import { AuditLog } from '../database/auditLog/auditLog';

/**
 * Utility for creating audit log entries
 */
export const createAuditLog = async (params: {
  action: string;
  resource: string;
  resourceId: string;
  adminId: string;
  changes?: {
    before?: any;
    after?: any;
  };
  metadata?: Record<string, any>;
  ipAddress?: string;
}) => {
  try {
    await AuditLog.create({
      action: params.action.toUpperCase(),
      resource: params.resource.toLowerCase(),
      resourceId: params.resourceId,
      adminId: params.adminId,
      changes: params.changes || {},
      metadata: params.metadata || {},
      ipAddress: params.ipAddress || null,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('[AUDIT_LOG_ERROR]', error);
    // Don't throw - audit logging should never break the main operation
  }
};

/**
 * Get audit logs for a specific resource
 */
export const getResourceAuditLogs = async (
  resourceId: string,
  limit: number = 50
) => {
  return AuditLog.find({ resourceId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('adminId', 'firstName lastName email')
    .lean();
};

/**
 * Get audit logs by admin
 */
export const getAdminAuditLogs = async (
  adminId: string,
  limit: number = 100
) => {
  return AuditLog.find({ adminId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};
