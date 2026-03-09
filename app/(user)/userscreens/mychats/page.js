"use client";
import React, { useState, useRef, useEffect } from "react";
// Icons
import {
  FiSearch, FiSend, FiPaperclip, FiArrowLeft,
  FiMoreVertical, FiCheckCircle, FiPhone, FiVideo, FiHome,
} from "react-icons/fi";
import { MdVerified, MdOutlineMedicalServices } from "react-icons/md";

// Initial Mock Data
const INITIAL_CHATS = [
  {
    id: 1,
    name: "Dr. Sarah Jenkins",
    role: "Senior Cardiologist",
    online: true,
    unreadCount: 2,
    image: "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&w=200&q=80",
    messages: [
      { id: 101, text: "Hello! Please remember to bring your previous ECG reports.", sender: "them", time: "10:00 AM" },
      { id: 102, text: "I will, thank you doctor.", sender: "me", time: "10:05 AM" },
      { id: 103, text: "See you at 4 PM.", sender: "them", time: "10:30 AM" }
    ]
  },
  {
    id: 2,
    name: "City Care Pharmacy",
    role: "Pharmacist",
    online: false,
    unreadCount: 0,
    image: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=200&q=80",
    messages: [
      { id: 201, text: "Your order #PHA-882 is packed.", sender: "them", time: "Yesterday" },
      { id: 202, text: "When will it be delivered?", sender: "me", time: "Yesterday" },
      { id: 203, text: "It is out for delivery today.", sender: "them", time: "Yesterday" }
    ]
  },
  {
    id: 3,
    name: "Lab Support Team",
    role: "Technical Team",
    online: true,
    unreadCount: 0,
    image: "https://images.unsplash.com/photo-1579152276503-3172e276081e?auto=format&fit=crop&w=200&q=80",
    messages: [
      { id: 301, text: "Your blood sample has been received.", sender: "them", time: "Monday" }
    ]
  }
];

export default function ChatPage() {
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef(null);

  // Derived State
  const selectedChat = chats.find(c => c.id === selectedChatId);
  const filteredChats = chats.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedChat?.messages]);

  // Send Message Logic (Updates Chat Room AND Sidebar List)
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChatId) return;

    const msgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = { id: Date.now(), text: newMessage, sender: "me", time: msgTime };

    setChats(prevChats => {
      const updatedChats = prevChats.map(chat => {
        if (chat.id === selectedChatId) {
          return { ...chat, messages: [...chat.messages, newMsg] };
        }
        return chat;
      });
      // Move the updated chat to the top of the list
      const currentChatIndex = updatedChats.findIndex(c => c.id === selectedChatId);
      const [currentChat] = updatedChats.splice(currentChatIndex, 1);
      return [currentChat, ...updatedChats];
    });

    setNewMessage("");
  };

  return (
    /* 
      FIXED INSET-0 Z-50 completely covers the screen, 
      hiding your global header and footer to create an App-like experience. 
    */
    <div className="fixed inset-0 z-50 bg-white flex overflow-hidden font-sans">

      {/* --- LEFT PANE: CHAT LIST --- */}
      {/* Hidden on mobile if a chat is selected, but always visible on desktop (md:flex) */}
      <div className={`${selectedChatId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[380px] lg:w-[420px] h-full border-r border-gray-100 bg-[#fcfcfc] shrink-0`}>

        {/* Header */}
        <div className="p-6 pb-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#08b36a] transition-colors mb-6"
          >
            <FiHome size={14} /> Back to Dashboard
          </button>

          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-6">Messages</h1>

          {/* Search Bar */}
          <div className="relative group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#08b36a] transition-colors" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-12 pr-4 py-3.5 bg-gray-100 border-none rounded-2xl outline-none font-bold text-sm transition-all focus:bg-white focus:ring-2 ring-[#08b36a]/20 shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* List of Chats */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-1">
          {filteredChats.map((chat) => {
            const lastMsg = chat.messages[chat.messages.length - 1];
            const isSelected = selectedChatId === chat.id;

            return (
              <div
                key={chat.id}
                onClick={() => {
                  setSelectedChatId(chat.id);
                  // Mark as read
                  setChats(chats.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c));
                }}
                className={`flex items-center gap-4 p-4 rounded-[24px] cursor-pointer transition-all ${isSelected
                  ? "bg-[#08b36a] text-white shadow-xl shadow-green-100 scale-[1.02]"
                  : "bg-white hover:bg-gray-50 border border-transparent hover:border-gray-100"
                  }`}
              >
                <div className="relative shrink-0">
                  <img src={chat.image} className="w-14 h-14 rounded-2xl object-cover border-2 border-white" alt="" />
                  {chat.online && <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 rounded-full ${isSelected ? 'bg-green-300 border-[#08b36a]' : 'bg-[#08b36a] border-white'}`}></div>}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h3 className={`font-black text-sm truncate flex items-center gap-1.5 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                      {chat.name}
                      <MdVerified className={isSelected ? "text-white" : "text-blue-500"} size={14} />
                    </h3>
                    <span className={`text-[9px] font-black uppercase whitespace-nowrap ${isSelected ? 'text-green-100' : 'text-gray-400'}`}>
                      {lastMsg?.time}
                    </span>
                  </div>
                  <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isSelected ? 'text-green-200' : 'text-[#08b36a]'}`}>
                    {chat.role}
                  </p>
                  <p className={`text-xs truncate font-medium ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>
                    {lastMsg?.sender === "me" ? "You: " : ""}{lastMsg?.text}
                  </p>
                </div>

                {chat.unreadCount > 0 && !isSelected && (
                  <div className="w-6 h-6 bg-[#08b36a] text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-md">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- RIGHT PANE: CHAT ROOM --- */}
      {/* Hidden on mobile if NO chat is selected. Always visible on Desktop */}
      <div className={`${!selectedChatId ? 'hidden md:flex' : 'flex'} flex-col flex-1 h-full bg-[#f4f7f6] relative`}>

        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 md:p-6 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedChatId(null)} className="md:hidden p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                  <FiArrowLeft size={20} className="text-gray-900" />
                </button>
                <img src={selectedChat.image} className="w-12 h-12 rounded-2xl object-cover shadow-sm" alt="" />
                <div>
                  <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
                    {selectedChat.name} <MdVerified className="text-blue-500" size={18} />
                  </h3>
                  <p className="text-[10px] font-black text-[#08b36a] uppercase tracking-widest flex items-center gap-1">
                    {selectedChat.online && <span className="w-1.5 h-1.5 bg-[#08b36a] rounded-full animate-pulse"></span>}
                    {selectedChat.online ? "Online Now" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 md:gap-4">
                <button className="p-3 bg-green-50 text-[#08b36a] rounded-full hover:bg-[#08b36a] hover:text-white transition-all"><FiPhone size={18} /></button>
                <button className="p-3 bg-green-50 text-[#08b36a] rounded-full hover:bg-[#08b36a] hover:text-white transition-all hidden sm:block"><FiVideo size={18} /></button>
                <button className="p-3 text-gray-400 hover:text-gray-900 transition-colors"><FiMoreVertical size={20} /></button>
              </div>
            </div>

            {/* Messages Area */}
            {/* Removed standard scrollbar for a cleaner app look */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 [&::-webkit-scrollbar]:hidden">
              {/* Medical Disclaimer Banner */}
              <div className="flex justify-center mb-8">
                <span className="bg-yellow-50 border border-yellow-100 text-yellow-700 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-sm text-center">
                  End-to-end encrypted medical channel
                </span>
              </div>

              {selectedChat.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[85%] md:max-w-[70%] p-4 shadow-sm ${msg.sender === "me"
                    ? "bg-[#08b36a] text-white rounded-[24px] rounded-br-sm shadow-green-100"
                    : "bg-white text-gray-800 rounded-[24px] rounded-bl-sm border border-gray-100"
                    }`}>
                    <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                    <div className={`flex items-center gap-1 mt-2 text-[9px] font-black uppercase tracking-wider ${msg.sender === "me" ? "text-green-100 justify-end" : "text-gray-400"}`}>
                      {msg.time} {msg.sender === "me" && <FiCheckCircle size={12} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3 max-w-4xl mx-auto">
                <button type="button" className="p-3.5 bg-gray-50 text-gray-400 hover:text-[#08b36a] rounded-full transition-colors">
                  <FiPaperclip size={20} />
                </button>
                <input
                  type="text"
                  placeholder="Type your medical query here..."
                  className="flex-1 py-4 px-6 bg-gray-50 border border-gray-100 rounded-full outline-none font-bold text-sm focus:bg-white focus:ring-2 ring-[#08b36a]/20 transition-all shadow-inner"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-14 h-14 bg-[#08b36a] text-white rounded-full flex items-center justify-center shadow-lg shadow-green-200 hover:bg-[#068a52] hover:scale-105 transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:scale-100"
                >
                  <FiSend size={20} className="ml-1" />
                </button>
              </form>
            </div>
          </>
        ) : (
          // --- EMPTY STATE (Desktop only when no chat is selected) ---
          <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50/50">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl shadow-green-50 mb-6">
              <MdOutlineMedicalServices className="text-[#08b36a]" size={48} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Your Medical Inbox</h2>
            <p className="text-gray-500 font-medium max-w-sm">
              Select a conversation from the left to chat with your doctors, pharmacy, or support team securely.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}