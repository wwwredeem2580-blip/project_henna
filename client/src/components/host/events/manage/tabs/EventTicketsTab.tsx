import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Plus, Edit, Trash, Save, Loader2 } from 'lucide-react';
import Switch from '@/components/ui/Switch';
import { formatTime } from '@/lib/utils';
import { HostEventDetailsResponse } from '@/lib/api/host-analytics';
import { TicketCard } from '@/components/ui/TicketCard';
import { TicketConfiguratorModal } from '@/components/ui/TicketConfiguratorModal';
import { useNotification } from '@/lib/context/notification';
import { eventsService } from '@/lib/api/events';

interface EventTicketsTabProps {
  data: HostEventDetailsResponse | null;
  onUpdate: (newData: HostEventDetailsResponse) => void;
  onRefetch?: () => Promise<void>;
}

export const EventTicketsTab = ({ data, onUpdate, onRefetch }: EventTicketsTabProps) => {
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [editingTicketIndex, setEditingTicketIndex] = useState<number | null>(null);
  const ticketSectionRef = useRef<HTMLDivElement>(null);
  const { showNotification } = useNotification();
  
  // Save functionality state
  const [saving, setSaving] = useState(false);
  const [initialTickets, setInitialTickets] = useState<any[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Track initial state when data loads
  useEffect(() => {
    if (data?.event?.tickets && initialTickets.length === 0) {
      setInitialTickets(JSON.parse(JSON.stringify(data.event.tickets)));
    }
  }, [data?.event?.tickets]);

  // Detect changes by comparing current tickets with initial state
  useEffect(() => {
    if (!data?.event?.tickets) {
      setHasChanges(false);
      return;
    }

    // If we have tickets but no initial state yet, don't mark as changed
    // (this happens on first load)
    if (initialTickets.length === 0 && data.event.tickets.length > 0) {
      // This is the initial load, not a change
      return;
    }

    const currentTickets = JSON.stringify(data.event.tickets);
    const original = JSON.stringify(initialTickets);
    setHasChanges(currentTickets !== original);
  }, [data?.event?.tickets, initialTickets]);

  const handleSave = async () => {
    if (!data?.event || !hasChanges) return;

    try {
      setSaving(true);

      const result = await eventsService.updateEventByStatus(
        data.event._id,
        data.event.status,
        { tickets: data.event.tickets }
      );

      // Handle warnings (price reductions, capacity warnings)
      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          showNotification('info', 'Notice', warning);
        });
      }

      // Handle refunds
      if (result.refundsRequired && result.refundsRequired.length > 0) {
        const totalRefund = result.refundsRequired.reduce(
          (sum, r) => sum + (r.refundAmount || 0),
          0
        );
        showNotification(
          'info',
          'Refunds Processed',
          `BDT ${totalRefund} in refunds will be deducted from your next payout.`
        );
      }

      showNotification('success', 'Saved', result.message || 'Tickets updated successfully');

      // Refetch data from backend to ensure state is in sync
      if (onRefetch) {
        await onRefetch();
      } else {
        // Fallback: Update initial state to new saved state
        setInitialTickets(JSON.parse(JSON.stringify(data.event.tickets)));
      }
      setHasChanges(false);

    } catch (error: any) {
      console.error('Save error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save changes';
      showNotification('error', 'Save Failed', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTicket = () => {
    setEditingTicketIndex(null);
    setIsTicketModalOpen(true);
  };

  const handleEditTicket = (index: number) => {
    setEditingTicketIndex(index);
    setIsTicketModalOpen(true);
  };

  const handleDeleteTicket = (index: number) => {
    if (!data?.event) return;
    
    const ticket = data.event.tickets[index];
    const status = data.event.status;
    
    // Prevent deletion if ticket has sales or reservations (published/live events)
    if ((status === 'published' || status === 'live') && ticket.sold > 0) {
      showNotification(
        'error',
        'Cannot Delete Ticket',
        `This ticket has ${ticket.sold} sales. You cannot delete tickets with existing sales.`
      );
      return;
    }
    
    // In a real app we would call delete API here
    const updatedTickets = data.event.tickets.filter((_, i) => i !== index);
    
    onUpdate({
      ...data,
      event: {
        ...data.event,
        tickets: updatedTickets
      }
    });
    
    showNotification('success', 'Ticket Deleted', 'Ticket has been removed successfully');
  };

  const handleSaveTicket = (ticketData: any) => {
    if (!data?.event) return;

    if (editingTicketIndex !== null) {
      // Edit existing ticket
      const existingTicket = data.event.tickets[editingTicketIndex];
      const status = data.event.status;
      const soldCount = existingTicket.sold || 0;
      const reservedCount = 0; // TODO: Add reserved count from backend
      const totalCommitted = soldCount + reservedCount;
      
      // Only show confirmation for price reduction warnings (validation already done in modal)
      if ((status === 'published' || status === 'live') && totalCommitted > 0 && totalCommitted < 10) {
        if (ticketData.price < existingTicket.price.amount) {
          const confirmed = window.confirm(
            `⚠️ Price Reduction Warning\n\n` +
            `Lowering the price will trigger partial refunds to ${totalCommitted} early buyers.\n` +
            `Refund amount: BDT ${(existingTicket.price.amount - ticketData.price) * totalCommitted}\n\n` +
            `This will be deducted from your payout. Continue?`
          );
          if (!confirmed) return;
        }
      }
      
      const updatedTickets = data.event.tickets.map((t, i) => 
        i === editingTicketIndex 
          ? {
            ...t,
            name: ticketData.name,
            tier: ticketData.tier,
            price: { amount: ticketData.price, currency: 'BDT' },
            quantity: ticketData.quantity,
            wristbandColor: ticketData.wristbandColor,
            benefits: ticketData.benefits,
          }
          : t
      );

      onUpdate({
        ...data,
        event: {
          ...data.event,
          tickets: updatedTickets
        }
      });
      showNotification('success', 'Ticket Updated', 'Ticket has been updated successfully');
    } else {
      // Check capacity before adding new ticket
      const currentTotal = getTotalTicketsAllocated();
      const newTotal = currentTotal + ticketData.quantity;
      const capacity = data.event.venue?.capacity || 0;
      
      if (capacity > 0 && newTotal > capacity) {
        showNotification(
          'error', 
          'Capacity Exceeded', 
          `Cannot add ticket. Total tickets (${newTotal}) would exceed venue capacity (${capacity})`
        );
        return;
      }
      
      // Add new ticket (no _id for new tickets - backend will generate)
      const newTicket = {
        name: ticketData.name,
        tier: ticketData.tier,
        price: { amount: ticketData.price, currency: 'BDT' },
        quantity: ticketData.quantity,
        limits: {
          minPerOrder: 1,
          maxPerOrder: 5
        },
        sold: 0,
        reserved: 0,
        wristbandColor: ticketData.wristbandColor,
        accentColor: ticketData.wristbandColor || '#4f46e5',
        isDark: false,
        glassMode: false,
        cornerRadius: 32,
        perforationStyle: 'dotted' as const,
        benefits: ticketData.benefits || [],
        isVisible: true,
        isActive: true,
      };

      onUpdate({
        ...data,
        event: {
          ...data.event,
          tickets: [...data.event.tickets, newTicket]
        }
      });
      showNotification('success', 'Ticket Created', 'New ticket has been added successfully');
    }
    
    setIsTicketModalOpen(false);
    setEditingTicketIndex(null);
  };

  const getTotalTicketsAllocated = () => {
    return data?.event?.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0) || 0;
  };

  const getCapacityPercentage = () => {
    const capacity = data?.event?.venue?.capacity;
    if (!capacity) return 0;
    return Math.min((getTotalTicketsAllocated() / capacity) * 100, 100);
  };

  return (
    <section ref={ticketSectionRef} className="space-y-6">
      <div className="">
        <h2 className="text-lg font-[300] text-slate-900 tracking-tight">Event Tickets</h2>
        <p className="text-xs text-slate-500 font-[300]">Manage ticket tiers, pricing, and availability.</p>
      </div>
      {/* Capacity Overview */}
      <div className="p-0 pb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-4">
              <div className='h-7 sm:h-8 md:h-9 lg:h-10 w-[3px] bg-brand-400'></div>
              <p className="text-xl sm:text-2xl md:text-2xl lg:text-2xl font-[300] tracking-wider text-gray-800">
                {getTotalTicketsAllocated()} <span className="text-[10px] font-[500] text-gray-400 uppercase tracking-[0.1em]">out of</span> {data?.event?.venue?.capacity || '∞'}
              </p>
            </div>
            <p className="text-[10px] font-[300] text-gray-400 uppercase tracking-[0.2em] mt-2">
              Total Capacity
            </p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 ${
            getCapacityPercentage() > 100 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-brand-50 text-brand-600 border-brand-100'
          } rounded-full border`}>
            <div className={`w-2 h-2 rounded-full ${getCapacityPercentage() > 100 ? 'bg-red-500' : 'bg-brand-500'}`} />
            <span className="text-[10px] font-[400] uppercase tracking-widest">
              {Math.round(getCapacityPercentage())}%
            </span>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-tr-sm rounded-bl-sm overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              getCapacityPercentage() > 100 ? 'bg-red-500' : 'bg-brand-500'
            }`}
            style={{ width: `${getCapacityPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Created Tickets */}
      <section className='space-y-6'>
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl md:text-xl lg:text-xl font-[300] text-neutral-700 leading-[0.9] tracking-tight">
            Created Tickets ({data?.event?.tickets.length || 0})
          </h2>
          <button 
            onClick={handleAddTicket}
            title="Add New Ticket" 
            className="flex items-center gap-2 px-3 py-2 text-xs font-[500] text-brand-500 border border-brand-200 rounded-lg hover:bg-brand-50 transition-all"
          >
            <Plus size={14} />
            Add Ticket
          </button>
        </div>

        {data?.event?.tickets.length === 0 ? (
          <div className="p-12 border-2 border-dashed border-slate-200 rounded-xl text-center">
            <Ticket size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-sm text-slate-500 font-[300] mb-4">
              No tickets created yet
            </p>
            <button
              onClick={handleAddTicket}
              className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-all text-sm font-[500]"
            >
              Create Your First Ticket
            </button>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="max-w-full pb-6 overflow-x-auto">
                <div className="flex gap-4">
                  {data?.event?.tickets.map((ticket, index) => {
                    const ticketEventDate = new Date(data?.event?.schedule?.startDate || Date.now());
                    const ticketEndDate = new Date(data?.event?.schedule?.endDate || Date.now());
                    
                    return (
                      <div key={index} className="min-w-[300px] w-[300px]">
                        <TicketCard ticket={{
                          _id: ticket._id,
                          tier: ticket.tier,
                          name: ticket.name,
                          controls: true,
                          startDate: ticketEventDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                          endDate: ticketEndDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                          startTime: formatTime(data?.event?.schedule?.startDate || ''),
                          endTime: formatTime(data?.event?.schedule?.endDate || ''),
                          price: ticket.price.amount,
                          quantity: ticket.quantity,
                          benefits: ticket.benefits || [],
                          venue: `${data?.event?.venue?.name}, ${data?.event?.venue?.address?.city}`,
                          onClick: () => {},
                        }}
                        />
                        <div className="flex text-xs font-[400] text-slate-500 items-center gap-2 mt-2 justify-center">
                          <button 
                            onClick={() => handleEditTicket(index)}
                            className="border hover:scale-105 transition-transform duration-100 flex items-center gap-2 border-neutral-300 px-2 py-1 rounded-sm"
                          >
                            <Edit size={12} />
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteTicket(index)}
                            className="border hover:scale-105 transition-transform duration-100 flex items-center gap-2 border-red-300 text-red-500 px-2 py-1 rounded-sm"
                          >
                            <Trash size={12} />
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </section>

      {/* Ticket Configurator Modal */}
      <TicketConfiguratorModal
        isOpen={isTicketModalOpen}
        onClose={() => {
          setIsTicketModalOpen(false);
          setEditingTicketIndex(null);
        }}
        onSave={handleSaveTicket}
        eventData={{
          title: data?.event?.title || 'Your Event',
          venue: `${data?.event?.venue?.name}, ${data?.event?.venue?.address?.city || ''}`,
          startDate: new Date(data?.event?.schedule?.startDate || '').toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          endDate: new Date(data?.event?.schedule?.endDate || '').toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          startTime: data?.event?.schedule?.doors || '',
          endTime: data?.event?.schedule?.doors || '', // Assuming doors time as default if end time not separate in modal
        }}
        editingTicket={
          editingTicketIndex !== null && data?.event?.tickets[editingTicketIndex]
            ? {
                name: data.event.tickets[editingTicketIndex].name,
                tier: data.event.tickets[editingTicketIndex].tier,
                price: data.event.tickets[editingTicketIndex].price.amount,
                quantity: data.event.tickets[editingTicketIndex].quantity,
                wristbandColor: data.event.tickets[editingTicketIndex].wristbandColor || '#000000',
                benefits: data.event.tickets[editingTicketIndex].benefits || [],
              }
            : null
        }
        validationContext={
          editingTicketIndex !== null && data?.event?.tickets[editingTicketIndex]
            ? {
                eventStatus: data.event.status,
                existingTicket: {
                  price: data.event.tickets[editingTicketIndex].price.amount,
                  sold: data.event.tickets[editingTicketIndex].sold || 0,
                  reserved: 0, // TODO: Add reserved count from backend
                  benefits: data.event.tickets[editingTicketIndex].benefits || [],
                },
              }
            : undefined
        }
        />
      
      {/* Save Button */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex justify-between items-center mt-8">
        <div className="text-xs text-slate-600">
          {hasChanges ? (
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              Unsaved changes
            </span>
          ) : (
            <span className="flex items-center gap-2 text-emerald-600">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              All changes saved
            </span>
          )}
        </div>
        
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="px-6 py-2.5 bg-brand-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-600 transition-all flex items-center gap-2 font-[400] text-xs"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Changes
            </>
          )}
        </button>
      </div>
    </section>
  );
};
