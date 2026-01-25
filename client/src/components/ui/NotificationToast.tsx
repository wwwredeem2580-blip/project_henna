'use client';

import { useNotification } from '@/lib/context/notification';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X, Check, Loader2 } from 'lucide-react';

// @Deprecated Legacy NotificationToast
// export function NotificationToast() {
//   const { notification, isVisible, hideNotification } = useNotification();

//   if (!notification) return null;

//   const icons = {
//     success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
//     error: <XCircle className="w-5 h-5 text-red-500" />,
//     info: <Info className="w-5 h-5 text-blue-500" />,
//   };

//   const bgColors = {
//     success: 'bg-green-50 border-green-200',
//     error: 'bg-red-50 border-red-200',
//     info: 'bg-blue-50 border-blue-200',
//   };

//   return (
//     <AnimatePresence>
//       {isVisible && (
//         <motion.div
//           initial={{ opacity: 0, y: -50, scale: 0.95 }}
//           animate={{ opacity: 1, y: 0, scale: 1 }}
//           exit={{ opacity: 0, y: -50, scale: 0.95 }}
//           className="fixed top-4 right-4 z-50 max-w-[400px]"
//         >
//           <div className={`${bgColors[notification.type]} border-2 rounded-xl shadow-lg p-4 flex items-start gap-3`}>
//             {icons[notification.type]}
//             <div className="flex-1">
//               <h4 className="font-semibold text-gray-900">{notification.title}</h4>
//               <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
//             </div>
//             <button
//               onClick={hideNotification}
//               className="text-gray-400 hover:text-gray-600 transition-colors"
//             >
//               <X className="w-4 h-4" />
//             </button>
//           </div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }

export function NotificationToast() {
  const { notification, isVisible, hideNotification } = useNotification();

  return (
    <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-[380px] px-6 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-8 scale-95 pointer-events-none'}`}>
      <div className={`
        relative overflow-hidden p-4 rounded-[24px] border shadow-[0_20px_40px_rgba(0,0,0,0.12)] backdrop-blur-2xl flex items-center gap-4
        ${notification?.type === 'success' ? 'bg-white/80 border-emerald-100/50' : notification?.type === 'error' ? 'bg-white/80 border-rose-100/50' : 'bg-white/80 border-slate-100/50'}
      `}>
        {/* Status Glow */}
        <div className={`absolute -left-12 -top-12 w-24 h-24 rounded-full blur-[40px] opacity-20 pointer-events-none ${notification?.type === 'success' ? 'bg-emerald-500' : notification?.type === 'error' ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>

        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform duration-500 ${isVisible ? 'scale-100 rotate-0' : 'scale-0 rotate-12'} ${
          notification?.type === 'success' ? 'bg-emerald-500 text-white' :
          notification?.type === 'error' ? 'bg-rose-500 text-white' :
          'bg-slate-900 text-white'
        }`}>
          {notification?.type === 'success' && <Check size={20} strokeWidth={3} />}
          {notification?.type === 'error' && <X size={20} strokeWidth={3} />}
          {notification?.type === 'info' && <Loader2 size={20} className="animate-spin" />}
        </div>

        <div className="flex-1">
          <h5 className="text-sm font-bold text-slate-900">{notification?.title}</h5>
          <p className="text-xs font-medium text-slate-500 leading-tight mt-0.5">{notification?.message}</p>
        </div>

        <button onClick={hideNotification} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
