"use client";
import React, { useState, useRef, useEffect } from "react";
import { Search, Send, Paperclip, Phone, MoreVertical, ArrowLeft } from "lucide-react";

// Dummy Chat List Data
const chatList =[
  { id: "776120241109021555", patient: "Yash User", avatar: "YU", contact: "9999999999", date: "2024-11-09", lastMessage: "Sir, mera appointment kal ka hai?", unread: 2 },
  { id: "485320241203020909", patient: "Amit Sharma", avatar: "AS", contact: "8888888888", date: "2024-12-03", lastMessage: "Reports aagayi hain, check kar lijiye.", unread: 0 },
  { id: "213520241213044311", patient: "Priya Singh", avatar: "PS", contact: "7777777777", date: "2024-12-13", lastMessage: "Thank you doctor! Main ab theek feel kar rahi hu.", unread: 0 },
  { id: "141220250107114921", patient: "Rahul Verma", avatar: "RV", contact: "6666666666", date: "2025-01-07", lastMessage: "Fees kitni hogi consultation ki?", unread: 1 },
];

// Dummy Messages for the active chat
const initialMessages =[
  { id: 1, text: "Hello Yash, aapki reports mujhe mil gayi hain.", sender: "doctor", time: "10:30 AM" },
  { id: 2, text: "Sab theek hai na sir?", sender: "patient", time: "10:32 AM" },
  { id: 3, text: "Haan, thodi weakness hai. Main kuch medicines likh raha hu.", sender: "doctor", time: "10:35 AM" },
  { id: 4, text: "Sir, mera appointment kal ka hai? Time kya rahega?", sender: "patient", time: "10:40 AM" },
];

export default function ProfessionalChat() {
  const [activeChat, setActiveChat] = useState(chatList[0]);
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when new message arrives
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Sending Message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsgObj = {
      id: Date.now(),
      text: newMessage,
      sender: "doctor",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsgObj]);
    setNewMessage("");

    // Simulate Patient Reply after 1.5 seconds
    setTimeout(() => {
      const replyObj = {
        id: Date.now() + 1,
        text: "Okay sir, main wait karunga.",
        sender: "patient",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, replyObj]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-8 flex justify-center items-center">
      
      {/* Main Chat Container */}
      <div className="w-full max-w-6xl h-[85vh] bg-white rounded-2xl shadow-sm border border-gray-200 flex overflow-hidden">
        
        {/* ========================================= */}
        {/* LEFT SIDEBAR: PATIENT LIST                */}
        {/* ========================================= */}
        <div className={`w-full md:w-1/3 lg:w-1/4 flex-col border-r border-gray-200 bg-white ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white z-10">
            <h2 className="text-xl font-bold text-gray-800 tracking-wide">My Chats</h2>
            <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm">
              Dr
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-3 bg-gray-50">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search patient or ID..." 
                className="w-full bg-white pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-0 text-sm transition-all"
              />
              <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto">
            {chatList.map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => setActiveChat(chat)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-all flex items-start gap-3 hover:bg-gray-50 
                  ${activeChat?.id === chat.id ? 'bg-emerald-50/40 border-l-4 border-l-emerald-500' : 'border-l-4 border-l-transparent'}
                `}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                  {chat.avatar}
                </div>
                
                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-gray-800 truncate">{chat.patient}</h3>
                    <span className="text-[11px] text-gray-400 shrink-0">{chat.date}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                </div>

                {/* Unread Badge */}
                {chat.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-6 shadow-sm">
                    {chat.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ========================================= */}
        {/* RIGHT SIDE: CHAT WINDOW                   */}
        {/* ========================================= */}
        <div className={`w-full md:w-2/3 lg:w-3/4 flex-col bg-[#f8fafc] relative ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
          
          {activeChat ? (
            <>
              {/* --- Chat Header --- */}
              <div className="h-[72px] px-4 md:px-6 flex items-center justify-between bg-white border-b border-gray-200 z-10">
                <div className="flex items-center gap-4">
                  {/* Mobile Back Button */}
                  <button 
                    className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full"
                    onClick={() => setActiveChat(null)}
                  >
                    <ArrowLeft size={20} />
                  </button>
                  
                  {/* Active Patient Info */}
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    {activeChat.avatar}
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800">{activeChat.patient}</h2>
                    <p className="text-xs text-emerald-600 font-medium">Appt ID: {activeChat.id}</p>
                  </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-1 sm:gap-3">
                  <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors hidden sm:block">
                    <Phone size={18} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              {/* --- Chat Messages Area --- */}
              <div 
                className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4" 
                style={{ backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)", backgroundSize: "24px 24px" }}
              >
                {/* Date Badge */}
                <div className="flex justify-center mb-6">
                  <span className="bg-white border border-gray-200 text-gray-500 text-xs px-4 py-1.5 rounded-full shadow-sm">
                    Today
                  </span>
                </div>

                {/* Messages Mapping */}
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] md:max-w-[65%] flex flex-col relative group px-4 py-2.5 shadow-sm 
                      ${msg.sender === 'doctor' 
                        ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-sm' 
                        : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm' 
                      }`}
                    >
                      <p className="text-[15px] leading-relaxed break-words">{msg.text}</p>
                      
                      {/* Clean Timestamp (No double lines/ticks) */}
                      <div className={`flex justify-end mt-1 
                        ${msg.sender === 'doctor' ? 'text-emerald-100' : 'text-gray-400'}
                      `}>
                        <span className="text-[10px] font-medium">{msg.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* --- Message Input Area --- */}
              <div className="p-3 md:p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                  <button type="button" className="p-3 text-gray-400 hover:text-gray-600 transition-colors shrink-0 mb-0.5">
                    <Paperclip size={20} />
                  </button>
                  
                  {/* Input field optimized to not show any default blue outline */}
                  <textarea 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Type a message..." 
                    className="flex-1 bg-gray-100 border border-transparent rounded-2xl px-4 py-3.5 max-h-32 min-h-[50px] focus:bg-white focus:outline-none focus:ring-0 focus:border-emerald-500 text-gray-800 resize-none overflow-y-auto transition-colors"
                    rows="1"
                  />
                  
                  <button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    className={`p-3.5 rounded-full flex items-center justify-center transition-all shrink-0 mb-0.5
                      ${newMessage.trim() ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md hover:-translate-y-0.5' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                    `}
                  >
                    <Send size={20} className={newMessage.trim() ? "ml-0.5" : ""} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            // Empty State (When no chat is selected)
            <div className="flex-1 flex flex-col items-center justify-center bg-[#f8fafc] hidden md:flex">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-5">
                <Send size={40} className="text-emerald-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Your Messages</h3>
              <p className="text-gray-500 mt-2">Select a patient from the left to start chatting.</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}