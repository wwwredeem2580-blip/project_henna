import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Minus, Plus, QrCode, Rotate3D } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BDTIcon, LocationIcon } from './Icons';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface TicketCardProps {
  ticket: {
    tier: string;
    name: string;
    price: number;
    quantity: number;
    venue: string;
    _id: string;
    onClick: () => void;
  };
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  return (
    <motion.div
      key={ticket._id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="px-6 py-4 flex items-center justify-between max-w-[350px] rounded-tr-lg rounded-bl-lg w-full bg-slate-50 border border-slate-100 relative group overflow-hidden"
    >
      <div>
        <div className="flex gap-6 items-center justify-between">
        <div>
          <div className="text-md font-[400] tracking-wide text-neutral-700">
            {ticket.tier}
          </div>
          <div className="flex items-center gap-3 text-neutral-400 mb-4 font-[500] text-[10px] uppercase tracking-widest">
            {ticket.name}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 border border-brand-divider rounded-sm text-[9px] font-[400] text-brand-500 hover:bg-white hover:border-brand-500 hover:text-brand-500 transition-all">
            <Minus size={12}/>
          </button>
          <span className="text-xs font-[400] text-neutral-500">0</span>
          <button className="px-2 py-1 border border-brand-divider rounded-sm text-[9px] font-[400] text-brand-500 hover:bg-white hover:border-brand-500 hover:text-brand-500 transition-all">
            <Plus size={12}/>
          </button>
        </div>
      </div>
      {/* Price */}
      <div className="flex flex-col items-start gap-0 mt-2">
        <span className="text-xs text-slate-500 font-[300]">
          Only {ticket.quantity} tickets left
        </span>
        <span className="flex items-center text-md gap-1 text-slate-500 font-[300] mt-4">
          <span className="text-xs">For </span>
          <BDTIcon className="text-xs"/>{ticket.price}
        </span>
        <span className="flex items-center text-end gap-1 text-md text-xs text-slate-500 font-[300]">
          <LocationIcon className="w-3"/> {ticket.venue}
        </span>
      </div>
      
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
      <div className="absolute top-0 right-0 w-16 h-16 -mr-6 mt-4 rounded-full transition-transform group-hover:scale-110" >
        <Rotate3D size={16} className="text-brand-400"/>
      </div>
      </div>
      <div>
        <QrCode size={36} className="text-brand-400"/>
      </div>
    </motion.div>
  );
};
