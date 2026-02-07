'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageSquare, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { useSupport } from '@/lib/context/support';
import { useAuth } from '@/lib/context/auth';
import { Logo } from '@/components/shared/Logo';
import { TypingIndicator } from './TypingIndicator';

export const SupportChat = () => {
  const { isOpen, toggleChat } = useSupport();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([
    { id: 1, text: "Hi there! I'm Zenny. Welcome to Zenvy! 👋", sender: 'bot', time: 'Just now' },
    { id: 2, text: "I'm here to help you get started or answer any questions you might have.", sender: 'bot', time: 'Just now' },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showTimeout, setShowTimeout] = useState(false);
  const [queuePos, setQueuePos] = useState<number | null>(null);
  const [isClosed, setIsClosed] = useState(false);
  const [isAdminActive, setIsAdminActive] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const longWaitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isTyping, showTimeout]);

  // Connect to WebSocket
  useEffect(() => {
    if (isOpen && !socketRef.current) {
        // Dynamic import to avoid SSR issues if any
        import('socket.io-client').then(({ io }) => {
            const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
            
            // Pass user credentials for conversation persistence
            const userId = user?.sub || 'anonymous';
            const userName = user ? `${user.firstName} ${user.lastName}` : 'Guest';
            
            socketRef.current = io(`${socketUrl}/support`, {
                withCredentials: true,
                transports: ['websocket', 'polling'],
                query: {
                    userId,
                    userName
                }
            });

            socketRef.current.on('connect', () => {
                console.log('Connected to support chat');
            });

            // Handle conversation history on connection/reconnection
            socketRef.current.on('conversation_history', (data: any) => {
                console.log('Received conversation history:', data);
                if (data.messages && data.messages.length > 0) {
                    // Map server messages to client format
                    const formattedMessages = data.messages.map((msg: any, index: number) => ({
                        id: index + 1,
                        text: msg.text,
                        sender: msg.role === 'user' ? 'user' : msg.role === 'agent' ? 'bot' : 'bot',
                        time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }));
                    setMessages(formattedMessages);
                    
                    // Update admin active status if conversation is active
                    if (data.status === 'active') {
                        setIsAdminActive(true);
                    }
                } else {
                    // New conversation - show welcome messages
                    setMessages([
                        { id: 1, text: "Hi there! I'm Zenny. Welcome to Zenvy! 👋", sender: 'bot', time: 'Just now' },
                        { id: 2, text: "I'm here to help you get started or answer any questions you might have.", sender: 'bot', time: 'Just now' },
                    ]);
                }
            });

            socketRef.current.on('message', (data: any) => {
                // Clear typing state on response
                setIsTyping(false);
                setShowTimeout(false);
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                if (longWaitTimeoutRef.current) clearTimeout(longWaitTimeoutRef.current);

                setMessages((prev) => [
                    ...prev, 
                    { 
                        id: Date.now(), 
                        text: data.text, 
                        sender: 'bot', 
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                ]);
            });

            socketRef.current.on('queue_update', (data: { position: number, total: number }) => {
                setQueuePos(data.position);
            });
            
             socketRef.current.on('admin_joined', (data: any) => {
                 setQueuePos(null); // Clear queue when admin joins
                 setIsAdminActive(true); 
                 // Also stop any typing indicators from bot
                 setIsTyping(false);
                 setShowTimeout(false);
                 if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                 if (longWaitTimeoutRef.current) clearTimeout(longWaitTimeoutRef.current);
             });

            socketRef.current.on('conversation_closed', (data: any) => {
                setIsClosed(true);
                setQueuePos(null);
                setIsTyping(false);
                setShowTimeout(false);
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    text: data.message || "Conversation ended.",
                    sender: 'bot',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
            });

            socketRef.current.on('error', (err: any) => {
                console.error('Socket error:', err);
            });
        });
    }

    return () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    };
  }, [isOpen]);

  const handleSend = () => {
    if (!message.trim() || isClosed) return;

    const userMsg = {
        id: Date.now(), 
        text: message, 
        sender: 'user', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, userMsg]);
    setMessage('');

    // Clear existing timeouts
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (longWaitTimeoutRef.current) clearTimeout(longWaitTimeoutRef.current);
    setShowTimeout(false);

    // Initial 500ms delay before showing typing indicator
    // ONLY if admin is not active (otherwise we expect real replies or no indicator)
    if (!isAdminActive) {
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(true);
          
          // Start 20s timeout for "taking longer than usual" message
          // This runs 20s AFTER typing starts (so 20.5s total from send)
          longWaitTimeoutRef.current = setTimeout(() => {
            setShowTimeout(true);
          }, 20000);
        }, 500);
    }

    if (socketRef.current) {
        socketRef.current.emit('message', { text: userMsg.text });
    }
  };

  const handleRestart = () => {
    // Disconnect and reconnect to get a new session or clear current
    if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
    }
    setMessages([
      { id: Date.now(), text: "Starting a new conversation... 👋", sender: 'bot', time: 'Just now' }
    ]);
    setIsClosed(false);
    setIsAdminActive(false);
    setMessage('');
    
    // Slight delay to allow re-connection logic in useEffect to trigger if needed
    // or manually trigger a re-connect by toggling a key or just letting existing useEffect handle isOpen
    // Since isOpen is true, useEffect will re-run if we nullify socketRef
    // But useEffect depends on [isOpen], so it won't re-run unless we toggle isOpen or force it.
    // Better way: emit 'start_new' or just refresh page. 
    // Let's try force re-run by toggling a key or just calling connect function if we extracted it.
    // For now, toggling isOpen quickly is a hack, but let's just use the effect dependency.
    // Actually, we can just reload the window for a full clear, simpler for "Start New".
    window.location.reload(); 
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Helper to parse Markdown links
  const renderMessageWithLinks = (text: string) => {
    // Regex to match [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    
    // Split text by regex
    const parts = text.split(linkRegex);
    const matches = text.match(linkRegex);

    if (!matches) return text;

    const result = [];
    let lastIndex = 0;

    // We need to re-construct the array with text and links
    // The split approach above with capturing groups in JS split adds the groups to the array, 
    // but it can be tricky to map correctly if multiple links exist.
    // Let's use a simpler match/exec loop or just standard split with grouping.
    
    // Better approach:
    const elements = [];
    let match;
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    
    while ((match = regex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        elements.push(text.substring(lastIndex, match.index));
      }
      
      // Add the link
      elements.push(
        <a 
          key={match.index} 
          href={match[2]} 
          target="_blank" 
          rel="noopener noreferrer"
          className="underline decoration-current text-brand-600 font-medium hover:opacity-80 transition-opacity"
        >
          {match[1]}
        </a>
      );
      
      lastIndex = regex.lastIndex;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }
    
    return <>{elements}</>;
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4 font-sans antialiased">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 w-full h-[100dvh] sm:static sm:w-[380px] sm:h-[600px] bg-white sm:rounded-[2rem] shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-[10000]"
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-4">
                {/* Mobile Back Button */}
                <button 
                  onClick={toggleChat}
                  className="sm:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                >
                  <ArrowLeft size={20} strokeWidth={1.5}/>
                </button>

                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                     <Logo className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-sm font-[500] text-slate-900">Zenny</h3>
                  <p className="text-[9px] text-green-500 font-[300] uppercase tracking-widest">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                 <button className="p-1 text-neutral-600 hover:text-neutral-900 rounded-lg"><MoreHorizontal size={16} strokeWidth={1.5}/></button>
                 <button 
                  onClick={toggleChat}
                  className="hidden sm:block p-1 text-neutral-600 hover:text-neutral-900 rounded-lg ml-2"
                >
                  <X size={16} strokeWidth={1.5}/>
                </button>
              </div>
            </div>

            {/* Queue Banner - Always Visible */}
            {queuePos !== null && (
                 <div className="bg-blue-50/50 backdrop-blur-sm border-b border-blue-100 p-2 flex justify-center sticky top-0 z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-blue-600 text-[10px] font-medium flex items-center gap-2 uppercase tracking-wide"
                    >
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        Waiting for agent • Position {queuePos}
                    </motion.div>
                 </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-slate-50/30">
               <div className="flex justify-center">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest bg-slate-100/80 px-3 py-1 rounded-full">Today</span>
               </div>

               <div className="flex justify-center">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest bg-slate-100/80 px-3 py-1 rounded-full">Today</span>
               </div>

              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'bot' && (
                     <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center mr-2 flex-shrink-0 self-end mb-1">
                        <Logo className="w-4 h-4 text-brand-500" />
                     </div>
                  )}
                  <div 
                    className={`max-w-[70%] p-4 rounded-2xl text-[12px] font-[300] whitespace-pre-wrap ${
                      msg.sender === 'user' 
                        ? 'bg-brand-500 text-white rounded-tr-none' 
                        : 'bg-white border border-slate-100 text-slate-600 rounded-tl-none'
                    }`}
                  >
                    {renderMessageWithLinks(msg.text)}
                    <p className={`text-[9px] mt-2 font-[500] ${msg.sender === 'user' ? 'text-white/60' : 'text-slate-400'}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="mb-4">
                  <TypingIndicator showTimeout={showTimeout} />
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-slate-100 bg-white">
              {isClosed ? (
                 <div className="flex flex-col items-center gap-3 py-2">
                     <p className="text-xs text-slate-500">This conversation has ended.</p>
                     <button 
                        onClick={handleRestart}
                        className="px-6 py-2 bg-brand-600 text-white text-xs font-medium rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-100"
                     >
                        Start New Chat
                     </button>
                 </div>
              ) : (
                  <>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-slate-50 border border-transparent focus:border-brand-500 rounded-xl px-4 py-3 text-[12px] font-[300] outline-none transition-all placeholder:text-slate-400"
                    />
                    <button 
                      onClick={handleSend}
                      className={`px-4 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-brand-100 ${
                        message.trim() ? 'bg-brand-500 text-white hover:bg-brand-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                      disabled={!message.trim()}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                  <div className="flex justify-center mt-3">
                     <p className="text-[10px] text-slate-300 font-[300]">Powered by Zenvy AI</p>
                  </div>
                  </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        className={`w-14 h-14 bg-brand-600 text-white rounded-2xl shadow-xl shadow-brand-500/30 flex items-center justify-center transition-all duration-300 border-[3px] border-white ${isOpen ? 'rotate-90 opacity-0 pointer-events-none absolute' : 'opacity-100'}`}
      >
        <Logo className="w-7 h-7" strokeWidth="2.5" />
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
      </motion.button>
    </div>
  );
};
