import { Router } from 'express';
import authRoutes from './modules/auth/router';
import mediaRoutes from './modules/media/router';
import supportRoutes from './modules/support/router';
import eventRoutes from './modules/event/router';
import hostRoutes from './modules/host/router';
import ticketRoutes from './modules/ticket/router';
import orderRoutes from './modules/order/router';
import reviewRoutes from './modules/review/router';
import publicRoutes from './modules/public/router';
import adminRoutes from './modules/admin/router'


const router = Router();

router.use('/auth', authRoutes);
router.use('/media', mediaRoutes);
router.use('/support', supportRoutes);
router.use('/event', eventRoutes);
router.use('/host', hostRoutes);
router.use('/ticket', ticketRoutes);
router.use('/order', orderRoutes);
router.use('/review', reviewRoutes);
router.use('/public', publicRoutes);
router.use('/admin', adminRoutes);

export default router;
