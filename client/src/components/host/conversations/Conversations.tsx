'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  ShoppingBag,
  Star,
  Trash2,
  UserCircle,
  HelpCircle,
  Plus,
  LogIn,
  UserPlus,
  PlusCircle,
  BarChart3,
  Ticket,
  DollarSign,
  CreditCard,
  MoreHorizontal,
  Loader2,
  Search,
  MessageSquare,
  Send,
} from 'lucide-react';
import { useAuth } from '@/lib/context/auth';
import { useRouter } from 'next/navigation';
import { hostAnalyticsService, DashboardMetrics, HostOrder } from '@/lib/api/host-analytics';
import { hostEventsService } from '@/lib/api/host';

interface DashboardProps {
  onLogout: () => void;
}

import { Logo } from '@/components/shared/Logo';

import Sidebar from '@/components/layout/Sidebar';
import { BDTIcon } from '@/components/ui/Icons';

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface ChatThread {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  lastMessage: string;
  time: string;
  unread: number;
}

export default function Conversation() {

  const { user } = useAuth();
  const router = useRouter();

  const mockChats: ChatThread[] = [
    { id: 'c1', user: { name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=alex' }, lastMessage: 'Is the VIP lounge open for virtual users?', time: '12m ago', unread: 2 },
    { id: 'c2', user: { name: 'Sarah Miller', avatar: 'https://i.pravatar.cc/150?u=sarah' }, lastMessage: 'Thank you for the quick refund!', time: '1h ago', unread: 0 },
    { id: 'c3', user: { name: 'David Chen', avatar: 'https://i.pravatar.cc/150?u=david' }, lastMessage: 'Can I upgrade my basic ticket?', time: '3h ago', unread: 1 },
  ];

  const mockMessages: Message[] = [
    { id: 'm1', sender: 'Alex Johnson', text: 'Hi, I purchased a VIP ticket for Sonic Wave.', timestamp: '11:45 AM', isMe: false },
    { id: 'm2', sender: 'Me', text: 'Hello Alex! Great to have you. How can I help?', timestamp: '11:46 AM', isMe: true },
    { id: 'm3', sender: 'Alex Johnson', text: 'Is the VIP lounge open for virtual users?', timestamp: '11:50 AM', isMe: false },
  ];
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<ChatThread | null>(mockChats[0]);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white font-sans text-slate-950">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">

        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-[400] tracking-normal text-slate-900">Conversations</h1>
            <p className="text-sm text-slate-500 font-[300]">All of your conversations with attendees</p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
              <button title='Create Event' onClick={() => {router.push('/host/events/create')}} className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"><Plus size={18}/></button>
              <button title='Analytics' onClick={() => {router.push('/host/analytics')}} className="p-2 transition-all text-neutral-400 hover:text-neutral-600 border border-slate-100 rounded-lg hover:bg-slate-50"><BarChart3 size={18}/></button>
              <button title='Help' onClick={() => {router.push('/host/help')}} className="p-2 transition-all text-brand-400 hover:text-brand-500 border border-slate-100 rounded-lg hover:bg-slate-50"><HelpCircle size={18}/></button>
              <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden ml-2 border border-slate-200">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-slate-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg mb-10">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : 
          <div className="flex h-[calc(100vh-180px)] overflow-hidden">
            {/* Sidebar Inbox */}
            <div className="w-80 border-r border-slate-100 pr-4 flex flex-col">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                {/* Search */}
                <div className="flex-1 min-w-full flex gap-2">
                  <input
                    type="text"
                    placeholder="Search by name..."
                    className="w-full font-[300] text-[14px] pl-4 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none"
                  />
                  {/* Search Button */}
                  <button className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-colors">
                    <Search size={18} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              <div className="flex-1 px-4 py-6 overflow-y-auto">
                {mockChats.map((chat) => (
                  <button 
                    key={chat.id} 
                    onClick={() => setSelectedChat(chat)}
                    className={`w-full p-2 text-left border-b border-slate-50 transition-colors hover:bg-slate-50 flex gap-4 ${selectedChat?.id === chat.id ? 'bg-brand-50/30' : ''}`}
                  >
                    <img src={chat.user.avatar} className="w-10 h-10 rounded-full bg-slate-200" alt={chat.user.name} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-[500] text-slate-900 truncate">{chat.user.name}</span>
                        <span className="text-[10px] text-slate-400 font-[400] whitespace-nowrap">{chat.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate font-[400]">{chat.lastMessage}</p>
                    </div>
                    {chat.unread > 0 && <div className="w-5 h-5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{chat.unread}</div>}
                  </button>
                ))}
              </div>
            </div>
            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <>
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={selectedChat.user.avatar} className="w-10 h-10 rounded-full bg-slate-200" alt="" />
                      <div>
                        <h3 className="text-sm font-[500] text-slate-900">{selectedChat.user.name}</h3>
                        <p className="text-[9px] text-green-500 font-[300] uppercase tracking-widest">Online</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-1 text-neutral-600 hover:text-neutral-600 rounded-lg"><MoreHorizontal size={16} strokeWidth={1.5}/></button>
                    </div>
                  </div>
                  <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-slate-50/30">
                    {mockMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-4 rounded-2xl text-[12px] font-[300] ${msg.isMe ? 'bg-brand-500 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-600 rounded-tl-none'}`}>
                          {msg.text}
                          <p className={`text-[9px] mt-2 font-[500] ${msg.isMe ? 'text-white/60' : 'text-slate-400'}`}>{msg.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 border-t border-slate-100">
                    <div className="flex gap-4">
                      <input placeholder="Type your message..." className="flex-1 bg-slate-50 border border-transparent focus:border-brand-500 rounded-xl px-4 py-3 text-[12px] font-[300] outline-none transition-all"/>
                      <button className="bg-brand-500 text-white px-4 rounded-xl flex items-center justify-center hover:bg-brand-600 transition-all shadow-lg shadow-brand-100"><Send size={16}/></button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <MessageSquare size={48} className="opacity-20" />
                  <p className="text-sm font-bold uppercase tracking-widest">Select a conversation to start chatting</p>
                </div>
              )}
            </div>
          </div>
      }
      </main>
    </div>
  );
};
