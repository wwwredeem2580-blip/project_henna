import { Router } from 'express';
import {
  createScannerSessionService,
  joinScannerSessionService,
  verifyTicketScanService,
  getSessionDetailsService,
  closeScannerSessionService,
  getActiveSessionByEventService,
  getTicketsForOfflineCacheService,
  generatePairingOTPService,
  verifyPairingOTPService,
  disableDeviceService,
  enableDeviceService,
  forceLogoutDeviceService,
  updateDeviceStatusService,
  lookupTicketByIdService,
  manualCheckInService
} from './service';
import { syncOfflineScansService } from './syncService';
import { handleError } from '../../utils/handleError';
import { requireAuth, requireHost } from '../../middlewares/auth';

const router = Router();

/**
 * POST /api/scanner/session/create
 * Create a new scanner session for an event (Host only)
 * Body: { eventId, maxDevices? }
 */
router.post('/session/create', requireAuth, requireHost, async (req, res) => {
  try {
    const { eventId, maxDevices } = req.body;
    const hostId = (req as any).user?.sub; // Assuming auth middleware sets user

    if (!hostId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!eventId) {
      return res.status(400).json({ error: 'eventId is required' });
    }

    const result = await createScannerSessionService(eventId, hostId, maxDevices);
    res.status(201).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

/**
 * GET /api/scanner/session/event/:eventId
 * Get active scanner session for an event (Host only)
 */
router.get('/session/event/:eventId', requireAuth, requireHost, async (req, res) => {
  try {
    const { eventId } = req.params;
    const hostId = (req as any).user?.sub;

    if (!hostId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await getActiveSessionByEventService(eventId as string, hostId);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

/**
 * GET /api/scanner/tickets/:sessionId
 * Get all tickets for offline caching
 * Query: deviceId
 */
router.get('/tickets/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const deviceId = req.query.deviceId as string;

    if (!deviceId || typeof deviceId !== 'string') {
      return res.status(400).json({ error: 'Device ID required' });
    }

    const result = await getTicketsForOfflineCacheService(sessionId, deviceId);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

/**
 * POST /api/scanner/session/:sessionId/generate-otp
 * Generate OTP for device pairing (Host only)
 */
router.post('/session/:sessionId/generate-otp', requireAuth, requireHost, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const hostId = (req as any).user?.sub;

    if (!hostId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await generatePairingOTPService(sessionId as string, hostId);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

/**
 * POST /api/scanner/session/verify-otp
 * Verify OTP before joining session (Public)
 * Body: { accessToken, otpCode }
 */
router.post('/session/verify-otp', async (req, res) => {
  try {
    const { accessToken, otpCode } = req.body;

    if (!accessToken || !otpCode) {
      return res.status(400).json({ error: 'Access token and OTP code required' });
    }

    const result = await verifyPairingOTPService(accessToken, otpCode);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

/**
 * POST /api/scanner/session/join
 * Join a scanner session (device registration)
 * Body: { accessToken, deviceName }
 */
router.post('/session/join', async (req, res) => {
  try {
    const { accessToken, deviceName } = req.body;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    if (!accessToken || !deviceName) {
      return res.status(400).json({ error: 'accessToken and deviceName are required' });
    }

    const result = await joinScannerSessionService(accessToken, deviceName, userAgent);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

/**
 * POST /api/scanner/verify
 * Verify a ticket (scan)
 * Body: { qrData, accessToken, deviceId }
 */
router.post('/verify', async (req, res) => {
  try {
    const { qrData, accessToken, deviceId } = req.body;

    if (!qrData || !accessToken || !deviceId) {
      return res.status(400).json({ error: 'qrData, accessToken, and deviceId are required' });
    }

    const result = await verifyTicketScanService(qrData, accessToken, deviceId);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

/**
 * GET /api/scanner/session/:sessionId
 * Get session details with devices and stats (Host only)
 */
router.get('/session/:sessionId', requireAuth, requireHost, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const hostId = (req as any).user?.sub;

    if (!hostId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await getSessionDetailsService(sessionId as string, hostId);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

/**
 * POST /api/scanner/session/:sessionId/close
 * Close a scanner session (Host only)
 */
router.post('/session/:sessionId/close', requireAuth, requireHost, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const hostId = (req as any).user?.sub;

    if (!hostId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await closeScannerSessionService(sessionId as string, hostId);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

/**
 * PUT /api/scanner/device/:deviceId/disable
 * Disable a device (Host only)
 * Body: { sessionId }
 */
router.put('/device/:deviceId/disable', requireAuth, requireHost, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { sessionId } = req.body;
    const hostId = (req as any).user?.sub;

    if (!hostId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const result = await disableDeviceService(deviceId as string, sessionId, hostId);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

/**
 * PUT /api/scanner/device/:deviceId/enable
 * Re-enable a disabled device (Host only)
 * Body: { sessionId }
 */
router.put('/device/:deviceId/enable', requireAuth, requireHost, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { sessionId } = req.body;
    const hostId = (req as any).user?.sub;

    if (!hostId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const result = await enableDeviceService(deviceId as string, sessionId, hostId);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

/**
 * POST /api/scanner/device/:deviceId/logout
 * Force logout a device (Host only)
 * Body: { sessionId }
 */
router.post('/device/:deviceId/logout', requireAuth, requireHost, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { sessionId } = req.body;
    const hostId = (req as any).user?.sub;

    if (!hostId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const result = await forceLogoutDeviceService(deviceId as string, sessionId, hostId);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

/**
 * PUT /api/scanner/device/:deviceId/status
 * Update device status (Device updates own status)
 * Body: { battery?, gate?, lastScanAt? }
 */
router.put('/device/:deviceId/status', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { battery, gate, lastScanAt } = req.body;

    const updates: any = {};
    if (battery !== undefined) updates.battery = battery;
    if (gate !== undefined) updates.gate = gate;
    if (lastScanAt !== undefined) updates.lastScanAt = new Date(lastScanAt);

    const result = await updateDeviceStatusService(deviceId, updates);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

/**
 * POST /api/scanner/sync
 * Sync offline scans from PWA to server
 * Body: { accessToken, deviceId, scans: [{ ticketId, qrData, scanTimestamp, localScanId }] }
 */
router.post('/sync', async (req, res) => {
  try {
    const { accessToken, deviceId, scans } = req.body;

    if (!accessToken || !deviceId || !scans || !Array.isArray(scans)) {
      return res.status(400).json({ 
        error: 'accessToken, deviceId, and scans array are required' 
      });
    }

    const result = await syncOfflineScansService(accessToken, deviceId, scans);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});


/**
 * POST /api/scanner/session/:sessionId/lookup-ticket
 * Emergency manual verification - lookup ticket by ID
 * Host only
 */
router.post('/session/:sessionId/lookup-ticket', requireAuth, requireHost, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { ticketId } = req.body;
    const hostId = (req as any).user?.sub;

    if (!hostId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!ticketId) {
      return res.status(400).json({ error: 'ticketId is required' });
    }

    const result = await lookupTicketByIdService(ticketId, sessionId as string, hostId);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

/**
 * POST /api/scanner/session/:sessionId/manual-checkin
 * Emergency manual check-in with audit trail
 * Host only
 */
router.post('/session/:sessionId/manual-checkin', requireAuth, requireHost, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { ticketId, notes } = req.body;
    const hostId = (req as any).user?.sub;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string;

    if (!hostId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!ticketId) {
      return res.status(400).json({ error: 'ticketId is required' });
    }

    const result = await manualCheckInService(ticketId, sessionId as string, hostId, notes, ipAddress);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});


export default router;

// Import PDF generation service
import { generateTicketSheetPDF } from './ticketSheetService';

/**
 * GET /api/scanner/event/:eventId/ticket-sheet
 * Generate and download ticket sheet PDF on-demand
 * Host only
 */
router.get('/event/:eventId/ticket-sheet', requireAuth, requireHost, async (req, res) => {
  try {
    const { eventId } = req.params;
    const hostId = (req as any).user?.sub;

    if (!hostId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Generate or get cached PDF
    const { pdf, ticketCount, generatedAt } = await generateTicketSheetPDF(eventId as string, hostId);

    // Log download (simple console log for now)
    console.log({
      type: 'TICKET_SHEET_DOWNLOAD',
      eventId,
      hostId,
      ticketCount,
      success: true,
      timestamp: new Date()
    });

    // Stream PDF with metadata headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ticket-sheet-${eventId}.pdf"`);
    res.setHeader('Content-Length', pdf.length.toString());
    res.setHeader('X-Ticket-Count', ticketCount.toString());
    res.setHeader('X-Generated-At', generatedAt.toISOString());

    res.send(pdf);
  } catch (error: any) {
    // Log failed download
    console.error({
      type: 'TICKET_SHEET_DOWNLOAD_FAILED',
      eventId: req.params.eventId,
      hostId: (req as any).user?.sub,
      error: error.message,
      timestamp: new Date()
    });

    return handleError(error, res);
  }
});
