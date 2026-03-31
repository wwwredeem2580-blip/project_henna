"use client";

import { motion } from "motion/react";
import { useStore } from "../context/StoreContext";
import { useRouter } from "next/navigation";
import { Design } from "../types";

export function DesignGallery() {
  const { designs, setSelectedDesign } = useStore();
  const router = useRouter();

  const handleSelect = (design: Design) => {
    setSelectedDesign(design);
    router.push("/booking");
  };

  return (
    <section className="px-6 lg:px-12 py-12 lg:py-24 min-h-screen">
      <div className="mb-12 lg:mb-20">
        <h2 className="text-4xl lg:text-5xl font-serif mb-4">Curated Designs</h2>
        <p className="text-ink-muted uppercase tracking-widest text-xs">Select a style for your pre-booking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 lg:gap-y-16">
        {designs.map((design, index) => (
          <motion.div
            key={design.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group cursor-pointer"
            onClick={() => handleSelect(design)}
          >
            <div className="relative aspect-[4/5] overflow-hidden mb-6 bg-ink/5">
              <img 
                src={design.images[0]} 
                alt={design.title} 
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-500 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 text-white text-[10px] uppercase tracking-[0.3em] font-semibold transition-opacity duration-500">
                  Select Design
                </span>
              </div>
            </div>
            <div className="flex justify-between items-baseline mb-1">
              <h3 className="text-xl font-serif">{design.title}</h3>
              <span className="text-sm font-medium">Tk {design.price}</span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-ink-muted">{design.category}</span>
            <p className="text-sm text-ink-muted mt-3 font-light line-clamp-2">{design.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
