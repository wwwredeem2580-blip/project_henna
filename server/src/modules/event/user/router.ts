import { Router } from 'express';
import { 
  getUserEventsService,
} from './service';
import { handleError } from '../../../utils/handleError';

const router = Router();

router.get('/events', async (req, res) => {
  try {
    const userId = req.user?.sub;

    if(!userId){
      return res.status(401).json({ message: 'User not found' });
    }

    const result = await getUserEventsService(userId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching your events:', error);
    handleError(error, res);
  }
});

export default router;