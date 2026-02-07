'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ticketService, Ticket } from "@/lib/api/ticket";
import { pdfService } from "@/lib/api/pdf";
import { ChevronDown, DownloadIcon, FileText, Eye, Loader2 } from "lucide-react";


import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from "@/lib/context/auth";
import { authService } from "@/lib/api/auth";

import { TicketCard } from "../ui/TicketCard";
import { QRModal } from "./QRModal";

import Sidebar from "../layout/Sidebar";

export default function WalletPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [downloadingPDF, setDownloadingPDF] = useState<string | null>(null);
  const [downloadingBulk, setDownloadingBulk] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  // Fetch user tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const userTickets = await ticketService.getUserTickets();
        setTickets(userTickets);
      } catch (err: any) {
        console.error('Failed to fetch tickets:', err);
        setError(err.message || 'Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Group tickets by event
  const groupedTickets = tickets.reduce((acc, ticket) => {
    const eventId = ticket.eventId;
    if (!acc[eventId]) {
      acc[eventId] = {
        eventId,
        eventTitle: ticket.eventTitle,
        eventDate: ticket.eventDate,
        eventVenue: ticket.eventVenue,
        venueAddress: ticket.venueAddress,
        tickets: [],
      };
    }
    acc[eventId].tickets.push(ticket);
    return acc;
  }, {} as Record<string, { eventId: string; eventTitle: string; eventDate: string; eventVenue: string; venueAddress: string; tickets: Ticket[] }>);

  const eventGroups = Object.values(groupedTickets);

  // Handle QR code download
  const handleDownloadQR = async (qrCodeUrl: string, ticketNumber: string) => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${ticketNumber}-QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download QR code:', error);
    }
  };

  // Handle single PDF download
  const handleDownloadPDF = async (ticketId: string) => {
    if (downloadingPDF) return; // Prevent spam clicks
    
    try {
      setDownloadingPDF(ticketId);
      await pdfService.downloadTicketPDF(ticketId);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingPDF(null);
    }
  };

  // Handle bulk PDF download
  const handleDownloadAllPDFs = async (ticketIds: string[]) => {
    const eventId = ticketIds[0]; // Use first ticket ID as event identifier
    if (downloadingBulk) return; // Prevent spam clicks
    
    try {
      setDownloadingBulk(eventId);
      await pdfService.downloadBulkTicketPDFs(ticketIds);
    } catch (error) {
      console.error('Failed to download PDFs:', error);
      alert('Failed to download PDFs. Please try again.');
    } finally {
      setDownloadingBulk(null);
    }
  };


  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white font-sans text-slate-950">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 min-w-0 lg:ml-64 p-4 lg:p-8 ">

        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-[400] tracking-normal text-slate-900">Wallet</h1>
            <p className="text-sm text-slate-500 font-[300]">All your secure entries and digital invitations in one industry-grade vault.</p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
              <button onClick={() => router.push('/events')} title="Explore Events" className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"><Calendar size={18}/></button>
              <button onClick={() => router.push('/contact')} title="Help" className="p-2 transition-all text-brand-400 hover:text-brand-500 border border-slate-100 rounded-lg hover:bg-slate-50"><HelpCircle size={18}/></button>
              <div title={user?.email} className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden ml-2 border border-slate-200">
              <img onClick={() => {user?.role === 'host' ? router.push('/host/profile') : router.push('/wallet')}} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`} alt="Avatar" className="w-full h-full object-cover cursor-pointer" />
            </div>
          </div>
        </header>
        {/* Tickets */}
        <section className="space-y-6">
            <div className="flex items-center justify-between">
              {/* <div>
                <h2 className="text-lg font-[300] text-slate-900 tracking-tight">Tickets</h2>
                <p className="text-xs text-slate-500 font-[300]">All your tickets are at one place</p>
              </div> */}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-slate-600 font-[300]">Loading your tickets...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                  <p className="text-red-600 font-[400]">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="text-sm text-brand-500 hover:underline"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : eventGroups.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                  <p className="text-slate-600 font-[400]">No tickets found</p>
                  <button 
                    onClick={() => router.push('/events')}
                    className="text-sm text-brand-500 hover:underline"
                  >
                    Browse Events
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {eventGroups.map((eventGroup: any) => {
                  const eventDate = new Date(eventGroup.eventDate);
                  const formattedDate = eventDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                  const formattedTime = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                  const daysUntilEvent = Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={eventGroup.eventId}>
                      <div
                        onClick={() => setExpandedId(expandedId === eventGroup.eventId ? null : eventGroup.eventId)}
                        className='max-w-[90vw] group cursor-pointer transition-all duration-300 p-4 flex items-center gap-0 overflow-hidden relative select-none'
                      >
                        <div className='rounded-tr-lg rounded-bl-lg overflow-hidden shrink-0 relative bg-slate-100 w-24 h-24'>
                          <img src='https://fastly.picsum.photos/id/1084/536/354.jpg?grayscale&hmac=Ux7nzg19e1q35mlUVZjhCLxqkR30cC-CarVg-nlIf60' alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        </div>

                        <div className="px-6 py-4 w-full h-full flex flex-col gap-1 relative">
                          <div className="text-md font-[400] line-clamp-2 tracking-wide text-neutral-700">
                            {eventGroup.eventTitle}
                          </div>
                          <div className="text-neutral-400 line-clamp-2 font-[500] text-[10px] uppercase tracking-widest">
                            {eventGroup.eventVenue}, {eventGroup.venueAddress}
                          </div>
                          <div className="mt-2">
                            <div className="text-neutral-400 font-[500] line-clamp-2 text-[10px] uppercase tracking-widest">
                              {formattedDate}
                            </div>
                            <div className="text-neutral-400 font-[500] line-clamp-2 text-[10px] uppercase tracking-widest">
                              {formattedTime}
                            </div>
                          </div>
                          <span className="text-xs text-slate-500 line-clamp-1 font-[300]">
                            {daysUntilEvent > 0 ? `${daysUntilEvent} Days Left` : daysUntilEvent === 0 ? 'Today' : 'Event Passed'}
                          </span>
                          <div className="mt-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const ticketIds = eventGroup.tickets.map((t: any) => t._id);
                                handleDownloadAllPDFs(ticketIds);
                              }}
                              disabled={downloadingBulk === eventGroup.tickets[0]._id}
                              className="border text-[10px] sm:text-xs font-[300] hover:scale-103 transition-transform duration-100 flex items-center gap-2 border-neutral-300 px-2 py-1 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {downloadingBulk === eventGroup.tickets[0]._id ? (
                                <>
                                  <Loader2 size={12} className="animate-spin" />
                                  Downloading...
                                </>
                              ) : (
                                <>
                                  <DownloadIcon size={12} />
                                  Download All ({eventGroup.tickets.length})
                                </>
                              )}
                            </button>
                          </div>

                          <div className="absolute bottom-18 right-2 transition-transform pointer-events-none">
                            <ChevronDown size={24} className={`group-hover:scale-120 transition-transform duration-300 ${expandedId === eventGroup.eventId ? 'rotate-180' : ''}`} strokeWidth={1}/>
                          </div>
                        </div>
                      </div>
                      {/*Tickets*/}
                      <AnimatePresence>
                        {expandedId === eventGroup.eventId && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 max-w-full pb-6 overflow-x-auto">
                              <div className="flex gap-4">
                                {eventGroup.tickets.map((ticket: any) => {
                                  const ticketEventDate = new Date(ticket.eventDate);
                                  const ticketEndDate = new Date(ticket.validUntil);
                                  
                                  return (
                                    <div key={ticket._id} className="min-w-[300px] w-[300px]">
                                      <TicketCard ticket={{
                                        _id: ticket._id,
                                        tier: ticket.ticketTheme.tier,
                                        name: ticket?.ticketTheme.name || 'Ticket Name',
                                        controls: false,
                                        startDate: ticketEventDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                                        endDate: ticketEndDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                                        startTime: ticketEventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                                        endTime: ticketEndDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                                        price: ticket.price,
                                        quantity: 1,
                                        benefits: ticket.ticketTheme?.benefits || [
                                          'Access to event',
                                          'Dedicated entrance',
                                        ],
                                        venue: `${ticket.eventVenue}, ${ticket.venueAddress}`,
                                        onClick: () => {},
                                      }}
                                      />
                                      <div className="flex text-xs font-[400] text-slate-500 items-center gap-2 mt-2 justify-center">
                                        <button 
                                          onClick={() => setSelectedTicket(ticket)}
                                          className="border hover:scale-105 transition-transform duration-100 flex items-center gap-2 border-neutral-300 px-2 py-1 rounded-sm"
                                        >
                                          <Eye size={12} />
                                          Reveal QR
                                        </button>
                                        <button 
                                          onClick={() => handleDownloadQR(ticket.qrCodeUrl, ticket.ticketNumber)}
                                          className="border hover:scale-105 transition-transform duration-100 flex items-center gap-2 border-neutral-300 px-2 py-1 rounded-sm"
                                        >
                                          <DownloadIcon size={12} />
                                          QR Image
                                        </button>
                                        <button 
                                          onClick={() => handleDownloadPDF(ticket._id)}
                                          disabled={downloadingPDF === ticket._id}
                                          className="border hover:scale-105 transition-transform duration-100 flex items-center gap-2 border-neutral-300 px-2 py-1 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          {downloadingPDF === ticket._id ? (
                                            <>
                                              <Loader2 size={12} className="animate-spin" />
                                              Loading...
                                            </>
                                          ) : (
                                            <>
                                              <FileText size={12} />
                                              PDF
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
      </main>

      {/* QR Code Modal */}
      {selectedTicket && (
        <QRModal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          qrCodeUrl={selectedTicket.qrCodeUrl}
          ticketNumber={selectedTicket.ticketNumber}
          eventTitle={selectedTicket.eventTitle}
          ticketType={selectedTicket.ticketType}
          onDownload={() => handleDownloadQR(selectedTicket.qrCodeUrl, selectedTicket.ticketNumber)}
        />
      )}
    </div>
  );
};
