import { Router } from 'express';
import { 
  submitReview,
  getEventReviews,
  checkReviewEligibility
} from './service';
import { handleError } from '../../utils/handleError';
import CustomError from '../../utils/CustomError';
import { Request, Response } from 'express';
import { isValidObjectId } from '../../utils/isValidObjectId';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.get('/check-eligibility/:eventId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if(!eventId || !isValidObjectId(eventId as string)){
      throw new CustomError('Event ID is required', 400);
    }

    const eligibility = await checkReviewEligibility(userId, eventId as string);

    res.json(eligibility);
  } catch (error: any) {
    return handleError(error, res);
  }
});

router.post('/:eventId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.sub;
    const { ticketId, rating, title, comment } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if(!eventId || !isValidObjectId(eventId as string)){
      throw new CustomError('Event ID is required', 400);
    }

    if(!ticketId || !isValidObjectId(ticketId as string)){
      throw new CustomError('Ticket ID is required', 400);
    }

    if(!rating || !Number.isInteger(rating) || rating < 1 || rating > 5){
      throw new CustomError('Rating must be an integer between 1 and 5', 400);
    }

    if(!title || !comment){
      throw new CustomError('Title and comment are required', 400);
    }

    const review = await submitReview({
      eventId,
      userId,
      ticketId,
      rating,
      title,
      comment
    });

    res.status(201).json({
      message: 'Review submitted successfully',
      review: {
        _id: review._id,
        status: review.status,
        submittedAt: review.submittedAt
      }
    });
  } catch (error: any) {
    console.error('Submit review error:', error);

    if (error.message?.includes('Cannot submit review:')) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to submit review' });
  }
});

router.get('/:eventId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.sub;

    if(!eventId || !isValidObjectId(eventId as string)){
      throw new CustomError('Event ID is required', 400);
    }

    if(!userId){
      throw new CustomError('User ID is required', 400);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getEventReviews(eventId as string, userId, page, limit);
    res.json(result);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

export default router;