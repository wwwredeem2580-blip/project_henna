import PDFDocument from 'pdfkit';
import { Ticket } from '../../database/ticket/ticket';
import { Event } from '../../database/event/event';
import CustomError from '../../utils/CustomError';
import { isValidObjectId } from '../../utils/isValidObjectId';
import { getCachedPDF, cachePDF, acquirePDFLock, releasePDFLock } from '../../lib/redis';

/**
 * Generate PDF ticket sheet on-demand with Redis caching
 * Returns PDF as Buffer for streaming
 */
export const generateTicketSheetPDF = async (
  eventId: string,
  hostId: string
): Promise<{ pdf: Buffer; ticketCount: number; generatedAt: Date }> => {
  if (!isValidObjectId(eventId)) {
    throw new CustomError('Invalid event ID', 400);
  }

  // 1. Check Redis cache first
  const cachedPDF = await getCachedPDF(eventId);
  if (cachedPDF) {
    console.log(`Serving cached PDF for event ${eventId}`);
    const ticketCount = await Ticket.countDocuments({
      eventId,
      status: { $in: ['valid', 'used'] }
    });
    return {
      pdf: cachedPDF,
      ticketCount,
      generatedAt: new Date() // Approximate - cache doesn't store this
    };
  }

  // 2. Try to acquire lock (prevent concurrent generation)
  const lockAcquired = await acquirePDFLock(eventId);
  if (!lockAcquired) {
    // Another request is generating, wait and retry cache
    console.log(`Waiting for concurrent generation for event ${eventId}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const retryCache = await getCachedPDF(eventId);
    if (retryCache) {
      const ticketCount = await Ticket.countDocuments({
        eventId,
        status: { $in: ['valid', 'used'] }
      });
      return { pdf: retryCache, ticketCount, generatedAt: new Date() };
    }
    throw new CustomError('PDF generation timeout - please try again', 408);
  }

  try {
    // 3. Verify event and ownership
    const event = await Event.findById(eventId);
    if (!event) {
      throw new CustomError('Event not found', 404);
    }
    if (event.hostId.toString() !== hostId) {
      throw new CustomError('Unauthorized', 403);
    }

    // 4. Check availability window (24h before → event end)
    const now = new Date();
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    const availableFrom = new Date(eventStart.getTime() - 24 * 60 * 60 * 1000);

    if (now < availableFrom || now > eventEnd) {
      throw new CustomError(
        'Ticket sheet only available 24 hours before event until event ends',
        403
      );
    }

    // 5. Get valid tickets (exclude refunded)
    const tickets = await Ticket.find({
      eventId: eventId,
      status: { $in: ['valid', 'used'] }
    })
      .select('ticketNumber ticketType')
      .lean();

  if (tickets.length === 0) {
    throw new CustomError('No tickets found for this event', 404);
  }

    // 6. Sort alphabetically
    const sortedTickets = tickets.sort((a, b) =>
      a.ticketNumber.localeCompare(b.ticketNumber)
    );

    // 7. Group by first letter
    const groupedTickets: Record<string, typeof tickets> = {};
    sortedTickets.forEach(ticket => {
      const firstLetter = ticket.ticketNumber.charAt(0).toUpperCase();
      if (!groupedTickets[firstLetter]) {
        groupedTickets[firstLetter] = [];
      }
      groupedTickets[firstLetter].push(ticket);
    });

    // 8. Generate PDF to Buffer (not file)
    const pdfBuffer = await generatePDFBuffer(event, groupedTickets, tickets.length);

    // 9. Cache in Redis
    await cachePDF(eventId, pdfBuffer);

    return {
      pdf: pdfBuffer,
      ticketCount: tickets.length,
      generatedAt: new Date()
    };
  } finally {
    // Always release lock
    await releasePDFLock(eventId);
  }
};

/**
 * Generate PDF to Buffer (stream to memory)
 */
function generatePDFBuffer(
  event: any,
  groupedTickets: Record<string, any[]>,
  totalTickets: number
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    const chunks: Buffer[] = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('CONFIDENTIAL - FOR EVENT USE ONLY', { align: 'center' })
      .moveDown(0.5);

    doc
      .fontSize(16)
      .text(event.title, { align: 'center' })
      .fontSize(12)
      .font('Helvetica')
      .text(`Date: ${new Date(event.startDate).toLocaleDateString()}`, { align: 'center' })
      .text(`Venue: ${event.venue?.name}`, { align: 'center' })
      .text(`Total Tickets: ${totalTickets}`, { align: 'center' })
      .moveDown(1);

    // Divider
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke()
      .moveDown(1);

    // Table header
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Ticket Number', 50, doc.y, { width: 400, continued: true })
      .text('Type', 460, doc.y, { width: 135 })
      .moveDown(0.5);

    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke()
      .moveDown(0.5);

    // Content
    doc.font('Helvetica').fontSize(9);

    let pageNumber = 1;
    const addPageNumber = () => {
      doc
        .fontSize(8)
        .text(`Page ${pageNumber}`, 50, doc.page.height - 30, { align: 'center' });
      pageNumber++;
    };

    // Add tickets grouped by letter
    Object.keys(groupedTickets)
      .sort()
      .forEach(letter => {
        // Section header
        if (doc.y > 700) {
          addPageNumber();
          doc.addPage();
        }

        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .fillColor('#4f46e5')
          .text(letter, 50, doc.y)
          .fillColor('#000000')
          .moveDown(0.3);

        doc
          .moveTo(50, doc.y)
          .lineTo(545, doc.y)
          .strokeColor('#cccccc')
          .stroke()
          .strokeColor('#000000')
          .moveDown(0.3);

        doc.fontSize(9).font('Helvetica');

        groupedTickets[letter].forEach(ticket => {
          if (doc.y > 720) {
            addPageNumber();
            doc.addPage();

            // Repeat header
            doc
              .fontSize(10)
              .font('Helvetica-Bold')
              .text('Ticket Number', 50, doc.y, { width: 400, continued: true })
              .text('Type', 460, doc.y, { width: 135 })
              .moveDown(0.5);

            doc.font('Helvetica').fontSize(9);
          }

          const yPos = doc.y;
          doc
            .text(ticket.ticketNumber, 50, yPos, { width: 400 })
            .text(ticket.ticketType, 460, yPos, { width: 135 });

          doc.moveDown(0.3);
        });

        doc.moveDown(0.5);
      });

    addPageNumber();
    doc.end();
  });
}
