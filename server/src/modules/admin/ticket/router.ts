import { Router } from 'express';
import {
  getTicketsService,
  updateTicketStatusService,
  manualCheckInService,
  getEventTicketsService,
  verifyTicketService
} from './service';
import { handleError } from '../../../utils/handleError';
import CustomError from '../../../utils/CustomError';
import { isValidObjectId } from '../../../utils/isValidObjectId';

const router = Router();

// ========================================
// TICKET MANAGEMENT ROUTES
// ========================================

/**
 * GET /api/admin/ticket
 * Get paginated tickets with filters (cursor-based)
 * Query params: cursor, limit, status, eventId, orderId, email, ticketNumber
 */
router.get('/', async (req, res) => {
  try {
    const cursor = (req.query.cursor as string) || null;
    const limit = parseInt(req.query.limit as string) || 50;
    const filters = {
      status: req.query.status as string,
      eventId: req.query.eventId as string,
      orderId: req.query.orderId as string,
      email: req.query.email as string,
      ticketNumber: req.query.ticketNumber as string
    };

    const result = await getTicketsService(cursor, limit, filters);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

/**
 * PUT /api/admin/ticket/:ticketId/status
 * Update ticket status with validation
 * Body: { newStatus, adminId, reason? }
 */
router.put('/:ticketId/status', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { newStatus, adminId, reason } = req.body;

    if (!newStatus || !adminId) {
      return res.status(400).json({ error: 'newStatus and adminId are required' });
    }

    const result = await updateTicketStatusService(ticketId, newStatus, adminId, reason);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

/**
 * POST /api/admin/ticket/:ticketId/checkin
 * Manual check-in with validation
 * Body: { adminId }
 */
router.post('/:ticketId/checkin', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { adminId } = req.body;

    if (!adminId) {
      return res.status(400).json({ error: 'adminId is required' });
    }

    const result = await manualCheckInService(ticketId, adminId);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

/**
 * GET /api/admin/ticket/event/:eventId
 * Get all tickets for an event with enriched data (paginated)
 * Query params: cursor, limit
 */
router.get('/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const cursor = (req.query.cursor as string) || null;
    const limit = parseInt(req.query.limit as string) || 100;

    const result = await getEventTicketsService(eventId, cursor, limit);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

router.post('/verify/:eventId', async (req, res) => {
  try {
    if(!req.body || !req.body.qrData){
      throw new CustomError('Invalid request body', 400);
    }
    const { qrData } = req.body;
    const { eventId } = req.params;

    if(!isValidObjectId(eventId as string)) {
      throw new CustomError('Invalid event ID', 400);
    }

    // Call service layer
    const result = await verifyTicketService(qrData, eventId as string);

    res.json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

export default router;
