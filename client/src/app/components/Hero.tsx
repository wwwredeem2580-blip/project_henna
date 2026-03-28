"use client";

import { motion } from "motion/react";

export function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center px-12 py-24">
      <div className="max-w-4xl space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p className="text-xs uppercase tracking-[0.4em] text-ink-muted mb-6">The Art of Celebration</p>
          <h2 className="text-7xl md:text-9xl font-serif leading-[0.9] tracking-tighter">
            Elegance <br />
            <span className="italic ml-12 md:ml-24">Redefined.</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end"
        >
          <p className="text-lg text-ink-muted leading-relaxed font-light">
            Ria’s Henna Artistry brings professional mehendi artistry to your most cherished moments. 
            We specialize in intricate, bespoke designs that tell your unique story through 
            the ancient art of henna.
          </p>
          
          <div className="relative aspect-[3/4] overflow-hidden rounded-sm group">
            <img 
              src="https://picsum.photos/seed/mehendi-hero/800/1200" 
              alt="Mehendi Art" 
              className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-ink/5 group-hover:bg-transparent transition-colors duration-500" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
