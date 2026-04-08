"use client";

import { motion } from "motion/react";

export default function AboutUs() {
  return (
    <section className="px-6 lg:px-12 py-12 lg:py-24 min-h-screen">
      <div className="max-w-3xl">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl lg:text-6xl font-semibold mb-8"
        >
          Our Story
        </motion.h2>
        
        <div className="space-y-6 text-lg text-ink-muted leading-relaxed">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Ria's Henna Artistry began as a passion for the ancient art of mehendi. With every stroke, we aim to tell a story, blending traditional patterns with contemporary elegance.
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Our journey is one of dedication to craftsmanship and the joy of being part of your most cherished celebrations. We believe that henna is more than just a stain; it's a blessing and a form of self-expression.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="pt-12"
          >
            <div className="aspect-video bg-ink/5 overflow-hidden">
               <img 
                 src="https://images.unsplash.com/photo-1590593162211-996843477430?q=80&w=1200&auto=format&fit=crop" 
                 alt="Henna Artistry" 
                 className="w-full h-full object-cover opacity-80"
               />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
