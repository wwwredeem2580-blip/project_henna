import React from 'react';
import { Logo } from '../shared/Logo';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export const Footer: React.FC = () => {
  return (
    <footer className="pt-24 pb-12 px-6 bg-white border-t border-brand-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Logo className="w-5 h-5 text-white" strokeWidth="2.5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-neutral-950">Zenvy</span>
          </div>
          <p className="text-neutral-400 text-sm font-medium leading-relaxed">
            Engineering high-fidelity hybrid human experiences. The standard for modern event architecture.
          </p>
        </div>

        <div className="space-y-6">
          <h4 className="text-neutral-950 font-light uppercase tracking-widest text-xs">Features</h4>
          <ul className="space-y-4 text-neutral-500 font-medium text-xs uppercase tracking-wider">
            <li><a href="#" className="hover:text-brand-600 transition-colors font-medium">Ticketing</a></li>
            <li><a href="#" className="hover:text-brand-600 transition-colors font-medium">Verification</a></li>
            <li><a href="#" className="hover:text-brand-600 transition-colors font-medium">Analytics</a></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="text-neutral-950 font-light uppercase tracking-widest text-xs">Support</h4>
          <ul className="space-y-4 text-neutral-500 font-medium text-xs uppercase tracking-wider">
            <li><a href="#" className="hover:text-brand-600 transition-colors font-medium">Help Center</a></li>
            <li><a href="#" className="hover:text-brand-600 transition-colors font-medium">Contact</a></li>
            <li><a href="#" className="hover:text-brand-600 transition-colors font-medium">System Status</a></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="text-neutral-950 font-light uppercase tracking-widest text-xs">Newsletter</h4>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Stay updated..."
              className="bg-neutral-50 border-brand-200 focus-visible:ring-brand-600 font-medium text-xs"
            />
            <Button variant="brand" size="sm" className="h-9 px-4">Join</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-12 border-t border-brand-200 flex flex-col sm:flex-row justify-between items-center text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-300">
         <p>© 2024 Zenvy Labs.</p>
         <div className="flex gap-8 mt-4 sm:mt-0">
           <a href="#" className="hover:text-brand-600">Privacy</a>
           <a href="#" className="hover:text-brand-600">Security</a>
           <a href="#" className="hover:text-brand-600">Terms</a>
         </div>
      </div>
    </footer>
  );
};
