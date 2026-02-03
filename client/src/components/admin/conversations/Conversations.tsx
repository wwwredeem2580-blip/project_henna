'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MessageSquare,
  Send,
  ArrowLeft,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Power
} from 'lucide-react';
import { useAuth } from '@/lib/context/auth';
import { useRouter } from 'next/navigation';
import { adminSupportService, SupportConversation } from '@/lib/api/support-admin';
import { io, Socket } from 'socket.io-client';
import Sidebar from '@/components/layout/Sidebar';

export default function Conversations() {
  const { user } = useAuth();
  const router = useRouter();
  
  // State
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<SupportConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState('');
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial Fetch
  useEffect(() => {
    loadQueue();
  }, []);

  // Socket Connection
  useEffect(() => {
    if (!user) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const newSocket = io(`${socketUrl}/support/admin`, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to admin support');
    });

    newSocket.on('new_escalation', (data) => {
        // Add to list if not exists
        setConversations(prev => {
            if (prev.find(c => c._id === data.conversationId)) return prev;
            return [{
                _id: data.conversationId,
                userName: data.userName,
                userId: data.userId,
                status: 'escalated',
                urgent: data.urgency === 'high' || data.urgency === 'critical',
                messages: [], // Will be loaded on select
                escalatedAt: new Date().toISOString(),
                createdAt: new Date().toISOString()
            } as any, ...prev];
        });
        
        // Play notification sound
        const audio = new Audio('/sounds/notification.mp3');
        audio.play().catch(e => console.log('Audio play failed', e));
    });

    newSocket.on('conversation_updated', (data) => {
        setConversations(prev => prev.map(c => {
            if (c._id === data.conversationId) {
                if (data.action === 'joined') {
                   return { ...c, status: 'active' as const, agentName: data.agentName };
                }
                if (data.action === 'closed') {
                   return { ...c, status: 'closed' as const }; // Optionally remove from list
                }
            }
            return c;
        }).filter(c => c.status !== 'closed')); // Remove closed ones from queue view
        
        // If current chat was closed by someone else
        if (selectedChat?._id === data.conversationId && data.action === 'closed') {
            setSelectedChat(null);
            setIsMobileChatOpen(false);
        }
        
         // If current chat was joined by someone else
        if (selectedChat?._id === data.conversationId && data.action === 'joined') {
             setSelectedChat(prev => prev ? { ...prev, status: 'active', agentName: data.agentName } : null);
        }
    });

    newSocket.on('message_sent', () => {
        setMessage('');
    });

    // Receive message from user (forwarded by server)
    newSocket.on('user_message', (data) => {
        setConversations(prev => prev.map(c => {
            if (c._id === data.conversationId) {
                // Update snippet?
                return c;
            }
            return c;
        }));

        if (selectedChat?._id === data.conversationId) {
             setSelectedChat(prev => {
                 if(!prev) return null;
                 return {
                     ...prev,
                     messages: [...prev.messages, data.message]
                 };
             });
             // Auto scroll
             setTimeout(() => {
                 if (chatContainerRef.current) {
                     chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                 }
             }, 100);
        }
    });
    
    // Listen for admin messages (from self or others) sent to user
     newSocket.on('message', (data) => {
         // This event might be needed if we want to see what other admins send? 
         // Currently server emits 'message' to USER socket, not ADMIN socket for admin messages.
         // We rely on optimisic update or 'conversation_joined' history.
         // Wait, checking chatbot.ts... 
         // When admin sends, server emits 'message' to userSocket.
         // It does NOT emit back to adminSocket (except 'message_sent' success).
         // So for multi-admin sync, we rely on local append. 
         // BUT if another admin is chatting, WE won't see it unless we also implement 'admin_message_broadcast'.
         // For now, let's assume 1 admin per ticket as per "Claim" model.
    });


    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, selectedChat?._id]); // Re-bind if needed, but preferably stable

  const loadQueue = async () => {
    try {
      setLoading(true);
      const data = await adminSupportService.getQueue();
      setConversations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = (chat: SupportConversation) => {
    // If we select a chat, we first get basic info.
    // We should emit 'join_instruction' purely to fetch history and subscribe?
    // Actually, 'join_conversation' claims it. We want PREVIEW.
    // We need a separate way to get history without claiming. 
    // Or, we just use the REST API to get history if it wasn't full in list. 
    // The list endpoint returns full objects?
    // server: Support.find(...).limit(50). 
    // Yes, it returns the whole doc including messages. So we have history!
    
    setSelectedChat(chat);
    setIsMobileChatOpen(true);
    
    // Determine preview mode
    // In server: agentId is stored.
    // If chat.agentId === user.sub => Active Mode.
    
    // Since we don't have user.id reliably mapped to mongodb _id here without checking,
    // We can rely on: if status === 'active' && chat.agentName !== user.name -> Preview (Owned by other)
    // If status === 'escalated' -> Preview (Unclaimed)
    
    const isMine = chat.agentName === `${user?.firstName} ${user?.lastName}`; // Simple name check for now
    
    // Also check if agentId matches sub if available (more reliable)
    // const isMineById = chat.agentId === user?.sub; 
    
    setIsPreviewMode(!isMine && chat.status !== 'bot'); // Basic check
    
    // Don't auto-scroll to bottom aggressively on selection to prevent page jumping
    // Just scroll the container
    // Just scroll the container
    setTimeout(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, 100);
  };

  const handleJoin = () => {
    if (!socket || !selectedChat || !user) return;
    
    socket.emit('join_conversation', {
        conversationId: selectedChat._id,
        adminId: user.sub || 'admin',
        adminName: `${user.firstName} ${user.lastName}` || 'Admin'
    });
    
    // Optimistic update
    const adminName = `${user.firstName} ${user.lastName}` || 'Admin';
    setSelectedChat(prev => prev ? { ...prev, status: 'active', agentName: adminName } as any : null);
    setConversations(prev => prev.map(c => c._id === selectedChat._id ? { ...c, status: 'active', agentName: adminName } as any : c));
    setIsPreviewMode(false);
  };

  const handleClose = () => {
     if (!socket || !selectedChat) return;
     
     if (confirm('Are you sure you want to close this conversation?')) {
         socket.emit('close_conversation', {
             conversationId: selectedChat._id
         });
         
         // Optimistic remove
         setConversations(prev => prev.filter(c => c._id !== selectedChat._id));
         setSelectedChat(null);
         setIsMobileChatOpen(false);
     }
  };

  const handleSend = () => {
      if (!message.trim() || !socket || !selectedChat) return;
      
      const text = message.trim();
      
      socket.emit('admin_message', {
          conversationId: selectedChat._id,
          text
      });
      
      // Optimistic append
      const newMsg = {
          role: 'agent',
          text,
          timestamp: new Date().toISOString()
      };
      
      setSelectedChat(prev => prev ? {
          ...prev,
          messages: [...prev.messages, newMsg]
      } : null);
      
      setMessage('');
      setMessage('');
      setTimeout(() => {
          if (chatContainerRef.current) {
              chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          }
      }, 100);
  };
  
  // Helper to parse Markdown links (reused from SupportChat)
  const renderMessageWithLinks = (text: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const elements = [];
    let match;
    let lastIndex = 0;
    
    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(text.substring(lastIndex, match.index));
      }
      elements.push(
        <a key={match.index} href={match[2]} target="_blank" rel="noopener noreferrer" className="underline decoration-current font-medium hover:opacity-80 transition-opacity">
          {match[1]}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < text.length) {
        elements.push(text.substring(lastIndex));
    }
    return elements.length > 0 ? <>{elements}</> : text;
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white font-sans text-slate-950">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-4 lg:p-8 h-screen flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-6 shrink-0">
          <div>
            <h1 className="text-2xl font-[400] tracking-normal text-slate-900">Support Queue</h1>
            <p className="text-sm text-slate-500 font-[300]">Manage escalated user conversations</p>
          </div>
          <div className="flex gap-2">
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden bg-white rounded-2xl">
            {/* List */}
            <div className={`w-full sm:w-80 border-r border-slate-100 flex flex-col bg-slate-50/50 ${isMobileChatOpen ? 'hidden sm:flex' : ''}`}>
                <div className="p-4 border-b border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            placeholder="Search tickets..." 
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500 transition-colors"
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                       <div className="p-8 text-center text-slate-400 text-sm">Loading queue...</div>
                    ) : conversations.length === 0 ? (
                       <div className="p-8 text-center flex flex-col items-center gap-3 text-slate-400">
                           <CheckCircle2 size={32} className="opacity-20" />
                           <p className="text-sm">All caught up! No active tickets.</p>
                       </div>
                    ) : (
                        conversations.map(chat => (
                            <button
                                key={chat._id}
                                onClick={() => handleSelectChat(chat)}
                                className={`w-full p-4 text-left border-b border-slate-100 hover:bg-white transition-colors flex gap-3 ${selectedChat?._id === chat._id ? 'bg-white border-l-4 border-l-brand-500' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-sm">
                                    {chat.userName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-medium text-slate-900 text-sm">{chat.userName}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${chat.urgent ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {chat.urgent ? 'Urgent' : 'Normal'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <p className="text-xs text-slate-500 truncate w-32">
                                            {chat.messages[chat.messages.length - 1]?.text || 'No messages'}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            {chat.status === 'active' && (
                                                <span className="w-2 h-2 rounded-full bg-yellow-400" title={`Claimed by ${chat.agentName}`} />
                                            )}
                                            {chat.status === 'escalated' && (
                                                <span className="w-2 h-2 rounded-full bg-blue-400" title="Waiting" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat View (Redesigned to match SupportChat.tsx) */}
            <div className={`flex-1 flex flex-col bg-white ${isMobileChatOpen ? 'flex' : 'hidden sm:flex'}`}>
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setIsMobileChatOpen(false)} className="sm:hidden p-2 text-slate-500"><ArrowLeft size={18}/></button>
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                                    <User size={20} className="text-brand-600"/>
                                </div>
                                <div>
                                    <h2 className="font-[500] text-sm text-slate-900">{selectedChat.userName}</h2>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                        {selectedChat.status === 'active' ? (
                                            <span className="text-green-500 font-medium uppercase tracking-widest flex items-center gap-1">
                                                Active ({selectedChat.agentName})
                                            </span>
                                        ) : (
                                            <span className="text-orange-500 font-medium uppercase tracking-widest flex items-center gap-1">
                                                Unclaimed
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {isPreviewMode && (
                                    <button 
                                        onClick={handleJoin}
                                        className="px-4 py-2 bg-brand-500 text-white rounded-xl text-xs font-medium hover:bg-brand-600 transition-all shadow-lg shadow-brand-100"
                                    >
                                        Accept Request
                                    </button>
                                )}
                                <button 
                                    onClick={handleClose}
                                    title="Close Ticket"
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <Power size={18}/>
                                </button>
                            </div>
                        </div>

                        {/* Messages Area (Styled like SupportChat) */}
                        <div ref={chatContainerRef} className="flex-1 p-8 overflow-y-auto space-y-6 bg-slate-50/30">
                           <div className="flex justify-center">
                              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest bg-slate-100/80 px-3 py-1 rounded-full">Conversation History</span>
                           </div>

                            {selectedChat.messages.map((msg, i) => {
                                // In Admin view: 
                                // 'user' is the Customer (Left aligned)
                                // 'agent' is Me or Other Agent (Right aligned)
                                // 'bot' is System (Left aligned, distinguishable)
                                const isAgent = msg.role === 'agent';
                                const isUser = msg.role === 'user';
                                
                                return (
                                    <div key={i} className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
                                        
                                        {/* Avatar for Customer */}
                                        {isUser && (
                                            <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center mr-2 flex-shrink-0 self-end mb-1">
                                                <span className="text-xs font-bold text-slate-400">{selectedChat.userName.charAt(0)}</span>
                                            </div>
                                        )}
                                        
                                        {/* Avatar for Bot */}
                                        {msg.role === 'bot' && (
                                             <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center mr-2 flex-shrink-0 self-end mb-1">
                                                 <span className="text-xs font-bold text-brand-500">AI</span>
                                             </div>
                                        )}

                                        <div className={`max-w-[70%] p-4 rounded-2xl text-[12px] font-[300] whitespace-pre-wrap ${
                                            isAgent 
                                                ? 'bg-brand-500 text-white rounded-tr-none' 
                                                : 'bg-white border border-slate-100 text-slate-600 rounded-tl-none'
                                        }`}>
                                            {renderMessageWithLinks(msg.text)}
                                            <p className={`text-[9px] mt-2 font-[500] ${isAgent ? 'text-white/60' : 'text-slate-400'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                             <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 border-t border-slate-100 bg-white">
                            {isPreviewMode ? (
                                <div className="text-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-sm">
                                    You are in preview mode. <button onClick={handleJoin} className="text-brand-600 font-medium hover:underline">Accept Request</button> to reply.
                                </div>
                            ) : (
                                <div className="flex gap-4">
                                    <input 
                                        type="text"
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-slate-50 border border-transparent focus:border-brand-500 rounded-xl px-4 py-3 text-[12px] font-[300] outline-none transition-all placeholder:text-slate-400"
                                        autoFocus
                                    />
                                    <button 
                                        onClick={handleSend}
                                        disabled={!message.trim()}
                                        className={`px-4 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-brand-100 ${
                                            message.trim() ? 'bg-brand-500 text-white hover:bg-brand-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        }`}
                                    >
                                        <Send size={16}/>
                                    </button>
                                </div>
                            )}
                         </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                        <MessageSquare size={48} strokeWidth={1} className="mb-4 opacity-50"/>
                        <p className="font-[300] text-sm uppercase tracking-widest">Select a conversation</p>
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}
