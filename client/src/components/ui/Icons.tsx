import React from 'react';

export const TicketIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path
      d="M2 8.2C2 7.0799 2 6.51984 2.21799 6.09202C2.40973 5.71569 2.71569 5.40973 3.09202 5.21799C3.51984 5 4.0799 5 5.2 5H18.8C19.9201 5 20.4802 5 20.908 5.21799C21.2843 5.40973 21.5903 5.71569 21.782 6.09202C22 6.51984 22 7.0799 22 8.2V9.00001C20.8954 9.00001 20 9.89544 20 11V13C20 14.1046 20.8954 15 22 15V15.8C22 16.9201 22 17.4802 21.782 17.908C21.5903 18.2843 21.2843 18.5903 20.908 18.782C20.4802 19 19.9201 19 18.8 19H5.2C4.0799 19 3.51984 19 3.09202 18.782C2.71569 18.5903 2.40973 18.2843 2.21799 17.908C2 17.4802 2 16.9201 2 15.8V15C3.10457 15 4 14.1046 4 13V11C4 9.89544 3.10457 9.00001 2 9.00001V8.2Z"
    />
    <path d="M14 5V19" strokeDasharray="3 3" />
  </svg>
);


export const ShareIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

export const CalendarIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export const BackIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

export const ChevronRightIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const LocationIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const PlusIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const MinusIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const MessageIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export const QRIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <line x1="7" y1="7" x2="7" y2="7.01" />
    <line x1="17" y1="7" x2="17" y2="7.01" />
    <line x1="17" y1="17" x2="17" y2="17.01" />
    <line x1="7" y1="17" x2="7" y2="17.01" />
  </svg>
);

export const CreditCardIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

export const QrCode: React.FC<{ className?: string, size?: number }> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
    <rect x="3" y="3" width="5" height="5" />
    <rect x="16" y="3" width="5" height="5" />
    <rect x="3" y="16" width="5" height="5" />
    <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
    <path d="M21 21v.01" />
    <path d="M12 7v3a2 2 0 0 1-2 2H7" />
    <path d="M3 12h.01" />
    <path d="M12 3h.01" />
    <path d="M12 16v.01" />
    <path d="M16 12h1" />
    <path d="M21 12v.01" />
    <path d="M12 21v-1" />
  </svg>
);

export const Minus: React.FC<{ className?: string, size?: number, strokeWidth?: number }> = ({ className = "w-6 h-6", size = 12, strokeWidth = 3 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const Plus: React.FC<{ className?: string, size?: number, strokeWidth?: number }> = ({ className = "w-6 h-6", size = 12, strokeWidth = 3 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const BDTIcon: React.FC<{ className?: string }> = ({ className }) => (
  <span style={{ fontFamily: 'Toroka, serif' }} className={className}>৳</span>
);

export const StarIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8.5 2L11 7h4l-3 3 1 4-4.5-3L4 14l1-4-3-3h4l2.5-5z" />
  </svg>
);

export const LightningIcon = ({fill}: {fill?: string}) => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.0373 1.21866C10.0501 1.18197 10.0492 1.14193 10.0349 1.10584C10.0206 1.06974 9.99376 1.03999 9.95935 1.022C9.92432 1.00275 9.88388 0.995713 9.84441 1.00199C9.80494 1.00827 9.76868 1.0275 9.74135 1.05666L3.41801 7.99266C3.32868 8.09066 3.30801 8.22866 3.36468 8.34666C3.42135 8.46466 3.54468 8.54 3.68068 8.54H7.81068L5.41868 14.7793C5.4049 14.8159 5.40495 14.8563 5.41882 14.8929C5.43269 14.9295 5.45943 14.9597 5.49401 14.978C5.52912 14.9977 5.56979 15.005 5.60955 14.9988C5.6493 14.9927 5.68585 14.9734 5.71335 14.944L12.7933 7.206C12.8827 7.108 12.904 6.97 12.8473 6.852C12.7907 6.734 12.6673 6.65866 12.5313 6.65866H8.08468L10.0373 1.22V1.21866Z"
      fill={fill || "#F19900"}
    />
  </svg>
);

export const PriceTicketIcon = () => (
  <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 13 12" fill="none">
    <path
      d="M5.434 3.50398C5.434 3.38398 5.392 3.28198 5.308 3.19798C5.224 3.11398 5.124 3.07198 5.008 3.07198C4.892 3.07198 4.792 3.11398 4.708 3.19798C4.624 3.28198 4.582 3.38398 4.582 3.50398V3.99598C4.582 4.11598 4.624 4.21798 4.708 4.30198C4.792 4.38598 4.892 4.42798 5.008 4.42798C5.124 4.42798 5.224 4.38598 5.308 4.30198C5.392 4.21798 5.434 4.11598 5.434 3.99598V3.50398ZM5.434 5.74798C5.434 5.63598 5.392 5.53798 5.308 5.45398C5.224 5.36998 5.124 5.32798 5.008 5.32798C4.892 5.32798 4.792 5.36998 4.708 5.45398C4.624 5.53798 4.582 5.63598 4.582 5.74798V6.25198C4.582 6.36398 4.624 6.46198 4.708 6.54598C4.792 6.62998 4.892 6.67198 5.008 6.67198C5.124 6.67198 5.224 6.62998 5.308 6.54598C5.392 6.46198 5.434 6.36398 5.434 6.25198V5.74798ZM5.434 8.00398C5.434 7.88398 5.392 7.78198 5.308 7.69798C5.224 7.61398 5.124 7.57198 5.008 7.57198C4.892 7.57198 4.792 7.61398 4.708 7.69798C4.624 7.78198 4.582 7.88398 4.582 8.00398V8.49598C4.582 8.61598 4.624 8.71798 4.708 8.80198C4.792 8.88598 4.892 8.92798 5.008 8.92798C5.124 8.92798 5.224 8.88598 5.308 8.80198C5.392 8.71798 5.434 8.61598 5.434 8.49598V8.00398ZM10.102 1.58398C9.982 1.57598 9.758 1.57198 9.43 1.57198H2.59C2.262 1.57198 2.038 1.57598 1.918 1.58398C1.686 1.61598 1.502 1.66398 1.366 1.72798C1.086 1.87198 0.877999 2.07998 0.741999 2.35198C0.661999 2.50398 0.613999 2.68798 0.597999 2.90398C0.589999 3.03198 0.585999 3.25998 0.585999 3.58798V4.24798C0.585999 4.36798 0.627999 4.46998 0.711999 4.55398C0.795999 4.63798 0.893999 4.67998 1.006 4.67998C1.246 4.67998 1.468 4.73998 1.672 4.85998C1.876 4.97998 2.038 5.13998 2.158 5.33998C2.278 5.53998 2.338 5.75998 2.338 5.99998C2.338 6.23998 2.278 6.45998 2.158 6.65998C2.038 6.85998 1.876 7.01998 1.672 7.13998C1.468 7.25998 1.246 7.31998 1.006 7.31998C0.893999 7.31998 0.795999 7.36198 0.711999 7.44598C0.627999 7.52998 0.585999 7.63198 0.585999 7.75198V8.41198C0.585999 8.73998 0.589999 8.96798 0.597999 9.09598C0.613999 9.31198 0.661999 9.49598 0.741999 9.64798C0.877999 9.91998 1.086 10.128 1.366 10.272C1.502 10.336 1.686 10.384 1.918 10.416C2.038 10.424 2.262 10.428 2.59 10.428H9.43C9.758 10.428 9.982 10.424 10.102 10.416C10.326 10.392 10.51 10.344 10.654 10.272C10.934 10.128 11.142 9.91998 11.278 9.64798C11.318 9.56798 11.35 9.47598 11.374 9.37198C11.39 9.30798 11.404 9.21398 11.416 9.08998C11.428 8.96598 11.434 8.73998 11.434 8.41198V7.75198C11.434 7.63198 11.392 7.52998 11.308 7.44598C11.224 7.36198 11.126 7.31998 11.014 7.31998C10.774 7.31998 10.552 7.25998 10.348 7.13998C10.144 7.01998 9.982 6.85998 9.862 6.65998C9.742 6.45998 9.682 6.23998 9.682 5.99998C9.682 5.75998 9.742 5.53998 9.862 5.33998C9.982 5.13998 10.144 4.97998 10.348 4.85998C10.552 4.73998 10.774 4.67998 11.014 4.67998C11.126 4.67998 11.224 4.63798 11.308 4.55398C11.392 4.46998 11.434 4.36798 11.434 4.24798V3.58798C11.434 3.25998 11.428 3.03398 11.416 2.90998C11.404 2.78598 11.39 2.69198 11.374 2.62798C11.35 2.52398 11.318 2.43198 11.278 2.35198C11.142 2.07998 10.934 1.87198 10.654 1.72798C10.51 1.65598 10.326 1.60798 10.102 1.58398ZM1.75 2.48398C1.75 2.48398 1.754 2.48398 1.762 2.48398C1.826 2.45998 1.904 2.44398 1.996 2.43598C2.088 2.42798 2.294 2.42398 2.614 2.42398H9.406C9.726 2.42398 9.932 2.42798 10.024 2.43598C10.116 2.44398 10.194 2.45998 10.258 2.48398H10.27C10.382 2.53998 10.466 2.62398 10.522 2.73598C10.546 2.76798 10.562 2.84798 10.57 2.97598C10.578 3.07198 10.582 3.27998 10.582 3.59998V3.86398C10.254 3.92798 9.956 4.06398 9.688 4.27198C9.42 4.47998 9.21 4.73398 9.058 5.03398C8.906 5.33398 8.83 5.65598 8.83 5.99998C8.83 6.34398 8.906 6.66598 9.058 6.96598C9.21 7.26598 9.42 7.51998 9.688 7.72798C9.956 7.93598 10.254 8.07198 10.582 8.13598V8.39998C10.582 8.71998 10.578 8.92798 10.57 9.02398C10.562 9.15198 10.546 9.23198 10.522 9.26398C10.466 9.36798 10.382 9.45198 10.27 9.51598H10.258C10.194 9.53998 10.116 9.55598 10.024 9.56398C9.932 9.57198 9.726 9.57598 9.406 9.57598H2.614C2.294 9.57598 2.088 9.57198 1.996 9.56398C1.904 9.55598 1.826 9.53998 1.762 9.51598H1.75C1.646 9.45198 1.562 9.36798 1.498 9.26398C1.474 9.23198 1.458 9.15198 1.45 9.02398C1.442 8.92798 1.438 8.71998 1.438 8.39998V8.13598C1.766 8.07198 2.064 7.93598 2.332 7.72798C2.6 7.51998 2.81 7.26598 2.962 6.96598C3.114 6.66598 3.19 6.34398 3.19 5.99998C3.19 5.65598 3.114 5.33398 2.962 5.03398C2.81 4.73398 2.6 4.47998 2.332 4.27198C2.064 4.06398 1.766 3.92798 1.438 3.86398V3.59998C1.438 3.27998 1.442 3.07198 1.45 2.97598C1.458 2.84798 1.474 2.76798 1.498 2.73598C1.562 2.62398 1.646 2.53998 1.75 2.48398Z"
      fill="#44464B"
    />
  </svg>
);
