
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Minus, Plus, QrCode, Rotate3D, Sparkles } from 'lucide-react';
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
    benefits: string[];
    onClick: () => void;
  };
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleControlClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="relative w-full max-w-[350px] h-[180px] group cursor-pointer" onClick={handleFlip} style={{ perspective: '1000px' }}>
      <motion.div
        className="w-full h-full relative"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Face */}
        <div
          className="absolute w-full h-full rounded-tr-lg rounded-bl-lg bg-slate-50 overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="px-6 py-4 h-full flex flex-col justify-between relative">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-md font-[400] tracking-wide text-neutral-700">
                  {ticket.tier}
                </div>
                <div className="text-neutral-400 font-[500] text-[10px] uppercase tracking-widest">
                  {ticket.name}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start">
              <span className="text-xs text-slate-500 font-[300]">
                Only {ticket.quantity} tickets left
              </span>
              <span className="flex items-center text-md gap-1 mt-2 text-slate-500 font-[300]">
                <span className="text-xs">For </span>
                <BDTIcon className="text-xs"/>{ticket.price}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500 font-[300]">
                <LocationIcon className="w-3"/> {ticket.venue}
              </span>
            </div>
            <div className="absolute bottom-10 right-6 flex items-center gap-2" onClick={handleControlClick}>
              <button className="px-2 py-1 border border-brand-divider rounded-sm text-[9px] font-[400] text-brand-500 hover:bg-white hover:border-brand-500 hover:text-brand-500 transition-all z-10">
                <Minus size={12}/>
              </button>
              <span className="text-xs font-[400] text-neutral-500">0</span>
              <button className="px-2 py-1 border border-brand-divider rounded-sm text-[9px] font-[400] text-brand-500 hover:bg-white hover:border-brand-500 hover:text-brand-500 transition-all z-10">
                <Plus size={12}/>
              </button>
            </div>

            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110 pointer-events-none" />
            <div className="absolute top-4 right-4 text-brand-400 opacity-50">
               <Rotate3D size={16} />
            </div>
            
            <div className="absolute bottom-18 right-6 text-brand-400/20">
              <QrCode size={36} />
            </div>
          </div>
        </div>

        {/* Back Face */}
        <div
          className="absolute w-full h-full bg-slate-50 rounded-tr-lg rounded-bl-lg text-neutral-600 overflow-hidden relative"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="px-6 py-4 h-full flex flex-col gap-6 relative">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-md font-[400] flex items-center gap-2 tracking-wide text-neutral-700">
                  <Sparkles size={16} className='text-brand-500' strokeWidth={1}/>
                  Benefits
                </div>
                <div className="text-neutral-400 font-[500] text-[10px] uppercase tracking-widest">
                  {ticket.name}
                </div>
              </div>
            </div>

            <div className="flex text-[12px] flex-col items-start">
              {ticket.benefits.length > 0 ? (
                ticket.benefits.map((benefit, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <CheckCircle size={12} className='text-brand-500' strokeWidth={1}/>
                    <span className='line-clamp-1'>{benefit}</span>
                  </div>
                )).slice(0, 3)
              ) : (
                <span className='text-xs text-slate-500 font-[300]'>No benefits</span>
              )}
              {ticket.benefits.length > 3 && (
                <button className='text-xs text-brand-500 font-[300] mt-2 hover:underline'>
                  See more...
                </button>
              )}
            </div>

            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110 pointer-events-none" />
            <div className="absolute top-4 right-4 text-brand-400 opacity-50">
               <Rotate3D size={16} />
            </div>
            
            <div className="absolute bottom-18 right-6 text-brand-400/20">
              <QrCode size={36} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
