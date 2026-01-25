// Types
export interface TicketPriceChangeResult {
  allowed: boolean;
  message: string;
  refundsRequired?: boolean;
  refundAmount?: number;
  affectedBuyers?: number;
  requireConfirmation?: boolean;
}

export interface TicketQuantityChangeResult {
  allowed: boolean;
  message: string;
  warning?: string;
}

export interface DateTimeChangeResult {
  allowed: boolean;
  message: string;
  hoursDifference?: number;
}

// Ticket price validation
/**
 * Validates ticket price changes for published events
 * Rules:
 * - Price increase: Always allowed
 * - Price decrease (0 sold): Allowed
 * - Price decrease (1-9 sold): Allowed with auto-refund
 * - Price decrease (10+ sold): Blocked
 */
export async function validateTicketPriceChange(
  ticketId: string,
  oldPrice: number,
  newPrice: number,
  soldCount: number
): Promise<TicketPriceChangeResult> {
  // Price increase: Always allowed
  if (newPrice > oldPrice) {
    return {
      allowed: true,
      message: 'Price increased. New buyers will pay the new price.'
    };
  }

  // No change
  if (newPrice === oldPrice) {
    return {
      allowed: true,
      message: 'No price change detected.'
    };
  }

  // Price decrease: Check sold count
  if (newPrice < oldPrice) {
    if (soldCount === 0) {
      return {
        allowed: true,
        message: 'No tickets sold yet. Price updated.'
      };
    }

    if (soldCount < 10) {
      const refundPerBuyer = oldPrice - newPrice;
      const totalRefund = refundPerBuyer * soldCount;

      return {
        allowed: true,
        refundsRequired: true,
        refundAmount: totalRefund,
        affectedBuyers: soldCount,
        message: `${soldCount} buyers will be refunded BDT ${refundPerBuyer} each. Total: BDT ${totalRefund}. This will be deducted from your payout.`,
        requireConfirmation: true
      };
    }

    // 10+ sold: Block
    return {
      allowed: false,
      message: `Cannot lower price. ${soldCount} tickets already sold. Contact support for assistance.`
    };
  }

  return { allowed: true, message: 'Price change validated.' };
}

// Ticket quantity validation
/**
 * Validates ticket quantity changes for published events
 * Rules:
 * - Increase: Always allowed (within venue capacity)
 * - Decrease: Cannot go below sold count
 */
export function validateTicketQuantityChange(
  ticketId: string,
  oldQuantity: number,
  newQuantity: number,
  soldCount: number,
  venueCapacity: number,
  totalOtherTickets: number
): TicketQuantityChangeResult {
  // Cannot decrease below sold count
  if (newQuantity < soldCount) {
    return {
      allowed: false,
      message: `Cannot reduce quantity below ${soldCount} (already sold)`
    };
  }

  // Check venue capacity
  const totalTickets = newQuantity + totalOtherTickets;
  if (totalTickets > venueCapacity) {
    return {
      allowed: false,
      message: `Total ticket quantity (${totalTickets}) exceeds venue capacity (${venueCapacity})`
    };
  }

  // Reducing available tickets (but above sold count)
  if (newQuantity < oldQuantity && soldCount > 0) {
    const oldAvailable = oldQuantity - soldCount;
    const newAvailable = newQuantity - soldCount;

    return {
      allowed: true,
      message: 'Quantity updated successfully.',
      warning: `This will reduce available tickets from ${oldAvailable} to ${newAvailable}.`
    };
  }

  return {
    allowed: true,
    message: 'Quantity updated successfully.'
  };
}

// Description validation
/**
 * Validates description edits for published events
 * Rule: New description must contain at least 80% of old content
 */
export function validateDescriptionEdit(
  oldDescription: string,
  newDescription: string
): { allowed: boolean; message: string; similarity?: number } {
  if (!oldDescription || !newDescription) {
    return { allowed: true, message: 'Description validated.' };
  }

  // Tokenize by words
  const oldWords = oldDescription.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const newWords = newDescription.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  if(oldWords.length < 2 || newWords.length < 2) {
    return { allowed: true, message: 'Description validated.' };
  }
  // Calculate similarity
  const matchedWords = oldWords.filter(word => newWords.includes(word));
  const similarity = oldWords.length > 0 ? matchedWords.length / oldWords.length : 1;

  if (similarity < 0.6) {
    return {
      allowed: false,
      message: 'Cannot remove significant content from description. You can add details, but major changes require admin approval.',
      similarity: Math.round(similarity * 100)
    };
  }

  return {
    allowed: true,
    message: 'Description validated.',
    similarity: Math.round(similarity * 100)
  };
}


// Refund calculation
/**
 * Calculates refund details for ticket price decreases
 */
export function calculateRefunds(
  tickets: Array<{ ticketId: string; oldPrice: number; newPrice: number; soldCount: number }>
): {
  totalRefundAmount: number;
  totalAffectedBuyers: number;
  refundDetails: Array<{ ticketId: string; refundPerBuyer: number; buyers: number; total: number }>;
} {
  let totalRefundAmount = 0;
  let totalAffectedBuyers = 0;
  const refundDetails: Array<{ ticketId: string; refundPerBuyer: number; buyers: number; total: number }> = [];

  for (const ticket of tickets) {
    if (ticket.newPrice < ticket.oldPrice && ticket.soldCount > 0) {
      const refundPerBuyer = ticket.oldPrice - ticket.newPrice;
      const total = refundPerBuyer * ticket.soldCount;

      totalRefundAmount += total;
      totalAffectedBuyers += ticket.soldCount;

      refundDetails.push({
        ticketId: ticket.ticketId,
        refundPerBuyer,
        buyers: ticket.soldCount,
        total
      });
    }
  }

  return {
    totalRefundAmount,
    totalAffectedBuyers,
    refundDetails
  };
}
