"use client";

import { motion } from "motion/react";

const TOUR_ALBUM = [
  { id: 1, title: "Grand Bridal Mehendi", category: "Weddings", image: "https://images.unsplash.com/photo-1590593162211-996843477430?q=80&w=800&auto=format&fit=crop" },
  { id: 2, title: "Festival Celebration", category: "Events", image: "https://images.unsplash.com/photo-1516053894464-9f4460d3767c?q=80&w=800&auto=format&fit=crop" },
  { id: 3, title: "Contemporary Patterns", category: "Private Sessions", image: "https://images.unsplash.com/photo-1505933334113-567ad0030763?q=80&w=800&auto=format&fit=crop" },
  { id: 4, title: "Arabic Fusion Design", category: "Weddings", image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800&auto=format&fit=crop" },
  { id: 5, title: "Intricate Palm Detail", category: "Bride", image: "https://images.unsplash.com/photo-1542385151-efd9000782a7?q=80&w=800&auto=format&fit=crop" },
  { id: 6, title: "Minimalist Charm", category: "Daily", image: "https://images.unsplash.com/photo-1537151672256-6cab2e7f22ca?q=80&w=800&auto=format&fit=crop" },
];

export default function TakeATour() {
  return (
    <section className="px-6 lg:px-12 py-12 lg:py-24 min-h-screen">
      <div className="mb-16 lg:mb-24">
        <h2 className="text-4xl lg:text-6xl font-serif mb-6">Our Portfolio</h2>
        <p className="text-ink-muted uppercase tracking-widest text-xs">A visual journey through our past events and services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {TOUR_ALBUM.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group relative"
          >
            <div className="aspect-[4/5] overflow-hidden bg-ink/5">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                <p className="text-[10px] uppercase tracking-widest text-bg/70 mb-2">{item.category}</p>
                <h3 className="text-2xl font-serif text-bg">{item.title}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-24 border-t border-ink/5 pt-12 flex flex-col items-center text-center">
        <p className="text-xl font-serif mb-6 italic">"Artistry that leaves a lasting impression."</p>
        <div className="w-12 h-px bg-ink/20" />
      </div>
    </section>
  );
}
