"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, X, ArrowDown } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { TourItem } from "../types";

export default function TakeATour() {
  const { availabilitySettings } = useStore();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const tourItems = [...(availabilitySettings.tourItems || [])]
    .sort((a, b) => a.order - b.order);

  return (
    <div className="bg-bg text-ink min-h-screen px-6 lg:px-24 py-24">
      {/* Header */}
      <header className="mb-24 space-y-4 max-w-4xl">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] uppercase tracking-[0.4em] text-ink-muted"
        >
          Curated Showcase
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl lg:text-8xl font-serif leading-tight"
        >
          A Visual Legacy
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-ink-muted font-light max-w-xl italic"
        >
          Explore a decade of artistry across grand weddings, vibrant festivals, and professional corporate fests.
        </motion.p>
      </header>

      {/* Grid Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tourItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: index * 0.05 }}
            className={`group relative overflow-hidden bg-ink/5 aspect-[3/4] ${
                index % 3 === 0 ? "lg:col-span-2 lg:aspect-video" : ""
            }`}
          >
            <img 
              src={item.image} 
              alt={item.title} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            
            {/* Dark Overlay with Details on Hover */}
            <div className="absolute inset-0 bg-ink/90 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center text-center p-8">
                <span className="text-[9px] uppercase tracking-[0.5em] text-bg/60 mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                    {item.category}
                </span>
                <h3 className="text-2xl lg:text-4xl font-serif text-bg mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-200">
                    {item.title}
                </h3>
                <div className="w-12 h-px bg-bg/20 my-4 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-300" />
                <p className="text-xs text-bg/70 italic font-light max-w-xs transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-400">
                    {item.subtitle}
                </p>
                
                {/* Visual Accent */}
                <div className="absolute top-8 left-8 right-8 bottom-8 border border-bg/10 transform scale-95 group-hover:scale-100 transition-transform duration-1000 delay-100 pointer-events-none" />
                
                <button 
                  onClick={() => setActiveVideo(item.id.toString())}
                  className="mt-8 bg-bg text-ink rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-300 hover:scale-110 transform translate-y-4 group-hover:translate-y-0"
                >
                  <Play size={16} fill="currentColor" />
                </button>
            </div>
          </motion.div>
        ))}
      </div>

      <footer className="mt-48 pt-12 border-t border-ink/5 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-ink/40 space-y-4 md:space-y-0">
        <p>© 2026 Ria’s Henna Artistry</p>
        <p>Legacy in Every Stroke</p>
        <p>Curated Portfolio Selection</p>
      </footer>

      {/* Video Modal Placeholder */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg/90 backdrop-blur-xl"
          >
            <button 
              onClick={() => setActiveVideo(null)}
              className="absolute top-8 right-8 text-ink hover:rotate-90 transition-transform duration-300"
            >
              <X size={32} />
            </button>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-5xl aspect-video bg-ink/5 rounded-2xl overflow-hidden relative group"
            >
              <img 
                src={tourItems.find(s => s.id.toString() === activeVideo)?.image} 
                alt="Video Placeholder"
                className="w-full h-full object-cover opacity-40 blur-sm"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 space-y-6">
                <div className="bg-ink text-bg rounded-full p-8 animate-pulse shadow-2xl text-ink">
                  <Play size={48} fill="currentColor" className="ml-2" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-serif">Cinematic Experience Coming Soon</h3>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-ink-muted">Relive the memories</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
