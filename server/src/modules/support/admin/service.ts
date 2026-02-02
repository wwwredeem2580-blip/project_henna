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

export const joinConversationService = async (req: Request, res: Response) => {
    try {
        const conversationId = req.params.id;
        const { adminId, adminName } = req.body;

        if (!conversationId || !adminId || !adminName) {
            return res.status(400).json({ error: 'conversationId, adminId, and adminName are required' });
        }

        const conversation = await Support.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Update conversation status
        conversation.status = 'active';
        conversation.agentId = adminId;
        conversation.agentName = adminName;
        conversation.agentJoinedAt = new Date();
        await conversation.save();

        res.json({ message: 'Joined conversation', conversation });
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
        conversation.closedAt = new Date();
        await conversation.save();

        res.json({ message: 'Conversation closed', conversation });
    } catch (error: any) {
        handleError(error, res);
    }
}

export const getConversationStatsService = async (req: Request, res: Response) => {
    try {
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const weekStart = new Date(now.setDate(now.getDate() - 7));

      const [
        totalConversations, 
        activeConversations, 
        escalatedConversations, 
        closedToday,
        closedThisWeek,
        avgResponseTime
      ] = await Promise.all([
        Support.countDocuments(),
        Support.countDocuments({ status: 'active' }),
        Support.countDocuments({ status: 'escalated' }),
        Support.countDocuments({
          status: 'closed',
          closedAt: { $gte: todayStart }
        }),
        Support.countDocuments({
          status: 'closed',
          closedAt: { $gte: weekStart }
        }),
        // Calculate average response time (time from escalation to admin join)
        Support.aggregate([
          {
            $match: {
              status: { $in: ['active', 'closed'] },
              escalatedAt: { $exists: true },
              agentJoinedAt: { $exists: true }
            }
          },
          {
            $project: {
              responseTime: {
                $subtract: ['$agentJoinedAt', '$escalatedAt']
              }
            }
          },
          {
            $group: {
              _id: null,
              avgResponseTime: { $avg: '$responseTime' }
            }
          }
        ])
      ]);

      res.json({
        stats: {
          total: totalConversations,
          active: activeConversations,
          escalated: escalatedConversations,
          closedToday,
          closedThisWeek,
          avgResponseTimeMs: avgResponseTime[0]?.avgResponseTime || 0
        }
      });
    } catch (error: any) {
      handleError(error, res);
    }
}