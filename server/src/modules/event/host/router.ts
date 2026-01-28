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
  toggleSalesStatusService,
  deleteEventService,
  getDraftEventsService
} from './service';
import { handleError } from '../../../utils/handleError';
import { isValidObjectId } from '../../../utils/isValidObjectId';

const router = Router();

router.get('/draft/:eventId', async (req, res) => {
  try {
    const hostId = req.user?.sub;
    const eventId = req.params.eventId;

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    
    if (!hostId) {
      return res.status(401).json({ message: "Host not found" });
    }

    const result = await getDraftEventsService(hostId, eventId);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating event:', error);
    handleError(error, res);
  }
});

router.post('/', async (req, res) => {
  try {
    const hostId = req.user?.sub;
    
    if (!hostId) {
      return res.status(401).json({ message: "Host not found" });
    }

    const result = await createEventService(hostId, req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating event:', error);
    handleError(error, res);
  }
});

router.post('/submit/:eventId', async (req, res) => {
  try {
    const hostId = req.user?.sub;
    const eventId = req.params.eventId;

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    
    if (!hostId) {
      return res.status(401).json({ message: "Host not found" });
    }

    const result = await submitEventService(hostId, eventId, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error creating event:', error);
    handleError(error, res);
  }
});

router.put('/draft/:eventId', async (req, res) => {
  try {
    const hostId = req.user?.sub;
    const eventId = req.params.eventId;

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    
    if (!hostId) {
      return res.status(401).json({ message: "Host not found" });
    }

    const result = await updateEventService(hostId, eventId, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating event:', error);
    handleError(error, res);
  }
});

router.put('/pending/:eventId', async (req, res) => {
  try {
    const hostId = req.user?.sub;
    const eventId = req.params.eventId;

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    
    if (!hostId) {
      return res.status(401).json({ message: "Host not found" });
    }

    const result = await updatePendingEventService(hostId, eventId, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating event:', error);
    handleError(error, res);
  }
});

router.put('/approved/:eventId', async (req, res) => {
  try {
    const hostId = req.user?.sub;
    const eventId = req.params.eventId;

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    
    if (!hostId) {
      return res.status(401).json({ message: "Host not found" });
    }

    const result = await updateApprovedEventService(hostId, eventId, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating event:', error);
    handleError(error, res);
  }
});

router.put('/published/:eventId', async (req, res) => {
  try {
    const hostId = req.user?.sub;
    const eventId = req.params.eventId;

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    
    if (!hostId) {
      return res.status(401).json({ message: "Host not found" });
    }

    const result = await updatePublishedEventService(hostId, eventId, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating event:', error);
    handleError(error, res);
  }
});

router.put('/live/:eventId', async (req, res) => {
  try {
    const hostId = req.user?.sub;
    const eventId = req.params.eventId;

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    
    if (!hostId) {
      return res.status(401).json({ message: "Host not found" });
    }

    const result = await updateLiveEventService(hostId, eventId, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating event:', error);
    handleError(error, res);
  }
});

router.delete('/:eventId', async (req, res) => {
  try {
    const hostId = req.user?.sub;
    const eventId = req.params.eventId;

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    
    if (!hostId) {
      return res.status(401).json({ message: "Host not found" });
    }

    const result = await deleteEventService(hostId, eventId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error deleting event:', error);
    handleError(error, res);
  }
});

router.post('/rejected/:eventId', async (req, res) => {
  try {
    const hostId = req.user?.sub;
    const eventId = req.params.eventId;

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    
    if (!hostId) {
      return res.status(401).json({ message: "Host not found" });
    }

    const result = await updateStatusRejectedToDraftService(hostId, eventId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating event:', error);
    handleError(error, res);
  }
});

router.post('/toggle-sales/:eventId', async (req, res) => {
  try {
    const hostId = req.user?.sub;
    const eventId = req.params.eventId;

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    
    if (!hostId) {
      return res.status(401).json({ message: "Host not found" });
    }

    const result = await toggleSalesStatusService(hostId, eventId, req.body.reason);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating event:', error);
    handleError(error, res);
  }
});

export default router;