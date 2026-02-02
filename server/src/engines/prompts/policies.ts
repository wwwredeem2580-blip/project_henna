// Standardized Platform Policies - Single Source of Truth
export const PLATFORM_POLICIES = {
  // Ticket Purchase Limits
  TICKET_LIMITS: {
    MAX_PAID_PER_EVENT: 5,
    MAX_FREE_PER_EVENT: 2,
    MONTHLY_FREE_LIMIT: 10, // Total free tickets per month
    REASON: 'Anti-scalping protection and fair distribution'
  },

  // Refund Policy
  REFUND_POLICY: {
    STANDARD_WINDOW_DAYS: 7,
    CONDITIONS: {
      MUST_BE_BEFORE_EVENT: true,
      MINIMUM_DAYS_BEFORE_EVENT: 7,
      TICKET_NOT_SCANNED: true
    },
    AUTOMATIC_REFUND_TRIGGERS: [
      'Event cancelled by organizer',
      'Organizer flagged as fraudulent',
      'Venue becomes unavailable or unsafe',
      'Confirmed safety risks',
      'Price drop >5% after purchase (partial refund of difference)'
    ],
    ELIGIBLE_FOR_REFUND: [
      'Major schedule change (4+ hours)',
      'Venue relocated to different city',
      'Core experience altered (e.g., concert → listening party)'
    ],
    NOT_ELIGIBLE: [
      'Minor schedule updates (<1 hour)',
      'Supporting act changes (unless headliner cancels)',
      'Personal inability to attend (illness, traffic, etc.)',
      'Ticket already scanned/used'
    ],
    PROCESSING_TIME: '3-10 business days to bKash/Nagad/Card',
    PARTIAL_REFUND: 'Not supported - only full refunds for qualifying tickets'
  },

  // Free Ticket Rules
  FREE_TICKETS: {
    REQUIREMENTS: [
      'Must be logged in with Google account',
      'Email verification required',
      'Cannot claim if monthly limit reached'
    ],
    CANCELLATION: 'Free tickets cannot be cancelled once claimed',
    QUOTA_RESET: 'Monthly quota resets on 1st of each month'
  },

  // Ticket Integrity
  TICKET_INTEGRITY: {
    IMMUTABLE_AFTER_PURCHASE: true,
    CANNOT_CANCEL: 'Tickets cannot be cancelled after purchase',
    CANNOT_TRANSFER: 'Ticket transfers not yet implemented (coming soon)',
    CANNOT_SWAP_TIERS: 'Cannot upgrade/downgrade ticket tiers after purchase',
    ORGANIZER_RESTRICTIONS: [
      'Cannot delete sold ticket tiers',
      'Cannot reduce quantity below sold + reserved count',
      'Cannot drastically change prices after sales begin',
      'Price reductions >5% trigger partial refunds to early buyers'
    ]
  },

  // Host/Organizer Rules
  ORGANIZER_RULES: {
    ELIGIBILITY: {
      ANYONE_CAN_APPLY: true,
      VERIFICATION_REQUIRED: true,
      DOCUMENTS_NEEDED: [
        'Valid identity (NID/Passport/Business License)',
        'Event documentation (venue booking proof)',
        'Venue permit',
        'Capacity certificate',
        'Safety plan/documentation'
      ]
    },
    VERIFICATION_PROCESS: {
      SUBMISSION: 'Upload all required documents',
      STORAGE: 'Encrypted vault (Backblaze B2) - admin access only',
      APPROVAL_TIME: '24-48 hours',
      REJECTION_REASONS: [
        'Incomplete documentation',
        'Invalid/expired permits',
        'Safety concerns',
        'Fraudulent information',
        'Venue capacity mismatch'
      ]
    },
    BANGLADESH_SPECIFIC: {
      LEGAL_REQUIREMENTS: [
        'Valid venue permit from local authorities',
        'Fire safety clearance for venues >500 capacity',
        'Police NOC (No Objection Certificate) for large gatherings',
        'Sound permit if event extends past 10 PM',
        'Business registration for commercial events'
      ],
      COMPLIANCE: 'All events must comply with Bangladesh event management laws and local municipality regulations'
    },
    EDITING_CONSTRAINTS: {
      ZERO_SALES: 'Can edit almost anything',
      WITH_SALES: [
        'Critical fields locked (time, prices, benefits)',
        'Schedule changes: ±2 hours max (one time only)',
        'Larger changes require admin approval + attendee notification'
      ]
    },
    PAYOUTS: {
      GENERATION: '7 days after event completion',
      RELEASE_TIME: '24-48 hours post-event',
      HOLD_CONDITIONS: [
        'Active dispute window',
        'Fraud investigation',
        'Refund adjustments pending'
      ]
    }
  },

  // Security & Trust
  SECURITY: {
    BUYER_PROTECTION: [
      'Verified identity for all organizers',
      'Locked ticket integrity (organizers cannot manipulate sold tickets)',
      'Secure document vault (encrypted, restricted access)',
      'Short-lived access tokens (15-minute rotation)',
      'Price drop protection (partial refunds)',
      'Reservation locking during checkout'
    ],
    PROHIBITED_ACTIVITIES: [
      'Selling fake/duplicate tickets → Immediate permanent ban',
      'Intentional overselling → Immediate permanent ban',
      'Financial abuse or money laundering → Immediate permanent ban',
      'Refund system manipulation → Immediate permanent ban',
      'Scams or fraudulent activity → Immediate permanent ban'
    ],
    TRUST_INDICATORS: [
      'Verified badge on event listings',
      'Multi-stage verification for all hosts',
      'Payouts held until event completion',
      'Zero tolerance for fraud'
    ]
  },

  // Payment & Pricing
  PAYMENT: {
    METHODS: {
      AVAILABLE: ['bKash'],
      COMING_SOON: ['Nagad', 'Credit/Debit Cards', 'Bank Transfer']
    },
    PRICE_PROTECTION: {
      DROP_THRESHOLD: 5, // percentage
      ACTION: 'Partial refund of difference to early buyers',
      FUNDED_BY: 'Organizer payout deduction'
    }
  },

  // Policy Violations
  POLICY_VIOLATIONS: {
    VIP_UPGRADE_WITHOUT_PAYMENT: {
      ALLOWED: false,
      REASON: 'Ticket tiers are immutable after purchase. This would be unfair to other attendees who paid for VIP.',
      ALTERNATIVE: 'User must purchase a new VIP ticket if available'
    },
    EXCEED_TICKET_LIMITS: {
      ALLOWED: false,
      REASON: 'Anti-scalping protection',
      ACTION: 'Excess tickets automatically refunded'
    },
    CANCEL_AFTER_PURCHASE: {
      ALLOWED: false,
      REASON: 'Tickets are non-cancellable. Refunds only for qualifying conditions.',
      ALTERNATIVE: 'Request refund if within 7-day window and event is 7+ days away'
    },
    DELETE_SOLD_TICKETS: {
      ALLOWED: false,
      REASON: 'Buyer protection - what you buy is what you get',
      ENFORCEMENT: 'System prevents deletion of sold ticket tiers'
    }
  }
};

// Helper function to get policy explanation
export function getPolicyExplanation(policyKey: string): string {
  const policies: Record<string, string> = {
    'max_tickets': `You can buy max ${PLATFORM_POLICIES.TICKET_LIMITS.MAX_PAID_PER_EVENT} paid tickets and ${PLATFORM_POLICIES.TICKET_LIMITS.MAX_FREE_PER_EVENT} free tickets per event. This prevents scalping and ensures fair distribution.`,
    
    'refund_window': `Full refund available within ${PLATFORM_POLICIES.REFUND_POLICY.STANDARD_WINDOW_DAYS} days of purchase if event is ${PLATFORM_POLICIES.REFUND_POLICY.CONDITIONS.MINIMUM_DAYS_BEFORE_EVENT}+ days away. Processing takes ${PLATFORM_POLICIES.REFUND_POLICY.PROCESSING_TIME}.`,
    
    'partial_refund': `${PLATFORM_POLICIES.REFUND_POLICY.PARTIAL_REFUND}. If you bought 3 tickets but one friend can't come, you must request a full refund for all tickets (if within 7-day window) or keep all 3.`,
    
    'free_ticket_cancel': `${PLATFORM_POLICIES.FREE_TICKETS.CANCELLATION}. Free tickets count toward your monthly limit of ${PLATFORM_POLICIES.TICKET_LIMITS.MONTHLY_FREE_LIMIT}, so claim wisely.`,
    
    'vip_upgrade': `${PLATFORM_POLICIES.POLICY_VIOLATIONS.VIP_UPGRADE_WITHOUT_PAYMENT.REASON} ${PLATFORM_POLICIES.POLICY_VIOLATIONS.VIP_UPGRADE_WITHOUT_PAYMENT.ALTERNATIVE}.`,
    
    'organizer_verification': `All organizers must complete multi-stage verification: ${PLATFORM_POLICIES.ORGANIZER_RULES.ELIGIBILITY.DOCUMENTS_NEEDED.join(', ')}. Approval takes ${PLATFORM_POLICIES.ORGANIZER_RULES.VERIFICATION_PROCESS.APPROVAL_TIME}.`,
    
    'bangladesh_rules': `In Bangladesh, verified organizers must provide: ${PLATFORM_POLICIES.ORGANIZER_RULES.BANGLADESH_SPECIFIC.LEGAL_REQUIREMENTS.join(', ')}. ${PLATFORM_POLICIES.ORGANIZER_RULES.BANGLADESH_SPECIFIC.COMPLIANCE}`
  };

  return policies[policyKey] || 'Policy not found';
}

// Export for use in chatbot engines
export default PLATFORM_POLICIES;
