"use client";

import { useStore } from "../context/StoreContext";

export function HeroBanner() {
  const { availabilitySettings } = useStore();
  
  const tourItems = availabilitySettings.tourItems || [];
  const firstStory = tourItems.sort((a, b) => a.order - b.order)[0];

  if (!firstStory) return null;

  return (
    <section className="relative w-full aspect-[21/9] max-w-[780px] mt-4 lg:mt-16 mx-auto overflow-hidden bg-ink/5">
      <div className="absolute inset-0">
        <img 
          src={firstStory.image} 
          alt={firstStory.title} 
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  );
}
