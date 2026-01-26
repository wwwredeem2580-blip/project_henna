import { Request, Response, Router } from "express";
import CustomError from "../../../utils/CustomError";
import { getHostMetricesService, getRevenueChartService, getHostOrdersService } from "./service";
import { handleError } from "../../../utils/handleError";

const router = Router();

router.get('/metrics', async (req: Request, res: Response) => {
  try {
    if(!req.user) {
      throw new CustomError('User not found', 401);
    }
    const userId = req.user.sub;
    const result = await getHostMetricesService(userId);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

router.get('/revenue-chart', async (req: Request, res: Response) => {
  try {
    if(!req.user) {
      throw new CustomError('User not found', 401);
    }
    const userId = req.user.sub;
    const period = req.query.period as string;
    
    const result = await getRevenueChartService(userId, period);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

router.get('/orders', async (req: Request, res: Response) => {
  try {
    if(!req.user) {
      throw new CustomError('User not found', 401);
    }
    const userId = req.user.sub;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filters = {
      eventId: req.query.eventId as string,
      status: req.query.status as string,
      search: req.query.search as string
    };
    
    const result = await getHostOrdersService(userId, page, limit, filters);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

export default router;