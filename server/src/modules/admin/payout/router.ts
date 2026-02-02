import { Router } from 'express';
import {
  getPayoutsService,
  getPayoutDetailsService,
  approvePayoutService,
  rejectPayoutService,
  putOnHoldService,
  processPayoutService,
} from './service';
import { handleError } from '../../../utils/handleError';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;

    const result = await getPayoutsService(page, limit, status);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

router.get('/:payoutId', async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await getPayoutDetailsService(
      req.params.payoutId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10
    );
    res.json(result);
  } catch (error: any) { // Keeping original error type annotation
    handleError(res, error);
  }
});

router.put('/:payoutId/approve', async (req, res) => {
  try {

    const { payoutId } = req.params;
    const { notes } = req.body;

    const result = await approvePayoutService(payoutId, notes);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

router.put('/:payoutId/reject', async (req, res) => {
  try {

    const { payoutId } = req.params;
    const { reason } = req.body;

    const result = await rejectPayoutService(payoutId, reason);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

router.put('/:payoutId/hold', async (req, res) => {
  try {

    const { payoutId } = req.params;
    const { reason } = req.body;

    const result = await putOnHoldService(payoutId, reason);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

router.put('/:payoutId/process', async (req, res) => {
  try {

    const { payoutId } = req.params;

    const result = await processPayoutService(payoutId);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});



export default router;