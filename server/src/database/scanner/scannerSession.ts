import scannerSessionSchema from '../schema/scanner/ScannerSession.schema';
import mongoose from 'mongoose';

export const ScannerSession = mongoose.models.ScannerSession || 
  mongoose.model('ScannerSession', scannerSessionSchema);
