import { Router } from 'express';
import {
  getOrdersService,
  refundOrderService,
} from './service';
import { handleError } from '../../../utils/handleError';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filters = {
      status: req.query.status && req.query.status as string,
      search: req.query.search && req.query.search as string,
    };

    const result = await getOrdersService(page, limit, filters);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

router.put('/:orderId/refund', async (req, res) => {
  try {

    const { orderId } = req.params;
    const { amount, reason, refundType } = req.body;

    const result = await refundOrderService(orderId, amount, reason, refundType);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});



export default router;