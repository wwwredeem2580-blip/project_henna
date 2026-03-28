"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, Calendar, Image as ImageIcon, Info, Instagram, Facebook, Mail, LayoutDashboard, Menu, X } from "lucide-react";

export type Section = "home" | "designs" | "booking" | "shop" | "cart" | "product-details" | "login" | "register" | "admin";

interface SidebarProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  cartCount: number;
}

export function Sidebar({ activeSection, setActiveSection, cartCount }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const navItems: { id: Section; label: string; icon: any }[] = [
    { id: "home", label: "RongMahal", icon: null },
    { id: "designs", label: "Designs", icon: ImageIcon },
    { id: "booking", label: "Pre-booking", icon: Calendar },
    { id: "shop", label: "Shop", icon: ShoppingBag },
    { id: "cart", label: `Cart`, icon: ShoppingBag },
    { id: "login", label: "Sign In", icon: Info },
    { id: "admin", label: "Admin", icon: LayoutDashboard },
  ];

  const handleNavClick = (id: Section) => {
    setActiveSection(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-bg border-b border-ink/5 flex items-center justify-between px-6 z-[60]">
        <h1 
          className="text-xl font-serif tracking-tight cursor-pointer"
          onClick={() => handleNavClick("home")}
        >
          Ria’s Henna Artistry
        </h1>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-ink hover:bg-ink/5 rounded-full transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Desktop Sidebar & Mobile Menu Overlay */}
      <AnimatePresence>
        {(isOpen || isDesktop) && (
          <motion.div 
            initial={isDesktop ? { x: 0 } : { x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed left-0 top-0 h-full w-64 border-r border-ink/5 p-8 lg:p-12 flex flex-col justify-between z-50 bg-bg ${isOpen ? 'flex' : 'hidden lg:flex'}`}
          >
            <div className="space-y-12">
              <div 
                className="cursor-pointer group hidden lg:block"
                onClick={() => handleNavClick("home")}
              >
                <h1 className="text-3xl font-serif tracking-tight leading-none">Ria’s Henna<br />Artistry</h1>
                <div className="h-0.5 w-0 group-hover:w-8 bg-ink transition-all duration-500 mt-2" />
              </div>

              <nav className="space-y-6 mt-16 lg:mt-0">
                {navItems.slice(1).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center space-x-3 text-sm tracking-widest uppercase transition-all duration-300 ${
                      activeSection === item.id ? "text-ink font-semibold" : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span>{item.label}</span>
                      {item.id === "cart" && cartCount > 0 && (
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
                    {activeSection === item.id && (
                      <motion.div 
                        layoutId="active-indicator"
                        className="h-px w-4 bg-ink"
                      />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="space-y-8">
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
