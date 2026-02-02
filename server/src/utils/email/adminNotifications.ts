
interface AdminNotificationPayload {
  hostEmail: string;
  hostName: string;
  eventTitle?: string;
  payout?: any;
  reason?: string;
  eventId?: string;
  amount?: number;
  currency?: string;
  // For other types
  order?: any;
  user?: any;
  ticketName?: string;
  oldPrice?: number;
  newPrice?: number;
  totalRefunded?: number;
  affectedOrders?: number;
  verificationLink?: string;
}

export function getAdminNotificationTemplate(type: string, payload: any): string {
    let title = 'Notification';
    let message = '';
    let details = '';
    let ctaLink = '';
    let ctaText = '';

    const { hostName, eventTitle, reason, payout, order, user, refundAmount, amount } = payload;

    switch (type) {
        // --- PAYOUT NOTIFICATIONS ---
        case 'PAYOUT_GENERATED':
            title = 'Payout Generated';
            message = `A new payout has been generated for your event ${eventTitle || payload.event?.title || ''}.`;
            details = payout ? `
                 <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #64748b; font-size: 14px;">Payout Amount</span>
                        <span style="color: #0f172a; font-weight: 600;">${payout.currency || 'BDT'} ${payout.netPayout || payout.amount}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #64748b; font-size: 14px;">Status</span>
                        <span style="color: #0f172a; font-weight: 600;">${payout.status}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #64748b; font-size: 14px;">Payout ID</span>
                        <span style="color: #0f172a; font-family: monospace;">${payout.payoutNumber}</span>
                    </div>
                </div>
            ` : '';
            break;
            
        case 'PAYOUT_COMPLETED':
            title = 'Payout Processed';
            message = `Good news! Your payout for ${payload.payout?.eventId?.title || 'event'} has been successfully processed and sent to your account.`;
             details = payout ? `
                 <div style="background: #f0fdf4; border: 1px solid #dcfce7; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #166534; font-size: 14px;">Amount Sent</span>
                        <span style="color: #166534; font-weight: 600;">${payout.currency || 'BDT'} ${payout.netPayout || payout.amount}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #166534; font-size: 14px;">Transaction ID</span>
                        <span style="color: #166534; font-family: monospace;">${payout.transactionId || 'N/A'}</span>
                    </div>
                </div>
            ` : '';
            break;

        case 'PAYOUT_ON_HOLD':
             title = 'Payout On Hold';
             message = `Your payout for ${payload.payout?.eventId?.title || 'event'} has been put on hold. Please review the reason below or contact support.`;
             details = `
                <div style="background: #fff1f2; border: 1px solid #ffe4e6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                    <strong style="color: #9f1239; display: block; margin-bottom: 8px;">Reason for Hold:</strong>
                    <p style="margin: 0; color: #881337;">${payload.payout?.holdReason || 'Administrative Review'}</p>
                </div>
             `;
             break;

        case 'PAYOUT_REJECTION':
            title = 'Payout Rejected';
            message = `We couldn't process your payout for ${payload.payout?.eventId?.title || 'event'}.`;
            details = `
                <div style="background: #fff1f2; border: 1px solid #ffe4e6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                    <strong style="color: #9f1239; display: block; margin-bottom: 8px;">Rejection Reason:</strong>
                    <p style="margin: 0; color: #881337;">${payload.payout?.rejectionReason || 'Policy Violation'}</p>
                </div>
             `;
            break;

        // --- EVENT NOTIFICATIONS ---
        case 'EVENT_APPROVED':
            title = 'Event Approved';
            message = `Congratulations! Your event <strong>${eventTitle}</strong> has been approved and is now live on Zenvy.`;
            ctaLink = `${process.env.CLIENT_URL}/events/${payload.eventId || ''}`;
            ctaText = 'View Event';
            break;

         case 'EVENT_REJECTED':
            title = 'Event Rejected';
            message = `Unfortunately, your event <strong>${eventTitle}</strong> did not meet our guidelines and has been rejected.`;
             details = reason ? `
                <div style="background: #fff1f2; border: 1px solid #ffe4e6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                    <strong style="color: #9f1239; display: block; margin-bottom: 8px;">Reason:</strong>
                    <p style="margin: 0; color: #881337;">${reason}</p>
                </div>
             ` : '';
            break;

        case 'EVENT_FEATURED':
            title = 'Event Featured!';
            message = `Great news! Your event <strong>${eventTitle}</strong> has been selected as a featured event on our platform homepage. Expect to see more visibility!`;
            break;

        case 'EVENT_SUSPENDED':
            title = 'Event Suspended';
            message = `Your event <strong>${eventTitle}</strong> has been suspended due to policy violations.`;
             details = payload.payout?.suspensionReason || reason ? `
                <div style="background: #fff1f2; border: 1px solid #ffe4e6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                    <strong style="color: #9f1239; display: block; margin-bottom: 8px;">Reason:</strong>
                    <p style="margin: 0; color: #881337;">${payload.payout?.suspensionReason || reason}</p>
                </div>
             ` : '';
            break;

        // --- REFUND NOTIFICATIONS ---
        case 'PRICE_REDUCTION_REFUND':
             title = 'Partial Refund Processed';
             message = `You have received a partial refund for your ticket to <strong>${payload.event?.title}</strong> because the host reduced the ticket price.`;
             details = `
                 <div style="background: #f0fdf4; border: 1px solid #dcfce7; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #166534; font-size: 14px;">Refund Amount</span>
                        <span style="color: #166534; font-weight: 600;">BDT ${refundAmount}</span>
                    </div>
                     <div style="display: flex; justify-content: space-between;">
                        <span style="color: #166534; font-size: 14px;">Original Price</span>
                        <span style="color: #166534; text-decoration: line-through;">BDT ${payload.oldPrice}</span>
                    </div>
                     <div style="display: flex; justify-content: space-between;">
                        <span style="color: #166534; font-size: 14px;">New Price</span>
                        <span style="color: #166534; font-weight: 600;">BDT ${payload.newPrice}</span>
                    </div>
                </div>
             `;
             break;
        
        case 'REFUND_CONFIRMATION':
             title = 'Refund Processed';
             message = `A refund has been processed for your order #${order?.orderNumber} for event <strong>${payload.event?.title}</strong>.`;
             details = `
                 <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #64748b; font-size: 14px;">Refund Amount</span>
                        <span style="color: #0f172a; font-weight: 600;">BDT ${refundAmount}</span>
                    </div>
                </div>
             `;
             break;

        default:
             // Fallback for other cases (SALES_PAUSED, etc.)
             title = type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
             message = `This is a notification regarding your event ${eventTitle || ''}.`;
             if(reason) details = `<p>Reason: ${reason}</p>`;
             break;
    }

    // --- HTML TEMPLATE ---
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; -webkit-font-smoothing: antialiased;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 48px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                Zenvy
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 48px 40px;">
              ${hostName || payload.user?.name ? `
              <p style="margin: 0 0 24px; color: #1e293b; font-size: 18px; font-weight: 500;">
                Hi ${hostName || payload.user?.name},
              </p>
              ` : ''}
              
              <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 20px; font-weight: 600;">
                ${title}
              </h2>

              <p style="margin: 0 0 32px; color: #475569; font-size: 16px; line-height: 1.6; font-weight: 300;">
                ${message}
              </p>

              ${details}

              ${ctaLink ? `
              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);">
                    <a href="${ctaLink}" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 500; border-radius: 8px;">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}

              <p style="margin: 32px 0 0; color: #94a3b8; font-size: 14px; line-height: 1.6; font-weight: 300;">
                If you have any questions, please contact our support team.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; color: #64748b; font-size: 14px; text-align: center; font-weight: 300;">
                Need help? Contact us at <a href="mailto:support@zenvy.com" style="color: #6366f1; text-decoration: none;">support@zenvy.com</a>
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center; font-weight: 300;">
                © ${new Date().getFullYear()} Zenvy Inc. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
}
