import { Router } from 'express';
import { requireAuth, requireHost } from '../../middlewares/auth';
import analyticsRouter from './analytics/router';
import eventRouter from './event/router';
import profileRouter from './profile/router';


const router = Router();

router.use('/analytics', requireAuth, requireHost, analyticsRouter);
router.use('/event', requireAuth, requireHost, eventRouter);
router.use('/profile', requireAuth, requireHost, profileRouter);

export default router;
