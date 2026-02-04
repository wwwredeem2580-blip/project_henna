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
 * Get all tickets for offline caching
 */
export const getTicketsForOfflineCacheService = async (sessionId: string, deviceId: string) => {
  if (!isValidObjectId(sessionId)) {
    throw new CustomError('Invalid session ID', 400);
  }

  // Find session
  const session = await ScannerSession.findById(sessionId);
  if (!session) {
    throw new CustomError('Session not found', 404);
  }

  if (session.sessionStatus !== 'active') {
    throw new CustomError('Session is not active', 400);
  }

  // Verify device belongs to this session
  const device = await ScannerDevice.findOne({
    _id: new mongoose.Types.ObjectId(deviceId),
    sessionId: session._id
  });

  if (!device) {
    throw new CustomError('Device not authorized for this session', 403);
  }

  // Get all valid tickets for this event
  const tickets = await Ticket.find({
    eventId: session.eventId,
    status: { $in: ['valid', 'cancelled', 'refunded'] } // Include all for proper offline validation
  }).select('ticketNumber ticketType status holderName');

  return {
    tickets: tickets.map(t => ({
      ticketId: t._id.toString(),
      ticketNumber: t.ticketNumber,
      ticketType: t.ticketType,
      status: t.status,
      holderName: t.holderName,
      eventId: session.eventId.toString()
    })),
    eventId: session.eventId.toString(),
    cachedAt: new Date()
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

/**
 * Join a scanner session (device registration)
 */
export const joinScannerSessionService = async (
  accessToken: string,
  deviceName: string,
  userAgent: string
) => {
  // Verify token
  let decoded: any;
  try {
    decoded = jwt.verify(accessToken, JWT_SECRET);
  } catch (error) {
    throw new CustomError('Invalid or expired access token', 401);
  }

  if (decoded.type !== 'scanner_session') {
    throw new CustomError('Invalid token type', 401);
  }

  // Find session
  const session = await ScannerSession.findOne({ accessToken });
  if (!session) {
    throw new CustomError('Scanner session not found', 404);
  }

  // Check if session is active
  if (!session.isActive()) {
    throw new CustomError('Scanner session is no longer active', 403);
  }

  // Check device limit
  if (!session.canAddDevice()) {
    throw new CustomError(`Maximum device limit (${session.maxDevices}) reached`, 403);
  }

  // Check if device already exists (by name and userAgent)
  let device = await ScannerDevice.findOne({
    sessionId: session._id,
    deviceName,
    userAgent
  });

  if (device) {
    // Device rejoining - update last seen
    await device.updateActivity();
  } else {
    // New device - create it
    device = new ScannerDevice({
      sessionId: session._id,
      deviceName,
      userAgent
    });
    await device.save();

    // Increment active device count
    session.activeDeviceCount += 1;
    await session.save();
  }

  // Get event details
  const event = await Event.findById(session.eventId);

  return {
    success: true,
    device: {
      _id: device._id,
      deviceName: device.deviceName,
      totalScans: device.totalScans,
      createdAt: device.createdAt
    },
    session: {
      _id: session._id,
      eventId: session.eventId,
      eventTitle: event?.title,
      eventDate: event?.schedule?.startDate,
      expiresAt: session.expiresAt
    }
  };
};

/**
 * Verify a ticket (scan)
 */
export const verifyTicketScanService = async (
  qrData: string,
  accessToken: string,
  deviceId: string
) => {
  // Verify session token
  let decoded: any;
  try {
    decoded = jwt.verify(accessToken, JWT_SECRET);
  } catch (error) {
    throw new CustomError('Invalid or expired access token', 401);
  }

  // Find session
  const session = await ScannerSession.findOne({ accessToken });
  if (!session || !session.isActive()) {
    throw new CustomError('Scanner session is not active', 403);
  }

  // Verify device belongs to session
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

  // Find ticket by QR code
  const ticket = await Ticket.findOne({ qrCode: qrData });
  if (!ticket) {
    // Log failed scan
    await new ScanLog({
      ticketId: null,
      eventId: session.eventId,
      sessionId: session._id,
      deviceId: device._id,
      scanResult: 'invalid',
      offlineScanned: false
    }).save();

    return {
      valid: false,
      reason: 'INVALID_QR',
      message: 'Ticket not found'
    };
  }

  // Verify ticket belongs to this event
  if (ticket.eventId.toString() !== session.eventId.toString()) {
    await new ScanLog({
      ticketId: ticket._id,
      eventId: session.eventId,
      sessionId: session._id,
      deviceId: device._id,
      scanResult: 'invalid',
      offlineScanned: false,
      ticketNumber: ticket.ticketNumber,
      deviceName: device.deviceName
    }).save();

    return {
      valid: false,
      reason: 'WRONG_EVENT',
      message: 'This ticket is for a different event'
    };
  }

  // Check ticket status
  if (ticket.status !== 'valid') {
    const scanResult = ticket.status === 'cancelled' ? 'cancelled' :
                       ticket.status === 'refunded' ? 'refunded' : 'invalid';

    await new ScanLog({
      ticketId: ticket._id,
      eventId: session.eventId,
      sessionId: session._id,
      deviceId: device._id,
      scanResult,
      offlineScanned: false,
      ticketNumber: ticket.ticketNumber,
      deviceName: device.deviceName
    }).save();

    return {
      valid: false,
      reason: 'TICKET_' + ticket.status.toUpperCase(),
      message: `Ticket is ${ticket.status}`
    };
  }

  // Check if already checked in
  if (ticket.checkInStatus === 'checked_in') {
    await new ScanLog({
      ticketId: ticket._id,
      eventId: session.eventId,
      sessionId: session._id,
      deviceId: device._id,
      scanResult: 'duplicate',
      offlineScanned: false,
      ticketNumber: ticket.ticketNumber,
      deviceName: device.deviceName
    }).save();

    return {
      valid: false,
      reason: 'ALREADY_CHECKED_IN',
      message: 'Ticket already used',
      checkedInAt: ticket.checkedInAt
    };
  }

  // Check if expired
  if (ticket.validUntil && new Date() > new Date(ticket.validUntil)) {
    await new ScanLog({
      ticketId: ticket._id,
      eventId: session.eventId,
      sessionId: session._id,
      deviceId: device._id,
      scanResult: 'expired',
      offlineScanned: false,
      ticketNumber: ticket.ticketNumber,
      deviceName: device.deviceName
    }).save();

    return {
      valid: false,
      reason: 'TICKET_EXPIRED',
      message: 'Ticket has expired'
    };
  }

  // All checks passed - mark ticket as checked in
  ticket.checkInStatus = 'checked_in';
  ticket.checkedInAt = new Date();
  ticket.checkedInBy = device._id as any;
  ticket.status = 'used';
  await ticket.save();

  // Log successful scan
  await new ScanLog({
    ticketId: ticket._id,
    eventId: session.eventId,
    sessionId: session._id,
    deviceId: device._id,
    scanResult: 'success',
    offlineScanned: false,
    ticketNumber: ticket.ticketNumber,
    deviceName: device.deviceName
  }).save();

  // Update device activity and scan count
  await device.incrementScans();

  return {
    valid: true,
    message: 'Ticket verified successfully',
    ticket: {
      ticketNumber: ticket.ticketNumber,
      ticketType: ticket.ticketType,
      eventTitle: ticket.eventTitle,
      checkedInAt: ticket.checkedInAt
    }
  };
};

/**
 * Get session details with active devices
 */
export const getSessionDetailsService = async (sessionId: string, hostId: string) => {
  if (!isValidObjectId(sessionId)) {
    throw new CustomError('Invalid session ID', 400);
  }

  const session = await ScannerSession.findById(sessionId);
  if (!session) {
    throw new CustomError('Session not found', 404);
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
    stats
  };
};

/**
 * Close a scanner session
 */
export const closeScannerSessionService = async (sessionId: string, hostId: string) => {
  if (!isValidObjectId(sessionId)) {
    throw new CustomError('Invalid session ID', 400);
  }

  const session = await ScannerSession.findById(sessionId);
  if (!session) {
    throw new CustomError('Session not found', 404);
  }

  // Verify ownership
  if (session.hostId.toString() !== hostId) {
    throw new CustomError('Unauthorized', 403);
  }

  await session.close();

  return {
    success: true,
    message: 'Scanner session closed successfully'
  };
};
