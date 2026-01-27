import { Request, Response, Router } from "express";
import CustomError from "../../utils/CustomError";
import { verifyTicketService, getTicketsService } from "./service";
import { handleError } from "../../utils/handleError";
import { isValidObjectId } from "../../utils/isValidObjectId";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

router.post('/verify/:eventId', async (req: Request, res: Response) => {
  try {
    const { qrData } = req.body;
    const { eventId } = req.params;

    if(!isValidObjectId(eventId as string)) {
      throw new CustomError('Invalid event ID', 400);
    }

    // Call service layer
    const result = await verifyTicketService(qrData, eventId as string);

    res.json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    if(!req.user || !req.user.sub){
      throw new CustomError('User not found', 404);
    }
    const userId = req.user?.sub;

    if(!isValidObjectId(userId as string)) {
      throw new CustomError('Invalid user ID', 400);
    }

    const tickets = await getTicketsService(userId);
    res.json(tickets);
  } catch (error: any) {
    return handleError(error, res);
  }
});

export default router;