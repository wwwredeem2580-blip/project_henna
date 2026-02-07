'use client';

import React, { useState } from 'react';
import { Logo } from '../shared/Logo';
import { Button } from '../ui/button';
import { useAuth } from '@/lib/context/auth';
import { authService } from '@/lib/api/auth';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onLogin: () => void;
  onGetStarted: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLogin, onGetStarted }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await authService.logout();
    onLogin();
  }

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    { label: 'Events', href: '/events' },
    { label: 'Learn', href: '/learn' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-10 bg-neutral-0/80 backdrop-blur-xl border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div onClick={() => window.location.href = '/'} className="flex items-center cursor-pointer gap-2">
            <Logo variant="full" className="h-6 text-brand-600" strokeWidth="2" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <a 
                key={item.label}
                href={item.href} 
                className="text-sm font-medium text-neutral-600 hover:text-brand-600 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          {user ? (
            <Button 
              onClick={handleLogout}
              variant="brand-outline" 
              size="sm" 
              className="text-sm hidden md:flex h-8 px-6 rounded-xl"
            >
              Logout
            </Button>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Button 
                onClick={onLogin}
                variant="ghost" 
                size="sm"
                className='hover:translate-y-[-2px]'
              >
                Sign In
              </Button>
              <Button 
                onClick={onGetStarted}
                variant="brand" 
                size="sm"
              >
                Get Started
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-neutral-600 hover:text-brand-600 transition-colors"
            onClick={toggleMenu}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-white z-1000 transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
            <Logo variant="full" className="h-6 text-brand-600" strokeWidth="2" />
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-4 space-y-1">
              <div className="text-[10px] font-[500] text-slate-400 uppercase tracking-widest mb-4 px-2">Menu</div>
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block px-4 py-3 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-brand-600 rounded-xl transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-neutral-100 space-y-3">
             <div className="text-[10px] font-[500] text-slate-400 uppercase tracking-widest mb-2">Account</div>
            {user ? (
              <Button 
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                variant="brand-outline" 
                className="w-full justify-center"
              >
                Logout
              </Button>
            ) : (
              <div className="space-y-3">
                <Button 
                  onClick={() => {
                    onLogin();
                    setIsOpen(false);
                  }}
                  variant="ghost" 
                  className="w-full justify-start pl-4"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => {
                    onGetStarted();
                    setIsOpen(false);
                  }}
                  variant="brand" 
                  className="w-full justify-center"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
