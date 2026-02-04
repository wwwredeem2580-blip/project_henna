import scanLogSchema from '../schema/scanner/ScanLog.schema';
import mongoose from 'mongoose';

export const ScanLog = mongoose.models.ScanLog || 
  mongoose.model('ScanLog', scanLogSchema);
