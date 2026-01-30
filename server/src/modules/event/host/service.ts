import { User } from "../../../database/auth/auth";
import { Event } from "../../../database/event/event";
import { approvedEventEditSchema, createEventSchema, liveEventEditSchema, pendingApprovalEditSchema, publishedEventEditSchema, submitEventSchema } from "../../../schema/event.schema";
import { buildEventForCreate } from "../../../utils/event/createEventBuilder";
import { generateSlug } from "../../../utils/event/generateSlug";
import { isValidObjectId } from "../../../utils/isValidObjectId";
import CustomError from "../../../utils/CustomError";
import { buildEventForPending } from "../../../utils/event/pendingEventBuilder";
import { buildEventForApprovedEdit } from "../../../utils/event/approvedEventBuilder";
import { buildEventForPublishedEdit } from "../../../utils/event/publishedEventBuilder";
import { validateDescriptionEdit, validateTicketPriceChange, validateTicketQuantityChange } from "../../../utils/event/helpers";
import { processAutomaticPriceReductionRefunds } from "../../../utils/event/processAutomaticPriceReductionRefunds";


export const getDraftEventsService = async (hostId: string, eventId: string) => {
  const hostData = await User.findById(hostId).select('businessName businessEmail companyType firstName lastName');

  if (!hostData) {
    throw new CustomError('Host not found', 404);
  }

  const event = await Event.findById(eventId);

  if (!event) {
    throw new CustomError('Event not found', 404);
  }

  if (event.hostId.toString() !== hostId) {
    throw new CustomError('Unauthorized', 403);
  }

  if (event.status !== 'draft') {
    throw new CustomError('Event is not in draft state', 400);
  }

  return event;
};

// Draft Stage
export const createEventService = async (hostId: string, data: any) => {
  const hostData = await User.findById(hostId).select('businessName businessEmail companyType firstName lastName');

  if (!hostData) {
    throw new CustomError('Host not found', 404);
  }

  if (!hostData.businessName || !hostData.businessEmail || !hostData.companyType) {
    throw new CustomError('Host profile incomplete. Please complete your business information before creating events.', 400);
  }

  data.organizer = {
    companyName: hostData.businessName,
    companyType: hostData.companyType,
    companyEmail: hostData.businessEmail,
    host: `${hostData.firstName} ${hostData.lastName}`,
  };

  const validatedData = createEventSchema.parse(data);

  const sanitizedData = buildEventForCreate(validatedData);

  const event = await Event.create({
    ...sanitizedData,
    hostId,
  });

  event.slug = generateSlug(event.title, event._id.toString());
  await event.save();

  return {
    eventId: event._id,
    message: 'Event draft created successfully'
  };
};

export const updateEventService = async (hostId: string, eventId: string, data: any) => {
  if (!isValidObjectId(eventId) || !isValidObjectId(hostId)) {
    throw new CustomError("Invalid event ID or host ID", 400);
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new CustomError("Event not found", 404);
  }

  if (event.hostId.toString() !== hostId) {
    throw new CustomError("Unauthorized", 403);
  }

  if (event?.status !== 'draft') {
    throw new CustomError('Event is not in draft state', 400);
  }

  const validatedData = createEventSchema.parse(data);
  const sanitizedData = buildEventForCreate(validatedData);

  event.set({ ...sanitizedData, status: 'draft' });
  event.slug = generateSlug(event.title, event._id.toString());
  await event.save();

  return {
    eventId: event._id,
    message: 'Event updated successfully'
  };
};

// Submit Event
export const submitEventService = async (hostId: string, eventId: string, data: any) => {
  if (!isValidObjectId(eventId) || !isValidObjectId(hostId)) {
    throw new CustomError("Invalid event ID or host ID", 400);
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new CustomError("Event not found", 404);
  }

  if (event.hostId.toString() !== hostId) {
    throw new CustomError("Unauthorized", 403);
  }

  if (event?.status !== 'draft') {
    throw new CustomError('Event is not in draft state', 400);
  }

  const validatedData = submitEventSchema.parse(data);
  const sanitizedData = buildEventForCreate(validatedData);

  event.set({ ...sanitizedData, status: 'pending_approval' });
  event.slug = generateSlug(event.title, event._id.toString());
  await event.save();

  return {
    eventId: event._id,
    message: 'Event submitted successfully'
  };
};


// Pending Event
export const updatePendingEventService = async (hostId: string, eventId: string, data: any) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new CustomError("Event not found", 404);
  }

  if (event.hostId.toString() !== hostId) {
    throw new CustomError("Unauthorized", 403);
  }

  if (event?.status !== 'pending_approval') {
    throw new CustomError('Event is not in pending approval state', 400);
  }

  const validatedData = pendingApprovalEditSchema.parse(data);
  const sanitizedData = buildEventForPending(validatedData, event);

  event.set({ ...sanitizedData });
  await event.save();

  return {
    eventId: event._id,
    message: 'Event updated successfully'
  };
};

// Approved Event
export const updateApprovedEventService = async (hostId: string, eventId: string, data: any) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new CustomError("Event not found", 404);
  }

  if (event.hostId.toString() !== hostId) {
    throw new CustomError("Unauthorized", 403);
  }

  if (event?.status !== 'approved') {
    throw new CustomError('Event is not in approved state', 400);
  }

  const validatedData = approvedEventEditSchema.parse(data);
  const sanitizedData = buildEventForApprovedEdit(validatedData);

  event.set({ ...sanitizedData });
  await event.save();

  return {
    eventId: event._id,
    message: 'Event updated successfully'
  };
};

// Published Event
export const updatePublishedEventService = async (hostId: string, eventId: string, data: any) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new CustomError("Event not found", 404);
  }

  if (event.hostId.toString() !== hostId) {
    throw new CustomError("Unauthorized", 403);
  }

  if (event?.status !== 'published') {
    throw new CustomError('Event is not in published state', 400);
  }

  const validatedData = publishedEventEditSchema.parse(data);
  const sanitizedData = buildEventForPublishedEdit(validatedData, event);
  const updatedTickets = [];
  const warnings: string[] = [];
  const refundsRequired: any[] = [];

  if (data.tickets && Array.isArray(data.tickets)) {

    for (const ticketUpdate of data.tickets) {
      // Check if this is a new ticket (no _id) or existing ticket update
      const isNewTicket = !ticketUpdate._id;
      
      if (isNewTicket) {
        // NEW TICKET VARIANT - Validate and add
        const quantity = parseInt(String(ticketUpdate.quantity), 10);
        if (isNaN(quantity) || quantity < 1) {
          throw new CustomError(`Invalid quantity for new ticket: ${ticketUpdate.name}`, 400);
        }

        // Validate price structure
        if (!ticketUpdate.price || typeof ticketUpdate.price.amount !== 'number' || ticketUpdate.price.amount < 0) {
          throw new CustomError(`Invalid price for new ticket: ${ticketUpdate.name}`, 400);
        }

        // Add new ticket with defaults
        updatedTickets.push({
          ...ticketUpdate,
          quantity,
          sold: 0,
          reserved: 0,
          isVisible: ticketUpdate.isVisible !== undefined ? ticketUpdate.isVisible : true,
          isActive: ticketUpdate.isActive !== undefined ? ticketUpdate.isActive : true
        });
        continue; // Skip to next ticket
      }

      // EXISTING TICKET UPDATE
      const existingTicket = event.tickets.find((t: any) => t._id.toString() === ticketUpdate._id);
      
      if (!existingTicket) {
        throw new CustomError(`Ticket ${ticketUpdate._id} not found`, 404);
      }

      // Validate ticket ID format
      if (!/^[0-9a-fA-F]{24}$/.test(ticketUpdate._id)) {
        throw new CustomError(`Invalid ticket ID format: ${ticketUpdate._id}`, 400);
      }

      const updatedTicket: any = { ...existingTicket.toObject() };

      // Price change validation
      if (ticketUpdate.price !== undefined) {
        // Validate price structure
        if (!ticketUpdate.price || typeof ticketUpdate.price.amount !== 'number' || ticketUpdate.price.amount < 0) {
          throw new CustomError(`Invalid price structure for ticket: ${existingTicket.name}`, 400);
        }

        const priceValidation = await validateTicketPriceChange(
          existingTicket._id.toString(),
          existingTicket.price.amount,
          ticketUpdate.price.amount,
          existingTicket.sold || 0
        );

        if (!priceValidation.allowed) {
          throw new CustomError(priceValidation.message, 400);
        }

        if (priceValidation.refundsRequired) {
          // Check cooldown (24 hours)
          if (existingTicket.lastPriceReductionAt) {
            const lastReduction = new Date(existingTicket.lastPriceReductionAt);
            const now = new Date();
            const hoursSince = (now.getTime() - lastReduction.getTime()) / (1000 * 60 * 60);
            
            if (hoursSince < 24) {
              const remainingHours = Math.ceil(24 - hoursSince);
              throw new CustomError(`Price cannot be reduced again so soon. Please wait ${remainingHours} hours.`, 400);
            }
          }

          refundsRequired.push({
            ticketId: existingTicket._id.toString(),
            ticketName: existingTicket.name,
            oldPrice: existingTicket.price.amount,
            newPrice: ticketUpdate.price.amount,
            refundAmount: priceValidation.refundAmount || 0,
            affectedBuyers: priceValidation.affectedBuyers || 0
          });
          
          updatedTicket.lastPriceReductionAt = new Date();
          warnings.push(priceValidation.message);
        }

        updatedTicket.price = ticketUpdate.price;
      }

      // Quantity change validation
      if (ticketUpdate.quantity !== undefined) {
        // Validate and parse quantity
        const quantity = parseInt(String(ticketUpdate.quantity), 10);
        if (isNaN(quantity) || quantity < 1) {
          throw new CustomError(`Invalid quantity for ticket: ${existingTicket.name}`, 400);
        }

        // Calculate total other tickets
        const totalOtherTickets = event.tickets
          .filter((t: any) => t._id.toString() !== existingTicket._id.toString())
          .reduce((sum: number, t: any) => sum + parseInt(String(t.quantity || 0), 10), 0);

        const quantityValidation = validateTicketQuantityChange(
          existingTicket._id.toString(),
          existingTicket.quantity,
          quantity,
          existingTicket.sold || 0,
          event.venue.capacity,
          totalOtherTickets
        );

        if (!quantityValidation.allowed) {
          throw new CustomError(quantityValidation.message, 400);
        }

        if (quantityValidation.warning) {
          warnings.push(quantityValidation.warning);
        }

        updatedTicket.quantity = quantity;
      }

      // Benefits validation (can add, not remove)
      if (ticketUpdate.benefits) {
        const existingBenefits = existingTicket.benefits || [];
        const newBenefits = ticketUpdate.benefits;

        // Check if any benefits were removed
        const removedBenefits = existingBenefits.filter(
          (b: string) => !newBenefits.includes(b)
        );

        if (removedBenefits.length > 0 && (existingTicket.sold || 0) > 0) {
          throw new CustomError(
            `Cannot remove benefits from ${existingTicket.name} - tickets already sold`,
            400
          );
        }

        updatedTicket.benefits = newBenefits;
      }

      // Limits validation (cannot change if sales exist)
      if (ticketUpdate.limits && (existingTicket.sold || 0) > 0 && (ticketUpdate.limits.minPerOrder !== existingTicket.limits.minPerOrder || ticketUpdate.limits.maxPerOrder !== existingTicket.limits.maxPerOrder)) {
        throw new CustomError(
          `Cannot change purchase limits for ${existingTicket.name} - tickets already sold`,
          400
        );
      }

      // Validate limits structure if provided
      if (ticketUpdate.limits) {
        if (ticketUpdate.limits.maxPerOrder < ticketUpdate.limits.minPerOrder) {
          throw new CustomError(
            `Max per order must be >= min per order for ticket: ${existingTicket.name}`,
            400
          );
        }
        updatedTicket.limits = ticketUpdate.limits;
      }

      // Update visibility and active status
      if (ticketUpdate.isVisible !== undefined) updatedTicket.isVisible = ticketUpdate.isVisible;
      if (ticketUpdate.isActive !== undefined) updatedTicket.isActive = ticketUpdate.isActive;

      // Update visual customization
      if (ticketUpdate.wristbandColor) updatedTicket.wristbandColor = ticketUpdate.wristbandColor;
      if (ticketUpdate.accentColor) updatedTicket.accentColor = ticketUpdate.accentColor;
      if (ticketUpdate.isDark !== undefined) updatedTicket.isDark = ticketUpdate.isDark;
      if (ticketUpdate.glassMode !== undefined) updatedTicket.glassMode = ticketUpdate.glassMode;
      if (ticketUpdate.cornerRadius !== undefined) updatedTicket.cornerRadius = ticketUpdate.cornerRadius;
      if (ticketUpdate.perforationStyle) updatedTicket.perforationStyle = ticketUpdate.perforationStyle;

      updatedTickets.push(updatedTicket);
    }

    // CRITICAL: Check if any existing tickets with sales are being deleted
    const updatedTicketIds = new Set(updatedTickets.map((t: any) => t._id?.toString()).filter(Boolean));
    
    for (const existingTicket of event.tickets) {
      const ticketId = existingTicket._id.toString();
      const isBeingDeleted = !updatedTicketIds.has(ticketId);
      
      if (isBeingDeleted && (existingTicket.sold > 0 || existingTicket.reserved > 0)) {
        throw new CustomError(
          `Cannot delete ticket "${existingTicket.name}" - ${existingTicket.sold} tickets already sold. You can hide it instead by setting visibility to false.`,
          400
        );
      }
    }

    (sanitizedData as any).tickets = updatedTickets;
  }
  

  event.set({ ...sanitizedData });
  await event.save();

  // Process automatic refunds if price reductions detected
  if (refundsRequired.length > 0) {
    await processAutomaticPriceReductionRefunds(event, refundsRequired, data.hostId);
  }
  
  return {
    eventId: event._id,
    message: 'Event updated successfully'
  };
}


// Live Event
export const updateLiveEventService = async (hostId: string, eventId: string, data: any) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new CustomError("Event not found", 404);
  }

  if (event.hostId.toString() !== hostId) {
    throw new CustomError("Unauthorized", 403);
  }

  if (event?.status !== 'live') {
    throw new CustomError('Event is not in live state', 400);
  }

  const validatedData = liveEventEditSchema.parse(data);
  
  // Only include tickets if explicitly provided (same fix as published events)
  const { tickets: _, ...dataWithoutTickets } = validatedData;
  let sanitizedData: any = dataWithoutTickets;

  // Ticket operational controls
  if (data.tickets && Array.isArray(data.tickets)) {
    const updatedTickets = event.tickets.map((existingTicket: any) => {
      const ticketUpdate = data.tickets.find((t: any) => t._id === existingTicket._id.toString());
      
      if (!ticketUpdate) return existingTicket;

      // Validate ticket ID format
      if (!/^[0-9a-fA-F]{24}$/.test(ticketUpdate._id)) {
        throw new CustomError(`Invalid ticket ID format: ${ticketUpdate._id}`, 400);
      }

      const updated: any = { ...existingTicket.toObject() };

      // Quantity increase only (with proper parsing)
      if (ticketUpdate.quantity !== undefined) {
        const quantity = parseInt(String(ticketUpdate.quantity), 10);
        if (isNaN(quantity) || quantity < 1) {
          throw new CustomError(`Invalid quantity for ticket: ${existingTicket.name}`, 400);
        }

        if (quantity < existingTicket.quantity) {
          throw new CustomError(
            `Cannot decrease ticket quantity during live event. Current: ${existingTicket.quantity}, Requested: ${quantity}`,
            400
          );
        }
        updated.quantity = quantity;
      }

      // Pause sales toggle
      if (ticketUpdate.isActive !== undefined) {
        updated.isActive = ticketUpdate.isActive;
      }

      // Update visual customization
      if (ticketUpdate.wristbandColor) updated.wristbandColor = ticketUpdate.wristbandColor;
      if (ticketUpdate.accentColor) updated.accentColor = ticketUpdate.accentColor;
      if (ticketUpdate.isDark !== undefined) updated.isDark = ticketUpdate.isDark;
      if (ticketUpdate.glassMode !== undefined) updated.glassMode = ticketUpdate.glassMode;
      if (ticketUpdate.cornerRadius !== undefined) updated.cornerRadius = ticketUpdate.cornerRadius;
      if (ticketUpdate.perforationStyle) updated.perforationStyle = ticketUpdate.perforationStyle;

      return updated;
    });

    sanitizedData.tickets = updatedTickets;
  }
  
  event.set({ ...sanitizedData });
  await event.save();

  return {
    eventId: event._id,
    message: 'Event updated successfully'
  };
};





// Delete Event
export const deleteEventService = async (hostId: string, eventId: string) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new CustomError("Event not found", 404);
  }

  if (event.hostId.toString() !== hostId) {
    throw new CustomError("Unauthorized", 403);
  }

  if (event.status !== 'draft') {
    throw new CustomError("Event is not in draft state", 400);
  }

  await event.deleteOne();

  return {
    eventId: event._id,
    message: 'Event deleted successfully'
  };
};

export const updateStatusRejectedToDraftService = async (hostId: string, eventId: string) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new CustomError("Event not found", 404);
  }

  if (event.hostId.toString() !== hostId) {
    throw new CustomError("Unauthorized", 403);
  }

  if (event.status !== 'rejected') {
    throw new CustomError("Event is not in rejected state", 400);
  }

  event.status = 'draft';
  await event.save();

  return {
    eventId: event._id,
    message: 'Event status updated to draft successfully'
  };
};


export const toggleSalesStatusService = async (hostId: string, eventId: string, pauseReason: string) => {
  if(pauseReason?.length > 255) {
    throw new CustomError("Reason must be less than 255 characters", 400);
  }

  if (!isValidObjectId(eventId) || !isValidObjectId(hostId)) {
    throw new CustomError("Invalid event ID or host ID", 400);
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new CustomError("Event not found", 404);
  }

  if (event.hostId.toString() !== hostId) {
    throw new CustomError("Unauthorized", 403);
  }

  if (!['published', 'live'].includes(event.status)) {
    throw new CustomError('Sales can only be paused for published or live events', 400);
  }

  if(event?.moderation?.sales?.paused && event?.moderation?.sales?.pausedBy) {
    if(event.moderation.sales.pausedBy.toString() !== hostId?.toString()) {
      throw new CustomError(`Sales are paused by admin for reason: ${event.moderation.sales?.pausedReason}`, 403);
    }
  }

  event.moderation.sales.paused = !event.moderation.sales.paused;
  event.moderation.sales.pausedBy = hostId;
  event.moderation.sales.pausedReason = pauseReason;
  await event.save();

  return {
    eventId: event._id,
    message: 'Event sales status updated successfully'
  };
};