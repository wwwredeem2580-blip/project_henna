"use client";

import { motion } from "motion/react";
import { useStore } from "../context/StoreContext";
import { useRouter } from "next/navigation";
import { Design } from "../types";
import { Calendar } from "lucide-react";
import { useState } from "react";

export function DesignGallery() {
  const { designs, setSelectedDesign } = useStore();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(designs.map(d => d.category)))];

  const filteredDesigns = activeCategory === "All" 
    ? designs 
    : designs.filter(d => d.category === activeCategory);

  const handleBookNow = (e: React.MouseEvent, design: Design) => {
    e.stopPropagation();
    setSelectedDesign(design);
    router.push("/booking");
  };

  return (
    <section className="px-4 sm:px-6 lg:px-12 py-12 lg:py-24 min-h-screen w-full overflow-x-hidden">
      <div className="mb-12 lg:mb-20">
        <h2 className="text-4xl lg:text-5xl font-normal mb-4">Curated Designs</h2>
        <p className="text-ink-muted uppercase tracking-widest text-xs">Select a style for your pre-booking</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-4 mb-12">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-8 py-3 rounded-full border text-[10px] uppercase tracking-widest font-semibold transition-all duration-300 ${
              activeCategory === category 
                ? "bg-ink text-bg border-ink" 
                : "bg-transparent text-ink border-ink/10 hover:border-ink/30"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10">
        {filteredDesigns.map((design, index) => (
          <motion.div
            key={design.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group cursor-pointer flex flex-col"
          >
            <div className="relative aspect-[3/4] overflow-hidden mb-3 bg-ink/5">
              <img 
                src={design.images[0]} 
                alt={design.title} 
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col flex-1 space-y-1">
              <p className="text-[9px] uppercase tracking-widest text-ink-muted">{design.category}</p>
              <h3 className="text-sm font-medium line-clamp-2 leading-tight min-h-[2.5rem]">{design.title}</h3>
              <p className="text-base font-bold text-ink pt-1">
                Tk {design.price.toLocaleString()}
              </p>
              <div className="mt-auto pt-2">
                <button 
                  onClick={(e) => handleBookNow(e, design)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-cta text-white rounded-md text-[10px] uppercase tracking-wider font-semibold hover:bg-cta-hover transition-all duration-300"
                >
                  <Calendar size={12} />
                  <span>Book Now</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}