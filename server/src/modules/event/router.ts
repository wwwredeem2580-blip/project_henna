import { Router } from 'express';
import { requireAuth, requireHost } from '../../middlewares/auth';
import publicRouter from './public/router';
import userRouter from './user/router';
import hostRouter from './host/router';

const router = Router();

router.use('/public', publicRouter);
router.use('/user', requireAuth, userRouter);
router.use('/host', requireAuth, requireHost, hostRouter);

export default router;
