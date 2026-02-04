import { ScanLog } from '../../database/scanner/scanLog';
import { ScannerSession } from '../../database/scanner/scannerSession';
import { ScannerDevice } from '../../database/scanner/scannerDevice';
import { Ticket } from '../../database/ticket/ticket';
import CustomError from '../../utils/CustomError';
import { isValidObjectId } from '../../utils/isValidObjectId';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface OfflineScan {
  ticketId: string;
  qrData: string;
  scanTimestamp: string;
  localScanId: string;
}

/**
 * Sync offline scans from PWA to server
 */
export const syncOfflineScansService = async (
  accessToken: string,
  deviceId: string,
  scans: OfflineScan[]
) => {
  // Verify token
  let decoded: any;
  try {
    decoded = jwt.verify(accessToken, JWT_SECRET);
  } catch (error) {
    throw new CustomError('Invalid or expired access token', 401);
  }

  // Find session
  const session = await ScannerSession.findOne({ accessToken });
  if (!session) {
    throw new CustomError('Scanner session not found', 404);
  }

  // Verify device
  if (!isValidObjectId(deviceId)) {
    throw new CustomError('Invalid device ID', 400);
  }

  const device = await ScannerDevice.findOne({
    _id: new mongoose.Types.ObjectId(deviceId),
    sessionId: session._id
  });

  if (!device) {
    throw new CustomError('Device not found in this session', 404);
  }

  const results = {
    accepted: [] as string[],
    rejected: [] as { localScanId: string; reason: string }[],
    conflicts: [] as { localScanId: string; reason: string }[]
  };

  // Process each scan
  for (const scan of scans) {
    try {
      // Find ticket
      const ticket = await Ticket.findOne({ qrCode: scan.qrData });

      if (!ticket) {
        results.rejected.push({
          localScanId: scan.localScanId,
          reason: 'Ticket not found'
        });
        continue;
      }

      // Check if already scanned (duplicate detection)
      const existingScan = await ScanLog.findOne({
        ticketId: ticket._id,
        eventId: session.eventId,
        scanResult: 'success'
      });

      if (existingScan) {
        // Conflict - ticket already scanned
        results.conflicts.push({
          localScanId: scan.localScanId,
          reason: 'Ticket already scanned'
        });

        // Still log it as duplicate
        await new ScanLog({
          ticketId: ticket._id,
          eventId: session.eventId,
          sessionId: session._id,
          deviceId: device._id,
          scanTimestamp: new Date(scan.scanTimestamp),
          scanResult: 'duplicate',
          offlineScanned: true,
          syncedAt: new Date(),
          ticketNumber: ticket.ticketNumber,
          deviceName: device.deviceName
        }).save();

        continue;
      }

      // Validate ticket
      if (ticket.eventId.toString() !== session.eventId.toString()) {
        results.rejected.push({
          localScanId: scan.localScanId,
          reason: 'Wrong event'
        });
        continue;
      }

      if (ticket.status !== 'valid') {
        results.rejected.push({
          localScanId: scan.localScanId,
          reason: `Ticket is ${ticket.status}`
        });
        continue;
      }

      // Accept the scan - mark ticket as used
      ticket.checkInStatus = 'checked_in';
      ticket.checkedInAt = new Date(scan.scanTimestamp);
      ticket.checkedInBy = device._id as any;
      ticket.status = 'used';
      await ticket.save();

      // Log the scan
      await new ScanLog({
        ticketId: ticket._id,
        eventId: session.eventId,
        sessionId: session._id,
        deviceId: device._id,
        scanTimestamp: new Date(scan.scanTimestamp),
        scanResult: 'success',
        offlineScanned: true,
        syncedAt: new Date(),
        ticketNumber: ticket.ticketNumber,
        deviceName: device.deviceName
      }).save();

      results.accepted.push(scan.localScanId);

      // Increment device scan count
      device.totalScans += 1;
    } catch (error) {
      results.rejected.push({
        localScanId: scan.localScanId,
        reason: 'Processing error'
      });
    }
  }

  // Update device activity
  device.lastSeen = new Date();
  await device.save();

  return {
    success: true,
    synced: results.accepted.length,
    rejected: results.rejected.length,
    conflicts: results.conflicts.length,
    results
  };
};
