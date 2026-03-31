"use client";

import { AnimatePresence, motion } from "motion/react";
import { Sidebar } from "./Sidebar";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

import { FrozenRoute } from "./FrozenRoute";

export function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-bg selection:bg-ink selection:text-bg">
      <div className="max-w-[1440px] mx-auto min-h-screen flex relative">
        <Sidebar />
        
        <main className="flex-1 min-h-screen relative overflow-hidden pt-16 lg:pt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ 
                duration: 0.3, 
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ width: "100%" }}
            >
              <FrozenRoute>
                {children}
              </FrozenRoute>
            </motion.div>
          </AnimatePresence>

          {/* Decorative background elements */}
          <div className="fixed top-0 right-0 w-1/3 h-screen pointer-events-none opacity-[0.02] z-0">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
        </main>
      </div>
    </div>
  );
}
