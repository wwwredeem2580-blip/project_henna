/**
 * Modern Minimal Order Confirmation Email Template
 * Industry-grade design for order confirmations
 */

interface OrderConfirmationPayload {
  orderNumber: string;
  buyerName: string;
  buyerEmail: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  venueAddress: string;
  tickets: Array<{
    ticketType: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentMethod: string;
  transactionId?: string;
}

export function orderConfirmationTemplate(payload: OrderConfirmationPayload): string {
  const {
    orderNumber,
    buyerName,
    buyerEmail,
    eventTitle,
    eventDate,
    eventTime,
    venue,
    venueAddress,
    tickets,
    totalAmount,
    paymentMethod,
    transactionId,
  } = payload;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; -webkit-font-smoothing: antialiased;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 48px 40px; text-align: center;">
              <div style="width: 64px; height: 64px; margin: 0 auto 16px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <div style="font-size: 32px">✓</div>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                Order Confirmed!
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 300;">
                Your tickets are ready
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; color: #1e293b; font-size: 18px; font-weight: 500;">
                Hi ${buyerName},
              </p>
              
              <p style="margin: 0 0 32px; color: #475569; font-size: 16px; line-height: 1.6; font-weight: 300;">
                Thank you for your purchase! Your order has been confirmed and your tickets have been generated. You can view and download your tickets from your wallet.
              </p>

              <!-- Order Details -->
              <table role="presentation" style="width: 100%; margin: 0 0 32px; background-color: #f8fafc; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Order Details
                    </h2>
                    
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 400;">Order Number</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600; text-align: right; font-family: 'Courier New', monospace;">${orderNumber}</td>
                      </tr>
                      ${transactionId ? `
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 400;">Transaction ID</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600; text-align: right; font-family: 'Courier New', monospace;">${transactionId}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 400;">Payment Method</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600; text-align: right;">${paymentMethod}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Event Details -->
              <table role="presentation" style="width: 100%; margin: 0 0 32px; background-color: #f8fafc; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Event Information
                    </h2>
                    
                    <h3 style="margin: 0 0 12px; color: #6366f1; font-size: 20px; font-weight: 600;">
                      ${eventTitle}
                    </h3>
                    
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px; font-weight: 400;">📅 Date & Time</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: 500; text-align: right;">${eventDate} at ${eventTime}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px; font-weight: 400;">📍 Venue</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: 500; text-align: right;">${venue}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 300; text-align: right;">${venueAddress}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Tickets -->
              <table role="presentation" style="width: 100%; margin: 0 0 32px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Your Tickets
                    </h2>
                    
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <thead>
                        <tr style="border-bottom: 2px solid #e2e8f0;">
                          <th style="padding: 12px 0; text-align: left; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Ticket Type</th>
                          <th style="padding: 12px 0; text-align: center; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
                          <th style="padding: 12px 0; text-align: right; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${tickets.map(ticket => `
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                          <td style="padding: 16px 0; color: #1e293b; font-size: 14px; font-weight: 500;">${ticket.ticketType}</td>
                          <td style="padding: 16px 0; text-align: center; color: #64748b; font-size: 14px; font-weight: 400;">${ticket.quantity}</td>
                          <td style="padding: 16px 0; text-align: right; color: #1e293b; font-size: 14px; font-weight: 500;">BDT ${ticket.price.toFixed(2)}</td>
                        </tr>
                        `).join('')}
                        <tr>
                          <td colspan="2" style="padding: 16px 0; color: #1e293b; font-size: 16px; font-weight: 600;">Total</td>
                          <td style="padding: 16px 0; text-align: right; color: #6366f1; font-size: 18px; font-weight: 700;">BDT ${totalAmount.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto 32px; width: 100%;">
                <tr>
                  <td style="text-align: center;">
                    <table role="presentation" style="margin: 0 auto;">
                      <tr>
                        <td style="border-radius: 8px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);">
                          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/wallet" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 500; border-radius: 8px;">
                            View My Tickets
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Important Info -->
              <table role="presentation" style="width: 100%; border-left: 4px solid #6366f1; background-color: #f1f5f9; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 8px; color: #1e293b; font-size: 14px; font-weight: 600;">
                      📱 Important Information
                    </p>
                    <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.6; font-weight: 300;">
                      <li>Your tickets have been sent to: ${buyerEmail}</li>
                      <li>Present your QR code at the venue entrance</li>
                      <li>Arrive 30 minutes before the event starts</li>
                      <li>Tickets are non-transferable and non-refundable</li>
                    </ul>
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
