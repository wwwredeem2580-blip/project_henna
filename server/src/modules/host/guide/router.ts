import { Router, Request, Response } from "express";
import { getHostGuideProgressService, updateHostGuideProgressService } from "./service";
import { handleError } from "../../../utils/handleError";
import CustomError from "../../../utils/CustomError";

const router = Router();

// GET /api/host/guide - Get user progress
router.get("/", async (req: Request, res: Response) => {
    try {
        if (!req.user || !req.user.sub) {
            throw new CustomError("Unauthorized", 401);
        }
        
        const progress = await getHostGuideProgressService(req.user.sub);
        res.status(200).json(progress);
    } catch (error) {
        handleError(error, res);
    }
});

// POST /api/host/guide/progress - Update progress
router.post("/progress", async (req: Request, res: Response) => {
    try {
        if (!req.user || !req.user.sub) {
            throw new CustomError("Unauthorized", 401);
        }

        const { completedItems } = req.body;
        
        if (!Array.isArray(completedItems)) {
            throw new CustomError("completedItems must be an array of strings", 400);
        }

        const progress = await updateHostGuideProgressService(req.user.sub, completedItems);
        res.status(200).json(progress);
    } catch (error) {
        handleError(error, res);
    }
});

export default router;
