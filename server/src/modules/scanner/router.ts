import { Router } from 'express';
import {
  createScannerSessionService,
  joinScannerSessionService,
  verifyTicketScanService,
  getSessionDetailsService,
  closeScannerSessionService
} from './service';
import { syncOfflineScansService } from './syncService';
import { handleError } from '../../utils/handleError';

const router = Router();

/**
 * POST /api/scanner/session/create
 * Create a new scanner session for an event (Host only)
 * Body: { eventId, maxDevices? }
 */
router.post('/session/create', async (req, res) => {
  try {
    const { eventId, maxDevices } = req.body;
    const hostId = (req as any).user?.userId; // Assuming auth middleware sets user

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
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const hostId = (req as any).user?.userId;

    if (!hostId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await getSessionDetailsService(sessionId, hostId);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

/**
 * POST /api/scanner/session/:sessionId/close
 * Close a scanner session (Host only)
 */
router.post('/session/:sessionId/close', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const hostId = (req as any).user?.userId;

    if (!hostId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await closeScannerSessionService(sessionId, hostId);
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

export default router;
