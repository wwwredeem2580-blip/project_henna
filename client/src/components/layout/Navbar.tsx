'use client';

import React from 'react';
import { Logo } from '../shared/Logo';
import { Button } from '../ui/button';
import { useAuth } from '@/lib/context/auth';
import { authService } from '@/lib/api/auth';

interface NavbarProps {
  onLogin: () => void;
  onGetStarted: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLogin, onGetStarted }) => {
  const { user } = useAuth();

  const handleLogout = async () => {
    await authService.logout();
    onLogin();
  }
  return (
    <nav className="sticky top-0 z-10 bg-neutral-0/80 backdrop-blur-xl border-b border-brand-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo variant="full" className="h-6 text-brand-600" strokeWidth="2" />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-neutral-600 hover:text-brand-600 transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-sm font-medium text-neutral-600 hover:text-brand-600 transition-colors">
            Pricing
          </a>
          <a href="#about" className="text-sm font-medium text-neutral-600 hover:text-brand-600 transition-colors">
            About
          </a>
        </div>
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
              className='hover:scale-103'
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
        <button className="md:hidden p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>
  );
};
