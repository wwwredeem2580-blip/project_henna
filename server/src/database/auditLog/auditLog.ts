import mongoose from 'mongoose';
import auditLogSchema from '../schema/AuditLog';

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
