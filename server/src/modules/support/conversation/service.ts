import { Request, Response } from "express";
import { handleError } from "../../../utils/handleError";
import CustomError from "../../../utils/CustomError";
import { Support } from "../../../database/support/support";

export const getUserConversationService = async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const conversations = await Support.find({userId})
        .sort({ createdAt: -1 })
        .limit(20)
        .select('-messages');

      res.json({ conversations });

    } catch (error: any) {
        handleError(error, res);
    }
}

export const getSpecificConversationService = async (req: Request, res: Response) => {
    try {
        const conversationId = req.params.id;

        if (!conversationId) {
            return res.status(400).json({ error: 'conversationId is required' });
        }

        const conversation = await Support.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        res.json({ conversation });
    } catch (error: any) {
        handleError(error, res);
    }
}