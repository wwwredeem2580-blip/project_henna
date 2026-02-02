'use client';

import React, { createContext, useContext, useState } from 'react';
import { SupportChat } from '@/components/support/SupportChat';

interface SupportContextType {
  isOpen: boolean;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
}

const SupportContext = createContext<SupportContextType | undefined>(undefined);

export function SupportProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => setIsOpen((prev) => !prev);
  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);

  return (
    <SupportContext.Provider value={{ isOpen, toggleChat, openChat, closeChat }}>
      {children}
      <SupportChat />
    </SupportContext.Provider>
  );
}

export function useSupport() {
  const context = useContext(SupportContext);
  if (context === undefined) {
    throw new Error('useSupport must be used within a SupportProvider');
  }
  return context;
}
