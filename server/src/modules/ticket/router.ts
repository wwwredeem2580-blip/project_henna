import { Request, Response, Router } from "express";
import CustomError from "../../utils/CustomError";
import { getTicketsService } from "./service";
import { handleError } from "../../utils/handleError";
import { isValidObjectId } from "../../utils/isValidObjectId";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

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