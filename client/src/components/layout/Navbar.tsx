import React from 'react';
import { Logo } from '../shared/Logo';
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';

interface NavbarProps {
  onLogout?: () => void;
  className?: string; // Allow passing external classes or style overrides
}

export const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  return (
    <nav className="navigation-section">
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <Logo className="w-20 h-6 text-neutral-950" variant="full" strokeWidth="2.5" />
        </div>
        <div className="hidden lg:flex items-center gap-8">
          <a href="#" className="text-sm font-medium text-neutral-950 hover:text-brand-600 transition-colors">Marketplace</a>
          <a href="#" className="text-sm font-medium text-neutral-500 hover:text-brand-600 transition-colors">For Organizers</a>
          <a href="#" className="text-sm font-medium text-neutral-500 hover:text-brand-600 transition-colors">Pricing</a>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button className="hidden sm:block text-sm font-medium text-neutral-500 hover:text-brand-600 transition-colors">Log In</button>
        <Button variant="brand">
          Get started
        </Button>
        {onLogout && (
          <button onClick={onLogout} className="p-2 text-neutral-300 hover:text-red-500 transition-colors">
            <LogOut size={20} />
          </button>
        )}
      </div>
    </nav>
  );
};
