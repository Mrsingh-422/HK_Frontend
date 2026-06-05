'use client';
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Paperclip, MoreHorizontal, Bot } from 'lucide-react';

function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! Welcome to Health Kangaroo. How can we help you today? 🦘", sender: 'bot', time: 'Just now' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef(null);

  // Auto-scroll logic (triggers whenever messages or typing state changes)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessageId = Date.now();
    const newMessage = { id: userMessageId, text: inputValue, sender: 'user', time };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    // Trigger Typing Indicator after a brief moment
    setTimeout(() => {
      setIsTyping(true);
    }, 400);

    // Simulate Bot response
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: "Thanks for reaching out! A Health Kangaroo representative will assist you shortly.", 
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 2000);
  };

  return (
    <div className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-[9999] flex flex-col items-end font-sans selection:bg-emerald-100">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="
          w-[calc(100vw-2.5rem)] sm:w-[400px] 
          h-[550px] max-h-[80vh] md:max-h-[700px]
          bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] 
          flex flex-col mb-5 overflow-hidden 
          border border-gray-100 
          animate-in fade-in zoom-in-95 slide-in-from-bottom-10 duration-300 origin-bottom-right
        ">
          
          {/* Header - Gradient with Logo */}
          <div className="bg-gradient-to-r from-[#08b36a] to-[#059254] p-4 text-white shadow-md relative z-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white/20 shadow-inner">
                    <img 
                      src="/logo.png" 
                      alt="Health Kangaroo"
                      className="w-full h-full object-contain p-1"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                    <Bot className="w-5 h-5 text-[#08b36a] absolute" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm tracking-tight leading-tight">Health Kangaroo</h3>
                  <p className="text-[11px] text-green-100 opacity-90 flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-ping"></span>
                    Support Agent
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" className="hover:bg-white/10 p-1.5 rounded-full transition-colors text-white/85">
                  <MoreHorizontal size={18} />
                </button>
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/10 p-1.5 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 bg-gray-50/60 flex flex-col gap-3.5 scrollbar-thin"
          >
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200 mt-1 shadow-sm">
                    <Bot size={14} className="text-[#08b36a]" />
                  </div>
                )}
                
                <div className={`flex flex-col max-w-[75%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-[0_1px_2px_rgba(0,0,0,0.05)] ${
                    msg.sender === 'user' 
                      ? 'bg-[#08b36a] text-white rounded-tr-none font-medium' 
                      : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1 tracking-wide uppercase font-medium">{msg.time}</span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 justify-start animate-fade-in">
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200 mt-1">
                  <Bot size={14} className="text-[#08b36a]" />
                </div>
                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3.5 bg-white border-t border-gray-100">
            <form 
              onSubmit={handleSendMessage}
              className="flex items-center gap-2 bg-gray-50 border border-gray-200/80 rounded-full pl-3 pr-1.5 py-1 focus-within:bg-white focus-within:border-[#08b36a] focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all duration-200"
            >
              <button type="button" className="text-gray-400 hover:text-[#08b36a] transition-colors p-1.5 rounded-full hover:bg-gray-100">
                <Paperclip size={16} />
              </button>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-transparent border-none py-1.5 text-sm focus:outline-none text-gray-700 placeholder-gray-400"
              />
              <button 
                type="submit"
                disabled={!inputValue.trim()}
                className="bg-[#08b36a] text-white p-2 rounded-full hover:bg-[#069656] disabled:opacity-30 disabled:hover:bg-[#08b36a] disabled:scale-100 hover:scale-105 transition-all shadow-sm"
              >
                <Send size={14} fill="currentColor" />
              </button>
            </form>
            <p className="text-center text-[9px] uppercase tracking-wider text-gray-400 mt-2.5 font-medium">
              Powered by Health Kangaroo
            </p>
          </div>
        </div>
      )}

      {/* Upgraded & Enlarged Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative 
          w-16 h-16 md:w-20 md:h-20 
          rounded-full flex items-center justify-center 
          shadow-[0_10px_30px_rgba(8,179,106,0.4)] 
          hover:shadow-[0_12px_35px_rgba(8,179,106,0.6)] 
          transition-all duration-300 group overflow-hidden
          ${isOpen ? 'bg-gray-900 rotate-180' : 'bg-[#08b36a] hover:scale-105'}
        `}
      >
        {isOpen ? (
          <X size={28} className="text-white animate-in fade-in duration-300" />
        ) : (
          <div className="relative w-full h-full p-3 flex items-center justify-center">
            {/* Enlarged Notification Badge */}
            <span className="absolute top-3.5 right-3.5 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full z-10 shadow-sm animate-pulse"></span>
            
            {/* Embedded Circular Container */}
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden shadow-inner transition-transform group-hover:scale-105 duration-300 relative">
               <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-11 h-11 md:w-14 md:h-14 object-contain p-0.5"
                onError={(e) => { e.target.style.display = 'none' }}
              />
               {/* Backup Bot Icon */}
               <Bot className="w-6 h-6 md:w-8 md:h-8 text-[#08b36a] absolute" />
            </div>
          </div>
        )}
      </button>

    </div>
  );
}

export default ChatBot;