/**
 * PDF Generation Engine
 * Core module for generating ticket PDFs using Puppeteer
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import archiver from 'archiver';
import { PassThrough } from 'stream';

/**
 * Puppeteer browser configuration optimized for serverless environments
 */
const BROWSER_CONFIG = {
  headless: true,
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu',
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor',
  ],
};

/**
 * PDF generation options
 */
const PDF_OPTIONS = {
  format: 'A4' as const,
  landscape: false,
  printBackground: true,
  margin: {
    top: '20px',
    right: '20px',
    bottom: '20px',
    left: '20px',
  },
};

/**
 * Viewport configuration for high-quality rendering
 */
const VIEWPORT_CONFIG = {
  width: 1200,
  height: 800,
  deviceScaleFactor: 2, // 2x for high DPI
};

/**
 * Generate a single ticket PDF from HTML
 * @param html - The HTML content to convert to PDF
 * @param ticketNumber - Ticket number for filename
 * @returns PDF buffer
 */
export async function generateTicketPDF(
  html: string,
  ticketNumber: string
): Promise<Buffer> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    // Launch browser
    browser = await puppeteer.launch(BROWSER_CONFIG);
    page = await browser.newPage();

    // Set viewport for high-quality rendering
    await page.setViewport(VIEWPORT_CONFIG);

    // Set HTML content and wait for network to be idle
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Wait for fonts to load
    await page.waitForFunction(() => document.fonts.ready);

    // Additional wait to ensure all styles are applied
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate PDF
    const pdfBuffer = await page.pdf(PDF_OPTIONS);

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error(`Failed to generate PDF for ticket ${ticketNumber}:`, error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    // Cleanup
    if (page) await page.close().catch(console.error);
    if (browser) await browser.close().catch(console.error);
  }
}

/**
 * Ticket data interface for bulk generation
 */
export interface BulkTicketData {
  html: string;
  ticketNumber: string;
}

/**
 * Generate multiple ticket PDFs and package them into a ZIP file
 * @param tickets - Array of ticket data with HTML and ticket numbers
 * @returns ZIP file buffer as a stream
 */
export async function generateBulkTicketPDFs(
  tickets: BulkTicketData[]
): Promise<PassThrough> {
  if (!tickets.length) {
    throw new Error('No tickets provided for bulk generation');
  }

  // Create ZIP archive
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Maximum compression
  });

  const passThrough = new PassThrough();
  archive.pipe(passThrough);

  try {
    // Generate PDFs concurrently with a limit to avoid overwhelming the system
    const CONCURRENT_LIMIT = 3;
    const results: { buffer: Buffer; ticketNumber: string }[] = [];

    for (let i = 0; i < tickets.length; i += CONCURRENT_LIMIT) {
      const batch = tickets.slice(i, i + CONCURRENT_LIMIT);
      
      const batchResults = await Promise.all(
        batch.map(async (ticket) => {
          const buffer = await generateTicketPDF(ticket.html, ticket.ticketNumber);
          return {
            buffer,
            ticketNumber: ticket.ticketNumber,
          };
        })
      );

      results.push(...batchResults);
    }

    // Add all PDFs to the ZIP archive
    results.forEach(({ buffer, ticketNumber }) => {
      archive.append(buffer, { name: `ticket-${ticketNumber}.pdf` });
    });

    // Finalize the archive
    await archive.finalize();

    return passThrough;
  } catch (error) {
    console.error('Bulk PDF generation failed:', error);
    archive.abort();
    throw new Error(`Bulk PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a single PDF with retry logic
 * @param html - HTML content
 * @param ticketNumber - Ticket number
 * @param maxRetries - Maximum number of retry attempts
 * @returns PDF buffer
 */
export async function generateTicketPDFWithRetry(
  html: string,
  ticketNumber: string,
  maxRetries: number = 2
): Promise<Buffer> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await generateTicketPDF(html, ticketNumber);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.warn(`PDF generation attempt ${attempt + 1} failed for ticket ${ticketNumber}:`, error);
      
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw lastError || new Error('PDF generation failed after retries');
}
