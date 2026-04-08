"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Story, TourItem } from "../types";
import { StoryViewer } from "./StoryViewer";
import { useStore } from "../context/StoreContext";

export function Stories() {
  const { availabilitySettings } = useStore();
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

  const stories: Story[] = (availabilitySettings.tourItems || [])
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      id: item.id,
      title: item.title,
      thumbnail: item.image,
      type: "image" as const,
      contentUrl: item.image,
      link: item.link || "/tour",
      linkText: item.linkText || "Take a Tour"
    }));

  return (
    <div className="mb-12">
      <div className="flex items-end space-x-4 overflow-x-auto no-scrollbar pb-4 -mx-2 px-2">
        {/* First story: Featured large card */}
        {stories.length > 0 && (
          <motion.div
            key={stories[0].id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0 }}
            onClick={() => setActiveStoryIndex(0)}
            className="flex-shrink-0 cursor-pointer group w-[80vw] sm:w-[60vw] lg:w-[35vw]"
          >
            <div className="relative w-full aspect-[16/9] lg:aspect-[18/9] overflow-hidden border border-ink/10 shadow-lg group-hover:scale-[1.01] transition-transform duration-300">
              <img 
                src={stories[0].thumbnail} 
                alt={stories[0].title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                <p className="text-white text-sm sm:text-base lg:text-lg font-semibold truncate">{stories[0].title}</p>
                <p className="text-white/70 text-[10px] sm:text-xs uppercase tracking-wider mt-1">Tap to view</p>
              </div>
              <div className="absolute top-3 left-3 w-2.5 h-2.5 bg-cta rounded-full animate-pulse" />
            </div>
          </motion.div>
        )}

        {/* Other stories: circular */}
        {stories.slice(1).map((story, index) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (index + 1) * 0.1 }}
            onClick={() => setActiveStoryIndex(index + 1)}
            className="flex-shrink-0 cursor-pointer group"
          >
            <div className="relative w-[74px] h-[74px] p-[3px] rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
              <div className="bg-bg w-full h-full p-1 rounded-full flex items-center justify-center">
                <div className="w-[64px] h-[64px] rounded-full overflow-hidden border border-ink/5">
                  <img 
                    src={story.thumbnail} 
                    alt={story.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {activeStoryIndex !== null && (
          <StoryViewer 
            stories={stories} 
            initialIndex={activeStoryIndex} 
            onClose={() => setActiveStoryIndex(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}