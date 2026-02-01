import { Router } from 'express';
import { getHostProfileService, getHostTrustScoreService } from './service';
import { handleError } from '../../utils/handleError';
import CustomError from '../../utils/CustomError';
import { Request, Response } from 'express';
import { isValidObjectId } from '../../utils/isValidObjectId';

const router = Router();

router.get('/host/:hostId/trust-score', async (req: Request, res: Response) => {
  try {
    const { hostId } = req.params;
    if (!isValidObjectId(hostId as string)) {
      throw new CustomError('Invalid host ID', 400);
    }
    
    const result = await getHostTrustScoreService(hostId as string);

    res.json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

router.get('/host/:hostId', async (req: Request, res: Response) => {
  try {
    const { hostId } = req.params;
    if (!isValidObjectId(hostId as string)) {
      throw new CustomError('Invalid host ID', 400);
    }
    const result = await getHostProfileService(hostId as string);
    res.json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

export default router;