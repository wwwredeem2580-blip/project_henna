import { Router } from 'express';
import { getEscalatedConversationsService, closeConversationService, getConversationStatsService } from './admin/service';
import { getUserConversationService, getSpecificConversationService } from './conversation/service';
import { requireAdmin, requireAuth } from '../../middlewares/auth';

const router = Router();

// Admin
router.get('/conversation/queue', requireAuth, requireAdmin, getEscalatedConversationsService);
router.patch('/conversation/:id/close', requireAuth, requireAdmin, closeConversationService);
router.get('/conversation/stats', requireAuth, requireAdmin, getConversationStatsService);

// User
router.get('/conversation', requireAuth, getUserConversationService);
router.get('/conversation/:id', requireAuth, getSpecificConversationService);

export default router;