import { NextRequest, NextResponse } from 'next/server';
import { generateTicketHTML } from '@/lib/engine/templates/ticket';
import { generateTicketPDF, generateBulkTicketPDFs, BulkTicketData } from '@/lib/engine/pdf';

// Backend API base URL

// Use internal Docker networking for server-side requests in production
// 'http://server:3001' refers to the backend container
const TICKET_BASE_API_URL = process.env.NODE_ENV === 'production' 
  ? 'http://server:3001/ticket' 
  : 'http://localhost:3001/ticket';

/**
 * Fetch user tickets from backend API
 */
async function fetchUserTickets(request: NextRequest): Promise<any[]> {
  try {
    // Get cookies from the request
    const cookieHeader = request.headers.get('cookie') || '';
    console.log(TICKET_BASE_API_URL);
    const response = await fetch(`${TICKET_BASE_API_URL}`, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tickets: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching tickets:', error);
    throw new Error('Failed to fetch tickets');
  }
}

/**
 * POST /api/pdf
 * Generate ticket PDF(s) - single or bulk
 * 
 * Request body:
 * - Single: { ticketId: string }
 * - Bulk: { ticketIds: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log(body);
    // Determine if this is a bulk request
    const isBulkRequest = 'ticketIds' in body && Array.isArray(body.ticketIds);

    if (isBulkRequest) {
      // Handle bulk PDF generation
      return await handleBulkPDFGeneration(body.ticketIds, request);
    } else if ('ticketId' in body) {
      // Handle single PDF generation
      return await handleSinglePDFGeneration(body.ticketId, request);
    } else {
      return NextResponse.json(
        { error: 'Invalid request body. Expected ticketId or ticketIds.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Handle single ticket PDF generation
 */
async function handleSinglePDFGeneration(ticketId: string, request: NextRequest): Promise<NextResponse> {
  try {
    // Fetch all user tickets
    const tickets = await fetchUserTickets(request);
    
    // Find the requested ticket
    const ticket = tickets.find((t: any) => t._id === ticketId);
    
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found or you do not have access to this ticket' },
        { status: 404 }
      );
    }

    // Generate HTML from template
    const html = generateTicketHTML({
      ticketNumber: ticket.ticketNumber,
      qrCodeUrl: ticket.qrCodeUrl,
      eventTitle: ticket.eventTitle,
      eventDate: new Date(ticket.eventDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      eventTime: new Date(ticket.eventDate).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      venue: ticket.eventVenue,
      venueAddress: ticket.venueAddress,
      ticketType: ticket.ticketType,
      price: ticket.price,
      benefits: ticket.ticketTheme?.benefits || ['Access to event', 'Dedicated entrance'],
      orderNumber: ticket.orderId,
      buyerName: undefined, // Can be added if available
      eventEndTime: new Date(ticket.validUntil).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
    });

    // Generate PDF
    const pdfBuffer = await generateTicketPDF(html, ticket.ticketNumber);

    // Return PDF as download
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ticket-${ticket.ticketNumber}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Single PDF generation failed:', error);
    throw error;
  }
}

/**
 * Handle bulk ticket PDF generation (ZIP)
 */
async function handleBulkPDFGeneration(ticketIds: string[], request: NextRequest): Promise<NextResponse> {
  try {
    if (!ticketIds.length) {
      return NextResponse.json(
        { error: 'No ticket IDs provided' },
        { status: 400 }
      );
    }

    // Fetch all user tickets
    const allTickets = await fetchUserTickets(request);
    
    // Filter tickets that match the requested IDs
    const tickets = allTickets.filter((t: any) => ticketIds.includes(t._id));
    
    if (!tickets.length) {
      return NextResponse.json(
        { error: 'No valid tickets found' },
        { status: 404 }
      );
    }

    // Generate HTML for each ticket
    const bulkTicketData: BulkTicketData[] = tickets.map((ticket: any) => ({
      html: generateTicketHTML({
        ticketNumber: ticket.ticketNumber,
        qrCodeUrl: ticket.qrCodeUrl,
        eventTitle: ticket.eventTitle,
        eventDate: new Date(ticket.eventDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        eventTime: new Date(ticket.eventDate).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
        venue: ticket.eventVenue,
        venueAddress: ticket.venueAddress,
        ticketType: ticket.ticketType,
        price: ticket.price,
        benefits: ticket.ticketTheme?.benefits || ['Access to event', 'Dedicated entrance'],
        orderNumber: ticket.orderId,
        buyerName: undefined,
        eventEndTime: new Date(ticket.validUntil).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
      }),
      ticketNumber: ticket.ticketNumber,
    }));

    // Generate ZIP with all PDFs
    const zipStream = await generateBulkTicketPDFs(bulkTicketData);

    // Return ZIP as download
    return new NextResponse(zipStream as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="tickets-${Date.now()}.zip"`,
      },
    });
  } catch (error) {
    console.error('Bulk PDF generation failed:', error);
    throw error;
  }
}
