/**
 * PDF API Client
 * Client-side service for downloading ticket PDFs
 */

/**
 * Trigger browser download for a file
 * @param blob - File blob
 * @param filename - Download filename
 */
function triggerDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export const pdfService = {
  /**
   * Download a single ticket PDF
   * @param ticketId - ID of the ticket to download
   */
  downloadTicketPDF: async (ticketId: string): Promise<void> => {
    try {
      const response = await fetch('/api/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticketId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate PDF');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `ticket-${ticketId}.pdf`;

      // Convert response to blob and trigger download
      const blob = await response.blob();
      triggerDownload(blob, filename);
    } catch (error) {
      console.error('Failed to download ticket PDF:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to download PDF');
    }
  },

  /**
   * Download multiple tickets as a ZIP file
   * @param ticketIds - Array of ticket IDs to download
   */
  downloadBulkTicketPDFs: async (ticketIds: string[]): Promise<void> => {
    try {
      if (!ticketIds.length) {
        throw new Error('No tickets selected for download');
      }

      const response = await fetch('/api/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticketIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate PDFs');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `tickets-${Date.now()}.zip`;

      // Convert response to blob and trigger download
      const blob = await response.blob();
      triggerDownload(blob, filename);
    } catch (error) {
      console.error('Failed to download bulk ticket PDFs:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to download PDFs');
    }
  },
};
