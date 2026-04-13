"use client";

import { motion } from "motion/react";
import { useStore } from "../context/StoreContext";
import { useRouter } from "next/navigation";
import { Design } from "../types";
import { Calendar } from "lucide-react";
import { useState } from "react";

// Category images mapping for designs
const categoryImages: Record<string, string[]> = {
  "All": [
    "/images/mehendi_design_001.png",
    "/images/mehendi_design_002.png",
    "/images/mehendi_design_003.png",
  ],
  "Traditional": ["/images/mehendi_design_001.png"],
  "Contemporary": ["/images/mehendi_design_002.png"],
  "Fusion": ["/images/mehendi_design_003.png"],
};

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

  // Get images for each category
  const getCategoryImages = (category: string): string[] => {
    if (categoryImages[category]) return categoryImages[category];
    // Fallback: find a design from this category to use its image
    const designInCategory = designs.find(d => d.category === category);
    return designInCategory?.images ? [designInCategory.images[0]] : ["/images/mehendi_design_001.png"];
  };

  return (
    <section className="px-4 sm:px-6 lg:px-12 py-12 lg:py-24 min-h-screen w-full overflow-x-hidden">
      <div className="mb-12 lg:mb-20">
        <h2 className="text-4xl lg:text-5xl font-normal mb-4">Curated Designs</h2>
        <p className="text-ink-muted uppercase tracking-widest text-xs">Select a style for your pre-booking</p>
      </div>

      {/* Advanced Category Filter with Images */}
      <div className="flex flex-wrap gap-4 mb-12">
        {categories.map(category => {
          const images = getCategoryImages(category);
          const hasMultipleImages = images.length > 1;
          
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-300 min-w-[80px] ${
                activeCategory === category 
                  ? "bg-ink text-bg border-ink" 
                  : "bg-transparent text-ink border-ink/10 hover:border-ink/30"
              }`}
            >
              <div className="relative w-14 h-14 flex-shrink-0">
                {hasMultipleImages ? (
                  // Stacked images effect for "All" or categories with multiple images
                  <>
                    {images.slice(0, 3).map((img, idx) => (
                      <div
                        key={idx}
                        className="absolute w-10 h-10 rounded-md overflow-hidden border border-ink/10 shadow-sm bg-bg"
                        style={{
                          left: `${idx * 6}px`,
                          top: `${idx * 4}px`,
                          zIndex: idx,
                          transform: `rotate(${(idx - 1) * 6}deg)`,
                        }}
                      >
                        <img 
                          src={img} 
                          alt={`${category} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </>
                ) : (
                  // Single image
                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-ink/10 shadow-sm">
                    <img 
                      src={images[0]} 
                      alt={category}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <span className="text-[9px] md:text-[10px] uppercase tracking-wider font-semibold text-center leading-tight">
                {category}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10">
        {filteredDesigns.map((design, index) => (
          <motion.div
            key={design.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group cursor-pointer flex flex-col h-full"
          >
            <div className="relative aspect-[3/4] overflow-hidden mb-3 bg-ink/5 flex-shrink-0">
              <img 
                src={design.images[0]} 
                alt={design.title} 
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col flex-1 space-y-1">
              <p className="text-[9px] uppercase tracking-widest text-ink-muted">{design.category}</p>
              <h3 className="text-[15px] sm:text-[16px] font-medium line-clamp-2 leading-tight min-h-[2.5rem] tracking-tight">{design.title}</h3>
              <p className="text-base font-bold text-ink pt-1">
                Tk {design.price.toLocaleString()}
              </p>
              <div className="mt-auto pt-4">
                <button 
                  onClick={(e) => handleBookNow(e, design)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-cta text-white rounded-md text-[9px] md:text-[10px] uppercase tracking-wider font-semibold hover:bg-cta-hover transition-all duration-300 shadow-sm"
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