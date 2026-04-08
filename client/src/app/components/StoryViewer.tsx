"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import { Story } from "../types";
import { useRouter } from "next/navigation";

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

export function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const DURATION = 5000; // 5 seconds per story

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + (100 / (DURATION / 50));
      });
    }, 50);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  const currentStory = stories[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-bg/95 backdrop-blur-2xl"
    >
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 text-ink hover:rotate-90 transition-transform duration-300 z-[110]"
      >
        <X size={32} />
      </button>

      <div className="relative w-full max-w-[450px] aspect-[9/16] bg-ink rounded-2xl overflow-hidden shadow-2xl">
        {/* Progress Bars */}
        <div className="absolute top-4 left-4 right-4 z-[110] flex space-x-1">
          {stories.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{ 
                  width: index === currentIndex ? `${progress}%` : index < currentIndex ? "100%" : "0%" 
                }}
                transition={{ ease: "linear", duration: 0.05 }}
              />
            </div>
          ))}
        </div>

        {/* Story Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full h-full relative group"
          >
            <img 
              src={currentStory.contentUrl} 
              alt={currentStory.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
            
            {/* Header info */}
            <div className="absolute top-10 left-6 flex items-center space-x-3 text-white">
              <div className="w-8 h-8 rounded-full border border-white/50 overflow-hidden">
                <img src={currentStory.thumbnail} className="w-full h-full object-cover" />
              </div>
              <span className="font-semibold text-sm drop-shadow-md">{currentStory.title}</span>
            </div>

            {/* Video Placeholder Indicator */}
            {currentStory.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle size={64} className="text-white/50" />
                </div>
            )}

            {/* Content Bottom */}
            <div className="absolute bottom-12 left-0 right-0 p-8 text-center space-y-6">
              <h3 className="text-3xl font-semibold text-white">{currentStory.title}</h3>
              {currentStory.link && (
                <button 
                  onClick={() => {
                    onClose();
                    router.push(currentStory.link!);
                  }}
                  className="bg-white text-ink px-8 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold hover:scale-105 transition-transform"
                >
                  {currentStory.linkText || "Learn More"}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Overlays */}
        <div className="absolute inset-y-0 left-0 w-1/4 z-[105]" onClick={handlePrev} />
        <div className="absolute inset-y-0 right-0 w-1/4 z-[105]" onClick={handleNext} />
        
        {/* Desktop Nav Arrows */}
        <div className="hidden lg:block">
            <button 
                onClick={handlePrev}
                className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[110] ${currentIndex === 0 ? "opacity-0 pointer-events-none" : ""}`}
            >
                <ChevronLeft size={24} />
            </button>
            <button 
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[110]"
            >
                <ChevronRight size={24} />
            </button>
        </div>
      </div>
    </motion.div>
  );
}
