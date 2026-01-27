import { Router } from 'express';
import { 
  createOrderService,
  handleBkashCallbackService,
  getOrderService
} from './service';
import { handleError } from '../../utils/handleError';
import CustomError from '../../utils/CustomError';
import { Request, Response } from 'express';
import { isValidObjectId } from '../../utils/isValidObjectId';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.sub) {
      throw new CustomError('Unauthorized', 401);
    }

    const userId = req.user.sub;
    
    const orderData = {
      eventId: req.body.eventId,
      tickets: req.body.tickets,
      paymentMethod: req.body.paymentMethod,
      userId,
      buyerEmail: req.user.email,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    };

    const result = await createOrderService(orderData);
    
    res.status(201).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.sub) {
      throw new CustomError('User not found', 404);
    }

    const { orderId } = req.query;
    if(!orderId || !isValidObjectId(orderId as string)){
      throw new CustomError('Order ID is required', 400);
    }

    const userId = req.user.sub;
    const result = await getOrderService(orderId as string, userId);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

router.get('/bkash/callback', async (req, res) => {
  try {
    const { orderId } = req.query;
    const { paymentId } = req.query;
    console.log(orderId, paymentId);
    if (!orderId || !paymentId || !isValidObjectId(orderId as string)) {
      throw new CustomError('Invalid order ID or payment ID', 400);
    }
    const result = await handleBkashCallbackService(orderId as string, paymentId as string);
    
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

export default router;