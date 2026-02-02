import { Router } from 'express';
import {
  getEventsService,
  getEventService,
  approveEventService,
  rejectEventService,
  featureEventService,
  unfeatureEventService,
  suspendEventService,
  unsuspendEventService,
  toggleSalesPauseService,
  toggleEventVisibilityService,
  withdrawApprovedEventService,
  adminDeleteEventService,
  getVerificationDocumentLinkService
} from './service';
import { handleError } from '../../../utils/handleError';

const router = Router();

router.put('/approve/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const result = await approveEventService(eventId);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

router.put('/reject/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { rejectionReason } = req.body;
    const result = await rejectEventService(eventId, rejectionReason);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

router.put('/feature/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { priority } = req.body;
    const result = await featureEventService(eventId, priority);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

router.put('/unfeature/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const result = await unfeatureEventService(eventId);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

router.put('/suspend/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { reason } = req.body;
    const result = await suspendEventService(eventId, reason);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

router.put('/unsuspend/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const result = await unsuspendEventService(eventId);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

router.put('/toggle-sales/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const result = await toggleSalesPauseService(eventId);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

router.put('/toggle-visibility/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const result = await toggleEventVisibilityService(eventId);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

router.put('/withdraw/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const result = await withdrawApprovedEventService(eventId);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

router.delete('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const result = await adminDeleteEventService(eventId);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

router.get('/', async (req, res) => {
  try {
    const { status, hostId, search, page, limit } = req.query;
    const result = await getEventsService({
      status: status as string,
      hostId: hostId as string,
      search: search as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

router.get('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const result = await getEventService(eventId);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

router.get('/verification-document-link/:docKey', async (req, res) => {
  try {
    const { docKey } = req.params;
    const result = await getVerificationDocumentLinkService(docKey);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});


export default router;