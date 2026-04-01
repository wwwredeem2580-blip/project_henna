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
      <div className="flex space-x-6 overflow-x-auto no-scrollbar pb-4 -mx-2 px-2">
        {stories.map((story, index) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setActiveStoryIndex(index)}
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
            <p className="text-[10px] text-center mt-2 font-medium tracking-tight text-ink/70 group-hover:text-ink transition-colors uppercase">
              {story.title}
            </p>
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
