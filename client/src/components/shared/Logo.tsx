import React from 'react';
import { motion, Variants } from 'framer-motion';

interface LogoProps {
  className?: string;
  strokeWidth?: string;
  variant?: 'icon' | 'full';
  animated?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-auto h-6", strokeWidth = "2", variant = "icon", animated = false }) => {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      }
    }
  };

  // Z: Crisp slide from left
  const itemZ: Variants = {
    hidden: { x: -10, opacity: 0 },
    show: { 
      x: 0, opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    }
  };

  // E: Fade and slight scale up (stamping effect)
  const itemE: Variants = {
    hidden: { scale: 0.9, opacity: 0 },
    show: { 
      scale: 1, opacity: 1,
      transition: { type: 'tween', ease: 'easeOut', duration: 0.3 }
    }
  };

  // N: Drop down lightly
  const itemN: Variants = {
    hidden: { y: -8, opacity: 0 },
    show: { 
      y: 0, opacity: 1,
      transition: { type: 'spring', stiffness: 400, damping: 25 }
    }
  };

  // V: Rise up lightly
  const itemV: Variants = {
    hidden: { y: 8, opacity: 0 },
    show: { 
      y: 0, opacity: 1,
      transition: { type: 'spring', stiffness: 400, damping: 25 }
    }
  };

  // Y: Crisp slide from right
  const itemY: Variants = {
    hidden: { x: 10, opacity: 0 },
    show: { 
      x: 0, opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    }
  };

  if (variant === "full") {
    if (animated) {
      return (
        <motion.svg 
          viewBox="0 0 94 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Z */}
          <motion.path variants={itemZ} d="M4 6H16L6 18H18" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          {/* E */}
          <motion.path variants={itemE} d="M36 6H24V18H36 M24 12H34" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          {/* N */}
          <motion.path variants={itemN} d="M42 18V6L54 18V6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          {/* V */}
          <motion.path variants={itemV} d="M60 6L66 18L72 6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          {/* Y */}
          <motion.path variants={itemY} d="M78 6L84 12L90 6 M84 12V18" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      );
    }

    return (
      <svg viewBox="0 0 94 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Z */}
        <path d="M4 6H16L6 18H18" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        {/* E */}
        <path d="M36 6H24V18H36 M24 12H34" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        {/* N */}
        <path d="M42 18V6L54 18V6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        {/* V */}
        <path d="M60 6L66 18L72 6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        {/* Y */}
        <path d="M78 6L84 12L90 6 M84 12V18" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M4 6H16L6 18H18" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};
