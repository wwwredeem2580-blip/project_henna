import { Request, Response } from "express";
import { handleError } from "../../../utils/handleError";
import { Support } from "../../../database/support/support";

export const getEscalatedConversationsService = async (req: Request, res: Response) => {
    try {
      const conversations = await Support.find({
        status: { $in: ['escalated', 'active'] }
      })
      .sort({ urgent: -1, escalatedAt: 1 })
      .limit(50);

      res.json({ conversations });

    } catch (error: any) {
      handleError(error, res);
    }
}

export const closeConversationService = async (req: Request, res: Response) => {
    try {
        const conversationId = req.params.id;

        if (!conversationId) {
            return res.status(400).json({ error: 'conversationId is required' });
        }

        const conversation = await Support.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        conversation.status = 'closed';
        await conversation.save();

        res.json({ message: 'Conversation closed', conversation });
    } catch (error: any) {
        handleError(error, res);
    }
}

export const getConversationStatsService = async (req: Request, res: Response) => {
    try {
      const [totalConversations, activeConversations, escalatedConversations, closedToday] = await Promise.all([
        Support.countDocuments(),
        Support.countDocuments({ status: 'active' }),
        Support.countDocuments({ status: 'escalated' }),
        Support.countDocuments({
          status: 'closed',
          closedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        })
      ]);

      res.json({
        stats: {
          total: totalConversations,
          active: activeConversations,
          escalated: escalatedConversations,
          closedToday
        }
      });
    } catch (error: any) {
      handleError(error, res);
    }
}