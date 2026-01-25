import { Router } from 'express';
import authRoutes from './modules/auth/router';
import mediaRoutes from './modules/media/router';
import supportRoutes from './modules/support/router';
import eventRoutes from './modules/event/router';


const router = Router();

router.use('/auth', authRoutes);
router.use('/media', mediaRoutes);
router.use('/support', supportRoutes);
router.use('/event', eventRoutes);

export default router;
