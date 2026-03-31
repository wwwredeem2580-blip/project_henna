"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, Calendar, Image as ImageIcon, Info, Instagram, Facebook, Mail, LayoutDashboard, Menu, X, Users, MapPin } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '../context/StoreContext';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const pathname = usePathname();
  const { cartCount } = useStore();

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const navItems = [
    { id: "/", label: "Shop", icon: ShoppingBag },
    { id: "/designs", label: "Designs", icon: ImageIcon },
    { id: "/booking", label: "Pre-booking", icon: Calendar },
    { id: "/about-us", label: "About Us", icon: Info },
    { id: "/contact-us", label: "Contact Us", icon: Mail },
    { id: "/tour", label: "Take a Tour", icon: MapPin },
    { id: "/cart", label: `Cart`, icon: ShoppingBag },
    { id: "/login", label: "Sign In", icon: Info },
    { id: "/admin", label: "Admin", icon: LayoutDashboard },
  ];

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-bg border-b border-ink/5 z-[60]">
        <div className="max-w-[1080px] mx-auto h-full flex items-center justify-between px-6">
          <Link 
            href="/"
            className="flex items-center space-x-3 cursor-pointer"
            onClick={handleNavClick}
          >
            <div className="w-8 h-8 relative flex-shrink-0">
               <img src="/logo/logo.png" alt="Logo" className="w-full h-full object-contain mix-blend-multiply" />
            </div>
            <h1 className="text-xl font-serif tracking-tight">Ria’s Henna</h1>
          </Link>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-ink hover:bg-ink/5 rounded-full transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Desktop Sidebar & Mobile Menu Overlay */}
      <AnimatePresence>
        {(isOpen || isDesktop) && (
          <motion.div 
            initial={isDesktop ? { x: 0 } : { x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`w-64 border-r border-ink/5 p-8 lg:p-12 flex flex-col justify-between z-50 bg-bg flex-shrink-0 ${
              isDesktop
                ? 'hidden lg:flex sticky top-0 h-screen overflow-y-auto no-scrollbar'
                : 'fixed left-0 top-0 h-full overflow-y-auto'
            }`}
          >
            <div className="space-y-12">
              <Link 
                href="/"
                className="cursor-pointer group hidden lg:flex flex-col items-start"
                onClick={handleNavClick}
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-6 overflow-hidden">
                  <img src="/logo/logo.png" alt="Ria's Henna Artistry" className="w-full h-full object-contain mix-blend-multiply opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" />
                </div>
                <h1 className="text-3xl font-serif tracking-tight leading-none">Ria’s Henna<br />Artistry</h1>
                <div className="h-0.5 w-0 group-hover:w-8 bg-ink transition-all duration-500 mt-4" />
              </Link>

              <nav className="space-y-6 mt-16 lg:mt-0">
                {navItems.map((item) => {
                  const isActive = pathname === item.id || (item.id === "/" && pathname === "/shop");
                  return (
                    <Link
                      key={item.id}
                      href={item.id}
                      onClick={handleNavClick}
                      className={`flex items-center space-x-3 text-sm tracking-widest uppercase transition-all duration-300 ${
                        isActive ? "text-ink font-semibold" : "text-ink-muted hover:text-ink"
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        <span>{item.label}</span>
                        {item.id === "/cart" && cartCount > 0 && (
                          <motion.span 
                            key={cartCount}
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-flex items-center justify-center bg-ink text-bg text-[10px] w-4 h-4 rounded-full"
                          >
                            {cartCount}
                          </motion.span>
                        )}
                      </span>
                      {isActive && (
                        <motion.div 
                          layoutId="active-indicator"
                          className="h-px w-4 bg-ink"
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-8 mt-12">
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-ink-muted">Connect</p>
                <div className="flex space-x-4">
                  <Instagram size={16} className="text-ink-muted hover:text-ink cursor-pointer transition-colors" />
                  <Facebook size={16} className="text-ink-muted hover:text-ink cursor-pointer transition-colors" />
                  <Mail size={16} className="text-ink-muted hover:text-ink cursor-pointer transition-colors" />
                </div>
              </div>
              <p className="text-[10px] text-ink-muted leading-relaxed">
                © 2026 Ria’s Henna Artistry.<br />
                Artistry in every stroke.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Overlay Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-ink/20 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>
    </>
  );
}
