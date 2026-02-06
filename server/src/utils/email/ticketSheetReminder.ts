/**
 * Ticket Sheet Reminder Template
 * Notification sent to hosts 24h/3h before event to download ticket sheet/prepare for check-in.
 */

interface TicketSheetReminderPayload {
  hostName: string;
  hostEmail: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  totalTickets: number;
  downloadUrl: string;
  timing: '24h' | '3h';
  hoursUntilEvent: number;
}

export function ticketSheetReminderTemplate(payload: TicketSheetReminderPayload): string {
  const { 
    hostName, 
    eventTitle, 
    eventDate, 
    eventTime, 
    venue, 
    totalTickets, 
    downloadUrl, 
    hoursUntilEvent 
  } = payload;

  const headline = hoursUntilEvent === 24 
    ? "Your event is tomorrow! Are you ready?" 
    : "Your event starts in 3 hours!";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Reminder: ${eventTitle}</title>
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
              <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 300;">
                Host Dashboard
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 48px 40px;">
              <p style="margin: 0 0 24px; color: #1e293b; font-size: 18px; font-weight: 500;">
                Hi ${hostName},
              </p>
              
              <p style="margin: 0 0 16px; color: #475569; font-size: 16px; line-height: 1.6; font-weight: 300;">
                <strong style="color: #6366f1;">${headline}</strong>
              </p>

              <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6; font-weight: 300;">
                We're sending you this reminder to help you prepare for <strong>${eventTitle}</strong>. You have sold <strong>${totalTickets} tickets</strong> so far.
              </p>
              
              <!-- Event Details Card -->
              <table role="presentation" style="width: 100%; background-color: #f8fafc; border-radius: 12px; margin-bottom: 32px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                          <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Event Title</p>
                          <p style="margin: 4px 0 0; color: #1e293b; font-size: 16px; font-weight: 500;">${eventTitle}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                          <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Date & Time</p>
                          <p style="margin: 4px 0 0; color: #1e293b; font-size: 16px; font-weight: 500;">${eventDate} at ${eventTime}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 12px;">
                          <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Venue</p>
                          <p style="margin: 4px 0 0; color: #1e293b; font-size: 16px; font-weight: 500;">${venue}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 32px; color: #475569; font-size: 16px; line-height: 1.6; font-weight: 300;">
                You can download the guest list PDF or access the real-time scanner from your dashboard.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);">
                    <a href="${downloadUrl}" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 500; border-radius: 8px;">
                      Open Host Dashboard
                    </a>
                  </td>
                </tr>
              </table>

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
