import { ScannerSession } from '../../database/scanner/scannerSession';
import { ScannerDevice } from '../../database/scanner/scannerDevice';
import { ScanLog } from '../../database/scanner/scanLog';
import { Event } from '../../database/event/event';
import { Ticket } from '../../database/ticket/ticket';
import CustomError from '../../utils/CustomError';
import { isValidObjectId } from '../../utils/isValidObjectId';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Get active scanner session for an event
 */
export const getActiveSessionByEventService = async (eventId: string, hostId: string) => {
  if (!isValidObjectId(eventId)) {
    throw new CustomError('Invalid event ID', 400);
  }

  // Find active session for this event
  const session = await ScannerSession.findOne({
    eventId: new mongoose.Types.ObjectId(eventId),
    sessionStatus: 'active'
  });

  if (!session) {
    return null; // No active session
  }

  // Verify ownership
  if (session.hostId.toString() !== hostId) {
    throw new CustomError('Unauthorized', 403);
  }

  // Get active devices
  const devices = await ScannerDevice.find({ sessionId: session._id })
    .sort({ createdAt: -1 });

  // Get scan statistics
  const scanStats = await ScanLog.aggregate([
    { $match: { sessionId: session._id } },
    {
      $group: {
        _id: '$scanResult',
        count: { $sum: 1 }
      }
    }
  ]);

  const stats = {
    total: 0,
    success: 0,
    duplicate: 0,
    invalid: 0,
    expired: 0,
    cancelled: 0,
    refunded: 0
  };

  scanStats.forEach((stat: any) => {
    stats[stat._id as keyof typeof stats] = stat.count;
    stats.total += stat.count;
  });

  // Generate scanner URL
  const scannerUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/scanner?token=${session.accessToken}`;

  return {
    session: {
      _id: session._id,
      eventId: session.eventId,
      sessionStatus: session.sessionStatus,
      maxDevices: session.maxDevices,
      activeDeviceCount: session.activeDeviceCount,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt
    },
    devices: devices.map(d => ({
      _id: d._id,
      deviceName: d.deviceName,
      totalScans: d.totalScans,
      lastSeen: d.lastSeen,
      isOnline: d.isOnline,
      createdAt: d.createdAt
    })),
    stats,
    scannerUrl
  };
};

/**
 * Create a new scanner session for an event
 */
export const createScannerSessionService = async (
  eventId: string,
  hostId: string,
  maxDevices: number = 5
) => {
  if (!isValidObjectId(eventId)) {
    throw new CustomError('Invalid event ID', 400);
  }

  if (!isValidObjectId(hostId)) {
    throw new CustomError('Invalid host ID', 400);
  }

  // Verify event exists and belongs to host
  const event = await Event.findById(eventId);
  if (!event) {
    throw new CustomError('Event not found', 404);
  }

  if (event.hostId.toString() !== hostId) {
    throw new CustomError('Unauthorized: You do not own this event', 403);
  }

  // Check if active session already exists
  const existingSession = await ScannerSession.findOne({
    eventId: new mongoose.Types.ObjectId(eventId),
    sessionStatus: 'active'
  });

  if (existingSession) {
    throw new CustomError('An active scanner session already exists for this event', 400);
  }

  // Calculate expiry time (event end + 3 hours)
  const eventEndDate = event.schedule?.endDate || event.schedule?.startDate;
  if (!eventEndDate) {
    throw new CustomError('Event must have a schedule with end date', 400);
  }

  const expiresAt = new Date(eventEndDate);
  expiresAt.setHours(expiresAt.getHours() + 3);

  // Generate session access token (JWT)
  const accessToken = jwt.sign(
    {
      sessionId: new mongoose.Types.ObjectId().toString(),
      eventId,
      hostId,
      type: 'scanner_session'
    },
    JWT_SECRET,
    { expiresIn: '7d' } // Token valid for 7 days or until session closes
  );

  // Create session
  const session = new ScannerSession({
    eventId: new mongoose.Types.ObjectId(eventId),
    hostId: new mongoose.Types.ObjectId(hostId),
    accessToken,
    maxDevices,
    expiresAt
  });

  await session.save();

  // Generate scanner access URL
  const scannerUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/scanner?token=${accessToken}`;

  return {
    success: true,
    session: {
      _id: session._id,
      eventId: session.eventId,
      eventTitle: event.title,
      sessionStatus: session.sessionStatus,
      maxDevices: session.maxDevices,
      activeDeviceCount: session.activeDeviceCount,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt
    },
    scannerUrl,
    accessToken
  };
};

// ... rest of the file remains the same
