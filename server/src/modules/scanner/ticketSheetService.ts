import PDFDocument from 'pdfkit';
import { Ticket } from '../../database/ticket/ticket';
import { Event } from '../../database/event/event';
import { TicketSheet } from '../../database/event/ticketSheet';
import CustomError from '../../utils/CustomError';
import { isValidObjectId } from '../../utils/isValidObjectId';
import fs from 'fs';
import path from 'path';

/**
 * Generate PDF ticket sheet for emergency manual verification
 * Returns alphabetically sorted ticket numbers with types
 */
export const generateTicketSheetPDF = async (eventId: string, hostId: string): Promise<string> => {
  if (!isValidObjectId(eventId)) {
    throw new CustomError('Invalid event ID', 400);
  }

  // Get event details
  const event = await Event.findById(eventId);
  if (!event) {
    throw new CustomError('Event not found', 404);
  }

  // Verify ownership
  if (event.hostId.toString() !== hostId) {
    throw new CustomError('Unauthorized', 403);
  }

  // Get all valid tickets for this event
  const tickets = await Ticket.find({
    eventId: eventId,
    status: { $in: ['valid', 'used'] } // Include both valid and already used tickets
  })
    .select('ticketNumber ticketType')
    .lean();

  if (tickets.length === 0) {
    throw new CustomError('No tickets found for this event', 404);
  }

  // Sort tickets alphabetically by ticket number
  const sortedTickets = tickets.sort((a, b) => 
    a.ticketNumber.localeCompare(b.ticketNumber)
  );

  // Group tickets by first letter
  const groupedTickets: Record<string, typeof tickets> = {};
  sortedTickets.forEach(ticket => {
    const firstLetter = ticket.ticketNumber.charAt(0).toUpperCase();
    if (!groupedTickets[firstLetter]) {
      groupedTickets[firstLetter] = [];
    }
    groupedTickets[firstLetter].push(ticket);
  });

  // Create PDF
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 }
  });

  // Create temp directory if it doesn't exist
  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const fileName = `ticket-sheet-${eventId}-${Date.now()}.pdf`;
  const filePath = path.join(tempDir, fileName);
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

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
    .text(`Venue: ${event.location.venue}`, { align: 'center' })
    .text(`Total Tickets: ${tickets.length}`, { align: 'center' })
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
    .text('Ticket Number', 50, doc.y, { width: 250, continued: true })
    .text('Type', 300, doc.y, { width: 245 })
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
      .text(
        `Page ${pageNumber}`,
        50,
        doc.page.height - 30,
        { align: 'center' }
      );
    pageNumber++;
  };

  // Add tickets grouped by letter
  Object.keys(groupedTickets).sort().forEach((letter, index) => {
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

    // Tickets in this section
    doc.fontSize(9).font('Helvetica');
    
    groupedTickets[letter].forEach((ticket, ticketIndex) => {
      if (doc.y > 720) {
        addPageNumber();
        doc.addPage();
        
        // Repeat table header on new page
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Ticket Number', 50, doc.y, { width: 250, continued: true })
          .text('Type', 300, doc.y, { width: 245 })
          .moveDown(0.5);
        
        doc.font('Helvetica').fontSize(9);
      }

      const yPos = doc.y;
      doc
        .text(ticket.ticketNumber, 50, yPos, { width: 250 })
        .text(ticket.ticketType, 300, yPos, { width: 245 });
      
      doc.moveDown(0.3);
    });

    doc.moveDown(0.5);
  });

  // Add final page number
  addPageNumber();

  // Finalize PDF
  doc.end();

  // Wait for PDF to be written
  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  return filePath;
};

/**
 * Generate ticket sheet and save to database
 */
export const generateTicketSheetService = async (eventId: string, hostId: string) => {
  if (!isValidObjectId(eventId)) {
    throw new CustomError('Invalid event ID', 400);
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new CustomError('Event not found', 404);
  }

  if (event.hostId.toString() !== hostId) {
    throw new CustomError('Unauthorized', 403);
  }

  // Check if sheet already exists
  const existingSheet = await TicketSheet.findOne({
    eventId: eventId,
    status: { $in: ['generating', 'available'] }
  });

  if (existingSheet) {
    return {
      success: true,
      message: 'Ticket sheet already exists',
      sheet: {
        availableFrom: existingSheet.availableFrom,
        expiresAt: existingSheet.expiresAt,
        totalTickets: existingSheet.totalTickets,
        status: existingSheet.status
      }
    };
  }

  // Generate PDF
  const pdfPath = await generateTicketSheetPDF(eventId, hostId);
  
  // Get ticket count
  const ticketCount = await Ticket.countDocuments({
    eventId: eventId,
    status: { $in: ['valid', 'used'] }
  });

  // Calculate availability window (24h before event)
  const eventStart = new Date(event.startDate);
  const availableFrom = new Date(eventStart.getTime() - 24 * 60 * 60 * 1000); // 24h before
  const expiresAt = new Date(event.endDate);

  // Create ticket sheet record
  const ticketSheet = await new TicketSheet({
    eventId: eventId,
    generatedBy: hostId,
    availableFrom: availableFrom,
    expiresAt: expiresAt,
    pdfUrl: pdfPath, // In production, this would be S3 URL
    pdfKey: path.basename(pdfPath),
    totalTickets: ticketCount,
    fileSize: fs.statSync(pdfPath).size,
    status: 'available'
  }).save();

  return {
    success: true,
    message: 'Ticket sheet generated successfully',
    sheet: {
      id: ticketSheet._id,
      availableFrom: ticketSheet.availableFrom,
      expiresAt: ticketSheet.expiresAt,
      totalTickets: ticketSheet.totalTickets,
      pdfUrl: ticketSheet.pdfUrl
    }
  };
};

/**
 * Get ticket sheet for download
 */
export const getTicketSheetService = async (eventId: string, hostId: string) => {
  if (!isValidObjectId(eventId)) {
    throw new CustomError('Invalid event ID', 400);
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new CustomError('Event not found', 404);
  }

  if (event.hostId.toString() !== hostId) {
    throw new CustomError('Unauthorized', 403);
  }

  const ticketSheet = await TicketSheet.findOne({
    eventId: eventId,
    status: 'available'
  });

  if (!ticketSheet) {
    return {
      available: false,
      message: 'Ticket sheet not yet available'
    };
  }

  // Check if available
  if (!ticketSheet.isAvailable()) {
    return {
      available: false,
      message: 'Ticket sheet is not available yet or has expired',
      availableFrom: ticketSheet.availableFrom
    };
  }

  // Record download
  await ticketSheet.recordDownload(hostId);

  return {
    available: true,
    sheet: {
      pdfUrl: ticketSheet.pdfUrl,
      totalTickets: ticketSheet.totalTickets,
      generatedAt: ticketSheet.generatedAt,
      availableFrom: ticketSheet.availableFrom,
      expiresAt: ticketSheet.expiresAt
    }
  };
};
