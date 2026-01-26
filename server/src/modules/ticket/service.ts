import mongoose from "mongoose";
import { Ticket } from '../../database/ticket/ticket';

export const verifyTicketService = async (qrData: string, eventId: string) => {
  const ticket = await Ticket.findOne({ qrCode: qrData });
  if (!ticket) {
    return { valid: false, reason: "INVALID_QR" };
  }

  if (ticket.status !== "valid") {
    return { valid: false, reason: "TICKET_INVALID" };
  }

  if (ticket.eventId.toString() !== eventId) {
    return { valid: false, reason: "EVENT_MISMATCH" };
  }

  if (ticket.validUntil && new Date() > new Date(ticket.validUntil)) {
    return { valid: false, reason: "TICKET_EXPIRED" };
  }
  if (ticket.checkInStatus === "checked_in") {
    return {
      valid: false,
      reason: "ALREADY_USED",
      checkedInAt: ticket.checkedInAt
    };
  }

  const updated = await Ticket.findOneAndUpdate(
    {
      _id: ticket._id,
      checkInStatus: "not_checked_in"
    },
    {
      $set: {
        checkInStatus: "checked_in",
        checkedInAt: new Date()
      }
    },
    { new: true }
  );

  if (!updated) {
    return {
      valid: false,
      reason: "RACE_CONDITION"
    };
  }

  // 6️⃣ Success response
  return {
    valid: true,
    ticketNumber: updated.ticketNumber,
    ticketType: updated.ticketType,
    userId: updated.userId,
    eventTitle: updated.eventTitle,
    checkedInAt: updated.checkedInAt
  };
};


export const getTicketsService = async (userId: string) => {
  const tickets = await Ticket.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'events',
        localField: 'eventId',
        foreignField: '_id',
        as: 'event',
        pipeline: [
          {
            $project: {
              title: 1,
              venue: 1,
              schedule: 1,
              tickets: 1,
            }
          }
        ]
      }
    },
    { $unwind: { path: '$event', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        ticketTheme: {
          $arrayElemAt: [
            {
              $filter: {
                input: '$event.tickets',
                cond: { $eq: ['$$this._id', '$ticketVariantId'] }
              }
            },
            0
          ]
        }
      }
    },
    {
      $project: {
        _id: 1,
        ticketNumber: 1,
        qrCode: 1,
        qrCodeUrl: 1,
        status: 1,
        price: 1,
        orderId: 1,
        eventId: 1,
        ticketVariantId: 1,
        eventTitle: '$event.title',
        eventDate: '$event.schedule.startDate',
        validUntil: 1,
        eventVenue: '$event.venue.name',
        venueAddress: {
          $concat: [
            { $ifNull: ['$event.venue.address.city', ''] },
            ', ',
            { $ifNull: ['$event.venue.address.country', ''] }
          ]
        },
        ticketType: 1,
        checkInStatus: 1,
        issuedAt: 1,
        ticketTheme: {
          wristbandColor: '$ticketTheme.wristbandColor',
          accentColor: '$ticketTheme.accentColor',
          isDark: '$ticketTheme.isDark',
          glassMode: '$ticketTheme.glassMode',
          cornerRadius: '$ticketTheme.cornerRadius',
          perforationStyle: '$ticketTheme.perforationStyle',
          benefits: '$ticketTheme.benefits',
          tier: '$ticketTheme.tier',
        }
      }
    },
    { $sort: { issuedAt: -1 } }
  ]);

  const validTickets = tickets.filter((ticket:any) => ticket.status === 'valid');
  const invalidTickets = tickets.filter((ticket:any) => ticket.status !== 'valid');

  const seenTypes = new Set<string>();
  const deduplicatedInvalidTickets = invalidTickets.filter((ticket:any) => {
    if (seenTypes.has(ticket.ticketType)) return false;
    seenTypes.add(ticket.ticketType);
    return true;
  });

  return [...validTickets, ...deduplicatedInvalidTickets].sort(
    (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
  );
};