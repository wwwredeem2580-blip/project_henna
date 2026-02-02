
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
            title = 'Payout Initiated 💸';
            message = `Cha-ching! We've successfully calculated and initiated the payout for your event, <strong>${eventTitle || payload.event?.title || 'Unknown Event'}</strong>. <br><br>The funds are now being queued for transfer. Depending on the payment method and banking hours, it might take a little time to reflect in your account. sit tight!`;
            details = payout ? `
                 <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
                        <span style="color: #64748b; font-size: 14px; font-weight: 500;">Payout Amount</span>
                        <span style="color: #0f172a; font-weight: 700; font-size: 16px;">${payout.currency || 'BDT'} ${payout.netPayout || payout.amount}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #64748b; font-size: 14px;">Status</span>
                        <span style="color: #0f172a; font-weight: 600; text-transform: capitalize;">${getPayoutStatusText(payout.status)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #64748b; font-size: 14px;">Reference ID</span>
                        <span style="color: #0f172a; font-family: 'Courier New', monospace; font-size: 13px;">${payout.payoutNumber}</span>
                    </div>
                </div>
            ` : '';
            ctaLink = `${process.env.CLIENT_URL || 'https://zenvy.com'}/host/payouts`;
            ctaText = 'Track Payout';
            break;
            
        case 'PAYOUT_COMPLETED':
            title = 'Funds Transferred ✅';
            message = `Success! The funds from your event, <strong>${payload.payout?.eventId?.title || 'Unknown Event'}</strong>, have officially landed. <br><br>The transfer has been completed successfully to your designated account. Thank you for hosting with Zenvy!`;
             details = payout ? `
                 <div style="background: #f0fdf4; border: 1px solid #dcfce7; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #bbf7d0; padding-bottom: 12px;">
                        <span style="color: #166534; font-size: 14px; font-weight: 500;">Amount Sent</span>
                        <span style="color: #166534; font-weight: 700; font-size: 18px;">${payout.currency || 'BDT'} ${payout.netPayout || payout.amount}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #166534; font-size: 14px;">Transaction ID</span>
                        <span style="color: #166534; font-family: 'Courier New', monospace;">${payout.transactionId || 'N/A'}</span>
                    </div>
                </div>
            ` : '';
            break;

        case 'PAYOUT_ON_HOLD':
             title = 'Action Required: Payout On Hold ⚠️';
             message = `We encountered a small snag while processing the payout for <strong>${payload.payout?.eventId?.title || 'your event'}</strong>. <br><br>The payout has been temporarily placed on hold. This is usually due to a missing piece of information or a routine security check. Please review the details below.`;
             details = `
                <div style="background: #ffffb8; border: 1px solid #fef08a; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                    <strong style="color: #854d0e; display: block; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Reason for Hold</strong>
                    <p style="margin: 0; color: #713f12; font-size: 15px;">${payload.payout?.holdReason || 'Administrative Review Required'}</p>
                </div>
             `;
             ctaLink = `${process.env.CLIENT_URL || 'https://zenvy.com'}/host/payouts`;
             ctaText = 'Review Payout Details';
             break;

        case 'PAYOUT_REJECTION':
            title = 'Payout Declined ❌';
            message = `We regret to inform you that we were unable to proceed with the payout for <strong>${payload.payout?.eventId?.title || 'your event'}</strong>. <br><br>After reviewing the transaction details, the request was declined. Please see the specific reason below.`;
            details = `
                <div style="background: #fff1f2; border: 1px solid #ffe4e6; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                    <strong style="color: #9f1239; display: block; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Rejection Reason</strong>
                    <p style="margin: 0; color: #881337; font-size: 15px;">${payload.payout?.rejectionReason || 'Policy Violation / Security Concern'}</p>
                </div>
             `;
            ctaText = 'Contact Support';
            ctaLink = 'mailto:support@zenvy.com';
            break;

        // --- EVENT NOTIFICATIONS ---
        case 'EVENT_APPROVED':
            title = 'You\'re Live! 🚀';
            message = `Congratulations! We've reviewed your event <strong>${eventTitle}</strong>, and it looks fantastic. <br><br>It has passed our quality checks and is now officially <strong>LIVE</strong> on Zenvy. You can now start sharing your event link with your audience and selling tickets! Good luck with your sales!`;
            ctaLink = `${process.env.CLIENT_URL || 'https://zenvy.com'}/events/${payload.eventId || ''}`;
            ctaText = 'View Live Event';
            break;

         case 'EVENT_REJECTED':
            title = 'Update Regarding Your Submission 📝';
            message = `Thank you for submitting <strong>${eventTitle}</strong>. We appreciate the effort you put into creating this event. <br><br>After a careful review, we noticed a few things that don't quite align with our platform guidelines. Unfortunately, we cannot approve the event in its current form. Please review the feedback below to understand what needs to be changed.`;
             details = reason ? `
                <div style="background: #fdf2f8; border: 1px solid #fce7f3; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                    <strong style="color: #be185d; display: block; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Feedback from Review Team</strong>
                    <p style="margin: 0; color: #9d174d; font-size: 15px;">${reason}</p>
                </div>
             ` : '';
            ctaLink = `${process.env.CLIENT_URL || 'https://zenvy.com'}/host/events`;
            ctaText = 'Edit Event';
            break;

        case 'EVENT_FEATURED':
            title = 'You are Featured! 🌟';
            message = `We've got some exciting news! Your event, <strong>${eventTitle}</strong>, stood out to our curation team. <br><br>We've decided to <strong>feature</strong> it on the Zenvy homepage! This means increased visibility to thousands of visitors and potentially more ticket sales. Keep up the amazing work creating great experiences!`;
            ctaLink = `${process.env.CLIENT_URL || 'https://zenvy.com'}`;
            ctaText = 'See Homepage';
            break;

        case 'EVENT_UNFEATURED':
            title = 'Feature Rotation Update';
            message = `We wanted to let you know that your event, <strong>${eventTitle}</strong>, has completed its scheduled time in our featured spotlight. <br><br>We hope the extra visibility brought you some great traction! Your event remains live and searchable as normal. We look forward to seeing what you create next—maybe we'll feature you again soon!`;
            break;

        case 'EVENT_SUSPENDED':
            title = 'Important: Event Suspended 🛑';
            message = `We're writing to let you know that your event, <strong>${eventTitle}</strong>, has been temporarily suspended. <br><br>This action was taken due to a potential violation of our terms of service or a community report. Your event is currently not visible to the public, and sales have been paused immediately.`;
             details = payload.payout?.suspensionReason || reason ? `
                <div style="background: #fef2f2; border: 1px solid #fee2e2; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                    <strong style="color: #b91c1c; display: block; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Suspension Reason</strong>
                    <p style="margin: 0; color: #991b1b; font-size: 15px;">${payload.payout?.suspensionReason || reason}</p>
                </div>
             ` : '';
            ctaText = 'Contact Support';
            ctaLink = 'mailto:support@zenvy.com';
            break;

        case 'EVENT_UNSUSPENDED':
            title = 'Event Restored ✅';
            message = `Good news! multiple checks have been completed, and the suspension on your event <strong>${eventTitle}</strong> has been lifted. <br><br>Your event is now back online and visible to the public. You can resume sales immediately. Thank you for your cooperation in resolving this matter.`;
            ctaLink = `${process.env.CLIENT_URL || 'https://zenvy.com'}/host/events`;
            ctaText = 'Manage Event';
            break;

        // --- SALES CONTROLS ---
        case 'EVENT_SALES_PAUSED':
            title = 'Sales Paused ⏸️';
            message = `Just confirming that ticket sales for <strong>${eventTitle}</strong> have been paused as requested (or by admin action). <br><br>Customers will not be able to purchase tickets until sales are resumed. You can re-enable sales at any time from your dashboard.`;
            break;
            
        case 'EVENT_SALES_RESUMED':
            title = 'Sales Resumed ▶️';
            message = `You're back in business! Ticket sales for <strong>${eventTitle}</strong> have been resumed. <br><br>Customers can now purchase tickets again. Good luck with the rest of your sales!`;
            break;

        // --- REFUND NOTIFICATIONS ---
        case 'PRICE_REDUCTION_REFUND':
             title = 'Good News: Partial Refund 💰';
             message = `We have a pleasant surprise for you! The host of <strong>${payload.event?.title}</strong> has lowered the ticket price, and we believe in fair pricing. <br><br>You have automatically received a <strong>partial refund</strong> for the difference. No action is needed on your part—the funds have been sent to your original payment method.`;
             details = `
                 <div style="background: #f0fdf4; border: 1px solid #dcfce7; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #bbf7d0; padding-bottom: 12px;">
                        <span style="color: #166534; font-size: 14px; font-weight: 500;">Refund Amount</span>
                        <span style="color: #166534; font-weight: 700; font-size: 18px;">BDT ${refundAmount}</span>
                    </div>
                     <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px;">
                        <span style="color: #15803d;">Original Price</span>
                        <span style="color: #15803d; text-decoration: line-through;">BDT ${payload.oldPrice}</span>
                    </div>
                     <div style="display: flex; justify-content: space-between; font-size: 14px;">
                        <span style="color: #15803d;">New Lower Price</span>
                        <span style="color: #15803d; font-weight: 600;">BDT ${payload.newPrice}</span>
                    </div>
                </div>
             `;
             break;
        
        case 'REFUND_CONFIRMATION':
             title = 'Refund Processed';
             message = `This email is to confirm that a refund has been processed for your order <strong>#${order?.orderNumber}</strong> for the event <strong>${payload.event?.title}</strong>. <br><br>We hope to see you at another event soon!`;
             details = `
                 <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #64748b; font-size: 14px; font-weight: 500;">Total Refunded</span>
                        <span style="color: #0f172a; font-weight: 700; font-size: 16px;">BDT ${refundAmount}</span>
                    </div>
                </div>
             `;
             break;

        default:
             // Fallback
             title = type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
             message = `This is a notification regarding your event <strong>${eventTitle || ''}</strong>. We wanted to keep you updated on the latest changes to your account or event status.`;
             if(reason) details = `<p style="background: #f1f5f9; padding: 12px; border-radius: 6px;">Reason: ${reason}</p>`;
             break;
    }

    // --- HTML TEMPLATE ---
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title.replace(/<[^>]*>?/gm, '')}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9; -webkit-font-smoothing: antialiased;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);">
          
          <!-- Header (Brand Gradient) -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 48px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -1px;">
                Zenvy
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 14px; font-weight: 400;">The Future of Events</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 48px 40px;">
              ${hostName || payload.user?.name ? `
              <p style="margin: 0 0 24px; color: #334155; font-size: 18px; font-weight: 500;">
                Hi ${hostName || payload.user?.name},
              </p>
              ` : ''}
              
              <h2 style="margin: 0 0 20px; color: #0f172a; font-size: 24px; font-weight: 700; line-height: 1.3;">
                ${title}
              </h2>

              <p style="margin: 0 0 32px; color: #475569; font-size: 16px; line-height: 1.7; font-weight: 400;">
                ${message}
              </p>

              ${details}

              ${ctaLink ? `
              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td>
                    <a href="${ctaLink}" style="display: inline-block; padding: 16px 40px; background: #4f46e5; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 50px; text-align: center; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 32px 0 0; color: #94a3b8; font-size: 13px; text-align: center;">
                 Or copy this link: <a href="${ctaLink}" style="color: #6366f1;">${ctaLink}</a>
              </p>
              ` : ''}

              <div style="margin-top: 48px; border-top: 1px solid #e2e8f0; padding-top: 32px;">
                 <p style="margin: 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                    Measurement is the first step that leads to control and eventually to improvement. If you can't measure something, you can't understand it.
                 </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0 0 12px; color: #64748b; font-size: 14px; font-weight: 500;">
                Questions? We're here to help.
              </p>
              <p style="margin: 0 0 24px; color: #6366f1; font-size: 14px; font-weight: 600;">
                <a href="mailto:support@zenvy.com" style="color: inherit; text-decoration: none;">support@zenvy.com</a>
              </p>
              
              <div style="border-top: 1px solid #e2e8f0; width: 40px; margin: 0 auto 24px;"></div>

              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                © ${new Date().getFullYear()} Zenvy Inc. All rights reserved. <br>
                Dhaka, Bangladesh
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

function getPayoutStatusText(status: string) {
    switch (status) {
        case 'pending': return 'Processing';
        case 'approved': return 'Approved - Sending Soon';
        case 'processing': return 'Transfer in Progress';
        case 'completed': return 'Paid';
        case 'failed': return 'Transfer Failed';
        case 'on_hold': return 'On Hold';
        case 'rejected': return 'Rejected';
        default: return status;
    }
}
