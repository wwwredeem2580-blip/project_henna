import { Router } from 'express';
import { requireAdmin, requireAuth } from '../../middlewares/auth';
import eventRouter from './event/router';
import orderRouter from './order/router';
import payoutRouter from './payout/router';

const router = Router();

router.use('/event', requireAuth, requireAdmin, eventRouter);
router.use('/order', requireAuth, requireAdmin, orderRouter);
router.use('/payout', requireAuth, requireAdmin, payoutRouter);

export default router;
