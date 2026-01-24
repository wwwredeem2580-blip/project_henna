import React from 'react';

interface LogoProps {
  className?: string;
  strokeWidth?: string;
  variant?: 'icon' | 'full';
}

export const Logo: React.FC<LogoProps> = ({ className = "w-auto h-6", strokeWidth = "2", variant = "icon" }) => {
  if (variant === "full") {
    return (
      <svg viewBox="0 0 94 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Z */}
        <path d="M4 6H16L6 18H18" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        {/* E */}
        <path d="M36 6H24V18H36 M24 12H34" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        {/* N */}
        <path d="M42 18V6L54 18V6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        {/* N */}
        <path d="M60 18V6L72 18V6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
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
