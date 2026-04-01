"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Story } from "../types";
import { StoryViewer } from "./StoryViewer";

const SAMPLE_STORIES: Story[] = [
  {
    id: "1",
    title: "Our Legacy",
    thumbnail: "/tour/legacy.png",
    type: "image",
    contentUrl: "/tour/legacy.png",
    link: "/tour",
    linkText: "Take a Tour"
  },
  {
    id: "2",
    title: "Grand Weddings",
    thumbnail: "/tour/wedding.png",
    type: "image",
    contentUrl: "/tour/wedding.png",
    link: "/booking",
    linkText: "Book Now"
  },
  {
    id: "3",
    title: "Festivals",
    thumbnail: "/tour/fest.png",
    type: "image",
    contentUrl: "/tour/fest.png",
    link: "/designs",
    linkText: "View Designs"
  },
  {
    id: "4",
    title: "Corporate",
    thumbnail: "/tour/corporate.png",
    type: "image",
    contentUrl: "/tour/corporate.png",
    link: "/contact",
    linkText: "Inquire Now"
  }
];

export function Stories() {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

  return (
    <div className="mb-12">
      <div className="flex space-x-6 overflow-x-auto no-scrollbar pb-4 -mx-2 px-2">
        {SAMPLE_STORIES.map((story, index) => (
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
            stories={SAMPLE_STORIES} 
            initialIndex={activeStoryIndex} 
            onClose={() => setActiveStoryIndex(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
