/**
 * Premium Ticket HTML Template Generator
 * Generates a beautiful, print-ready A4 ticket with luxury design
 */

export interface TicketTemplateParams {
  ticketNumber: string;
  qrCodeUrl: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  venueAddress: string;
  ticketType: string;
  price: number;
  benefits: string[];
  orderNumber: string;
  buyerName?: string;
  eventEndTime?: string;
}

export function generateTicketHTML(params: TicketTemplateParams): string {
  const {
    ticketNumber,
    qrCodeUrl,
    eventTitle,
    eventDate,
    eventTime,
    venue,
    venueAddress,
    ticketType,
    price,
    benefits,
    orderNumber,
    buyerName,
    eventEndTime,
  } = params;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ticket - ${ticketNumber}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@200;300;399;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'DM Sans', 'Inter', sans-serif;
      background: #ffffff;
      color: #1e293b;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .ticket-container {
      width: 210mm;
      min-height: 297mm;
      padding: 20mm;
      margin: 0 auto;
      background: white;
      position: relative;
    }

    /* Header Section */
    .header {
      background: #161616;
      padding: 30px 40px;
      color: white;
      border: 3px solid #161616;
      position: relative;
    }

    .event-title {
      font-family: 'DM Sans', 'Outfit', sans-serif;
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
      line-height: 1.2;
    }

    .event-subtitle {
      font-size: 14px;
      font-weight: 400;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #cbd5e1;
    }

    /* Main Content */
    .main-content {
      display: flex;
      gap: 40px;
      padding: 40px;
      background: white;
      border-left: 3px solid #161616;
      border-right: 3px solid #161616;
      border-bottom: 2px solid #e2e8f0;
    }

    .qr-section {
      flex-shrink: 0;
    }

    .qr-container {
      background: white;
      padding: 24px;
      border: 2px solid #161616;
      text-align: center;
    }

    .qr-code {
      width: 200px;
      height: 200px;
      margin-bottom: 16px;
    }

    .qr-label {
      font-size: 11px;
      color: #161616;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .details-section {
      flex: 1;
    }

    .detail-group {
      margin-bottom: 24px;
    }

    .detail-label {
      font-size: 11px;
      color: #64748b;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }

    .detail-value {
      font-size: 16px;
      color: #161616;
      font-weight: 500;
      line-height: 1.5;
    }

    .detail-value.large {
      font-size: 20px;
      font-weight: 700;
    }

    .detail-value.highlight {
      display: inline-block;
      border: 2px solid #161616;
      padding: 4px 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* Ticket Info Bar */
    .ticket-info-bar {
      display: flex;
      justify-content: space-between;
      padding: 24px 40px;
      background: white;
      border-left: 3px solid #161616;
      border-right: 3px solid #161616;
      border-bottom: 3px solid #161616;
    }

    .info-item {
      text-align: left;
    }

    .info-label {
      font-size: 10px;
      color: #64748b;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }

    .info-value {
      font-size: 14px;
      color: #161616;
      font-weight: 700;
      font-family: 'Courier New', monospace;
    }

    /* Benefits Section */
    .benefits-section {
      padding: 30px 40px;
      background: white;
      border-left: 3px solid #161616;
      border-right: 3px solid #161616;
      border-bottom: 3px solid #161616;
    }

    .benefits-title {
      font-size: 14px;
      font-weight: 700;
      color: #161616;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .benefits-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .benefit-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;
      color: #161616;
      font-weight: 500;
    }

    .benefit-check {
      width: 18px;
      height: 18px;
      background: #161616;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      flex-shrink: 0;
    }

    /* Footer */
    .footer {
      padding: 30px 40px;
      background: #f8f8f8;
      border-left: 3px solid #161616;
      border-right: 3px solid #161616;
      border-bottom: 3px solid #161616;
    }

    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: start;
      gap: 40px;
    }

    .terms {
      flex: 1;
    }

    .terms-title {
      font-size: 12px;
      font-weight: 700;
      color: #161616;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .terms-text {
      font-size: 10px;
      color: #64748b;
      line-height: 1.6;
    }

    .branding {
      text-align: right;
    }

    .powered-by {
      font-size: 10px;
      font-weight: 700;
      color: #161616;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .brand-name {
      color: #161616;
    }

    /* Print Styles */
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      
      .ticket-container {
        margin: 0;
        padding: 15mm;
      }
    }
  </style>
</head>
<body>
  <div class="ticket-container">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <h1 class="event-title">${eventTitle}</h1>
        <p class="event-subtitle">Your exclusive access pass</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- QR Code Section -->
      <div class="qr-section">
        <div class="qr-container">
          <img src="${qrCodeUrl}" alt="QR Code" class="qr-code" />
          <p class="qr-label">Scan at Entry</p>
        </div>
      </div>

      <!-- Details Section -->
      <div class="details-section">
        <div class="detail-group">
          <div class="detail-label">Date & Time</div>
          <div class="detail-value large">${eventDate}</div>
          <div class="detail-value">${eventTime}${eventEndTime ? ` - ${eventEndTime}` : ''}</div>
        </div>

        <div class="detail-group">
          <div class="detail-label">Venue</div>
          <div class="detail-value large">${venue}</div>
          <div class="detail-value">${venueAddress}</div>
        </div>

        <div class="detail-group">
          <div class="detail-label">Ticket Type</div>
          <div class="detail-value highlight">${ticketType}</div>
        </div>

        ${buyerName ? `
        <div class="detail-group">
          <div class="detail-label">Attendee</div>
          <div class="detail-value">${buyerName}</div>
        </div>
        ` : ''}
      </div>
    </div>

    <!-- Ticket Info Bar -->
    <div class="ticket-info-bar">
      <div class="info-item">
        <div class="info-label">Ticket Number</div>
        <div class="info-value">${ticketNumber}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Order Number</div>
        <div class="info-value">${orderNumber}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Price</div>
        <div class="info-value">BDT ${price.toFixed(2)}</div>
      </div>
    </div>

    <!-- Benefits Section -->
    ${benefits.length > 0 ? `
    <div class="benefits-section">
      <h3 class="benefits-title">Ticket Benefits</h3>
      <div class="benefits-list">
        ${benefits.map(benefit => `
          <div class="benefit-item">
            <span class="benefit-check">✓</span>
            <span>${benefit}</span>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <!-- Footer -->
    <div class="footer">
      <div class="footer-content">
        <div class="terms">
          <h4 class="terms-title">Important Information</h4>
          <p class="terms-text">
            This ticket is valid for one person only and must be presented at the venue entrance. 
            Ticket is non-transferable and non-refundable. Please arrive 30 minutes before the event start time. 
            By attending this event, you agree to follow all venue rules and regulations.
          </p>
        </div>
        <div class="branding">
          <p class="powered-by">Powered by</p>
          <div class="brand-name">
            <svg viewBox="0 0 94 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: #161616; width: 64px; height: 16px;">
              <path transform="scale(0.8) translate(0, 4)" d="M4 6H16L6 18H18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path transform="scale(0.8) translate(0, 4)" d="M36 6H24V18H36 M24 12H34" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path transform="scale(0.8) translate(0, 4)" d="M42 18V6L54 18V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path transform="scale(0.8) translate(0, 4)" d="M60 6L66 18L72 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path transform="scale(0.8) translate(0, 4)" d="M78 6L84 12L90 6 M84 12V18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
