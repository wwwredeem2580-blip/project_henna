import mongoose from "mongoose";
import CustomError from "../../../utils/CustomError";

export interface UserEventsResult {
  upcoming: any[];
  live: any[];
  ended: any[];
}

export const getUserEventsService = async (
  userId: string,
  now: Date = new Date()
): Promise<UserEventsResult> => {

  if (!userId) {
    throw new CustomError('User not found', 404);
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const events = await mongoose.connection
    .collection('tickets')
    .aggregate([
      {
        $match: {
          userId: userObjectId,
          status: { $in: ['valid', 'used', 'cancelled', 'refunded'] }
        }
      },
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' },

      {
        $addFields: {
          userStatus: {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [
                      { $eq: ['$event.status', 'published'] },
                      { $gt: ['$event.schedule.startDate', now] }
                    ]
                  },
                  then: 'upcoming'
                },
                {
                  case: { $eq: ['$event.status', 'live'] },
                  then: 'live'
                }
              ],
              default: 'ended'
            }
          }
        }
      },

      {
        $group: {
          _id: '$userStatus',
          events: {
            $push: {
              _id: '$event._id',
              title: '$event.title',
              slug: '$event.slug',
              type: '$event.type',
              status: '$event.status',
              schedule: '$event.schedule',
              venue: '$event.venue',
              media: '$event.media',
              tagline: '$event.tagline',
              ticketInfo: {
                _id: '$_id',
                status: '$status',
                quantity: '$quantity',
                purchasedAt: '$createdAt'
              }
            }
          }
        }
      }
    ])
    .toArray();

  const result: UserEventsResult = {
    upcoming: [],
    live: [],
    ended: []
  };

  for (const group of events) {
    result[group._id as keyof UserEventsResult] = group.events;
  }

  return result;
};
