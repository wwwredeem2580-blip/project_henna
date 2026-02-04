import scannerDeviceSchema from '../schema/scanner/ScannerDevice.schema';
import mongoose from 'mongoose';

export const ScannerDevice = mongoose.models.ScannerDevice || 
  mongoose.model('ScannerDevice', scannerDeviceSchema);
