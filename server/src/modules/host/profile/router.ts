import { Request, Response, Router } from "express";
import CustomError from "../../../utils/CustomError";
import { getHostProfileService } from "./service";
import { handleError } from "../../../utils/handleError";

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    if(!req.user) {
        throw new CustomError('User not found', 404);
    }
    
    const userId = req.user?.sub;
    const result = await getHostProfileService(userId);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

export default router;