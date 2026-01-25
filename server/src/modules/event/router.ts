import { Router } from 'express';
import { 
  createEventService,
  submitEventService,
  updateEventService,
  updatePendingEventService,
  updateApprovedEventService,
  updatePublishedEventService,
  updateLiveEventService,
  updateStatusRejectedToDraftService,
  toggleSalesStatusService
 } from './host/service';
import { requireAuth, requireHost } from '../../middlewares/auth';

const router = Router();

router.post('/', requireAuth, requireHost, createEventService);
router.post('/submit/:eventId', requireAuth, requireHost, submitEventService);
router.put('/draft/:eventId', requireAuth, requireHost, updateEventService);
router.put('/pending/:eventId', requireAuth, requireHost, updatePendingEventService);
router.put('/approved/:eventId', requireAuth, requireHost, updateApprovedEventService);
router.put('/published/:eventId', requireAuth, requireHost, updatePublishedEventService);
router.put('/live/:eventId', requireAuth, requireHost, updateLiveEventService);
router.post('/rejected/:eventId', requireAuth, requireHost, updateStatusRejectedToDraftService);
router.post('/toggle-sales/:eventId', requireAuth, requireHost, toggleSalesStatusService);

export default router;