import { Request, Response, Router } from "express";
import CustomError from "../../../utils/CustomError";
import { getHostEventsService, getHostEventService, publishEventService } from "./service";
import { handleError } from "../../../utils/handleError";
import { isValidObjectId } from "../../../utils/isValidObjectId";

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    if(!req.user) {
        throw new CustomError('User not found', 404);
      }
      
      const userId = req.user?.sub;
      const limit = parseInt(req.query.limit as string) || 5;
      const page = parseInt(req.query.page as string) || 1;
      const filters = {
        status: req.query.status as string,
        dateRange: {
          start: req.query.startDate as string,
          end: req.query.endDate as string
        },
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as string,
      };
      const result = await getHostEventsService(userId, page, limit, filters);
      res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

router.get('/:eventId', async (req: Request, res: Response) => {
  try {
    if(!req.user) {
      throw new CustomError('User not found', 404);
    }
    const userId = req.user?.sub;
    const eventId = req.params?.eventId;

    if(!isValidObjectId(eventId as string)) {
      throw new CustomError('Invalid event ID', 400);
    }

    const result = await getHostEventService(userId, eventId as string);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

router.put('/:eventId/publish', async (req: Request, res: Response) => {
  try {
    if(!req.user) {
      throw new CustomError('User not found', 404);
    }
    const userId = req.user?.sub;
    const eventId = req.params?.eventId;

    if(!isValidObjectId(eventId as string)) {
      throw new CustomError('Invalid event ID', 400);
    }

    const result = await publishEventService(eventId as string, userId);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

export default router;