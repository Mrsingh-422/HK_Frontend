"use client";
import React, { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";

// Icons
import {
  FiSearch, FiSend, FiPaperclip, FiArrowLeft,
  FiMoreVertical, FiCheckCircle, FiPhone, FiVideo, FiHome,
} from "react-icons/fi";
import { MdVerified, MdOutlineMedicalServices } from "react-icons/md";
import UserAPI from "@/app/services/UserAPI";

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [chatError, setChatError] = useState(null);

  const socketRef = useRef(null);
  const scrollRef = useRef(null);
  const selectedChatIdRef = useRef(null);

  // Sync ref with state to allow clean access in socket listeners
  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  // Derived State
  const selectedChat = chats.find(c => c.id === selectedChatId);
  const filteredChats = chats.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // 1. Fetch consultations/appointments on mount
  useEffect(() => {
    async function loadAppointments() {
      try {
        setIsLoading(true);
        const res = await UserAPI.getVideoCallAppointmentsUser();
        if (res && res.success && Array.isArray(res.data)) {
          const formatted = res.data.map((app) => ({
            id: app.appointmentId,
            bookingId: app.bookingId,
            name: app.doctorDetails?.name || "Doctor",
            role: app.doctorDetails?.speciality || "General Practitioner",
            online: app.isCallActionEnabled,
            status: app.status, // "In-Progress", "Completed", etc.
            unreadCount: 0,
            image: app.doctorDetails?.profileImage
              ? `http://localhost:5002/${app.doctorDetails.profileImage}`
              : "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&w=200&q=80",
            messages: []
          }));
          setChats(formatted);
        }
      } catch (err) {
        console.error("Error loading chat conversations:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAppointments();
  }, []);

  // 2. Setup Socket Connection & Global Event Listeners
  useEffect(() => {
    const socketUrl = "http://192.168.1.26:5002"; // Or "http://192.168.1.26:5002"
    const socket = io(socketUrl, {
      // Remove transports: ["websocket"] to let it use both polling and websocket
      transports: ["polling", "websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to Chat Socket Server");
    });

    socket.on("receive_message", (incomingMsg) => {
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id === incomingMsg.appointmentId) {
            // Check for duplicate to avoid rendering issues
            const exists = chat.messages.some((m) => m._id === incomingMsg._id);
            if (exists) return chat;

            const isCurrentChat = selectedChatIdRef.current === chat.id;
            return {
              ...chat,
              messages: [...chat.messages, incomingMsg],
              unreadCount: isCurrentChat ? 0 : chat.unreadCount + 1
            };
          }
          return chat;
        })
      );
    });

    socket.on("error_response", (error) => {
      if (error && error.message) {
        setChatError(error.message);
      }
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // 3. Handle conversation selection: join room & fetch history
  useEffect(() => {
    if (!selectedChatId) return;

    setChatError(null);

    // Fetch conversation history via HTTP
    async function loadHistory() {
      try {
        const res = await UserAPI.getUserChatHistory(selectedChatId);
        if (res && res.success && Array.isArray(res.data)) {
          setChats((prevChats) =>
            prevChats.map((chat) =>
              chat.id === selectedChatId
                ? { ...chat, messages: res.data, unreadCount: 0 }
                : chat
            )
          );
        }
      } catch (err) {
        console.error("Error fetching message history:", err);
      }
    }

    loadHistory();

    // Notify server to join the relevant channel
    if (socketRef.current) {
      socketRef.current.emit("join_room", { appointmentId: selectedChatId });
    }
  }, [selectedChatId]);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedChat?.messages]);

  // Helper to format ISO strings nicely
  const formatTime = (isoString) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  // 4. Send Message Handler
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChatId || !socketRef.current) return;

    // Client-side status check to avoid sending expired messages
    if (selectedChat?.status !== "In-Progress") {
      setChatError("This appointment session is not currently active.");
      return;
    }

    const payload = {
      appointmentId: selectedChatId,
      senderId: "65d3cc4e80f1a612c0335790", // Replace with your active User's authenticated ID
      senderType: "User",
      text: newMessage.trim()
    };

    socketRef.current.emit("send_message", payload);
    setNewMessage("");
  };

  // Check if text input should be locked
  const isChatExpired = selectedChat?.status !== "In-Progress";

  return (
    <div className="fixed inset-0 z-50 bg-white flex overflow-hidden font-sans">

      {/* --- LEFT PANE: CONVERSATION LIST --- */}
      <div className={`${selectedChatId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[380px] lg:w-[420px] h-full border-r border-gray-100 bg-[#fcfcfc] shrink-0`}>

        {/* Top Header */}
        <div className="p-6 pb-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#08b36a] transition-colors mb-6"
          >
            <FiHome size={14} /> Back to Dashboard
          </button>

          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-6">Consultations</h1>

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

        {/* Conversations Inner Container */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-1">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Loading inbox...</span>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No consultations found.
            </div>
          ) : (
            filteredChats.map((chat) => {
              const lastMsg = chat.messages[chat.messages.length - 1];
              const isSelected = selectedChatId === chat.id;

              return (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={`flex items-center gap-4 p-4 rounded-[24px] cursor-pointer transition-all ${isSelected
                    ? "bg-[#08b36a] text-white shadow-xl shadow-green-100 scale-[1.02]"
                    : "bg-white hover:bg-gray-50 border border-transparent hover:border-gray-100"
                    }`}
                >
                  <div className="relative shrink-0">
                    <img src={chat.image} className="w-14 h-14 rounded-2xl object-cover border-2 border-white" alt="" />
                    {chat.online && (
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 rounded-full ${isSelected ? 'bg-green-300 border-[#08b36a]' : 'bg-[#08b36a] border-white'}`} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h3 className={`font-black text-sm truncate flex items-center gap-1.5 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                        {chat.name}
                        <MdVerified className={isSelected ? "text-white" : "text-blue-500"} size={14} />
                      </h3>
                      <span className={`text-[9px] font-black uppercase whitespace-nowrap ${isSelected ? 'text-green-100' : 'text-gray-400'}`}>
                        {lastMsg ? formatTime(lastMsg.createdAt) : ""}
                      </span>
                    </div>
                    <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isSelected ? 'text-green-200' : 'text-[#08b36a]'}`}>
                      {chat.role}
                    </p>
                    <p className={`text-xs truncate font-medium ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>
                      {lastMsg ? (lastMsg.senderType === "User" ? "You: " : "") + lastMsg.text : "No messages yet"}
                    </p>
                  </div>

                  {chat.unreadCount > 0 && !isSelected && (
                    <div className="w-6 h-6 bg-[#08b36a] text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-md">
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* --- RIGHT PANE: ACTIVE CHAT VIEWPORT --- */}
      <div className={`${!selectedChatId ? 'hidden md:flex' : 'flex'} flex-col flex-1 h-full bg-[#f4f7f6] relative`}>

        {selectedChat ? (
          <>
            {/* Header section */}
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
                    {selectedChat.status === "In-Progress" && <span className="w-1.5 h-1.5 bg-[#08b36a] rounded-full animate-pulse"></span>}
                    {selectedChat.status === "In-Progress" ? "Active Consult" : `Status: ${selectedChat.status}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 md:gap-4">
                <button className="p-3 bg-green-50 text-[#08b36a] rounded-full hover:bg-[#08b36a] hover:text-white transition-all"><FiPhone size={18} /></button>
                <button className="p-3 bg-green-50 text-[#08b36a] rounded-full hover:bg-[#08b36a] hover:text-white transition-all hidden sm:block"><FiVideo size={18} /></button>
                <button className="p-3 text-gray-400 hover:text-gray-900 transition-colors"><FiMoreVertical size={20} /></button>
              </div>
            </div>

            {/* Messages Display Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 [&::-webkit-scrollbar]:hidden">

              <div className="flex justify-center mb-4">
                <span className="bg-yellow-50 border border-yellow-100 text-yellow-700 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-sm text-center">
                  Encrypted Health Communication Channel
                </span>
              </div>

              {chatError && (
                <div className="flex justify-center sticky top-0 z-20">
                  <span className="bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold px-4 py-2.5 rounded-xl shadow-md text-center">
                    ⚠️ {chatError}
                  </span>
                </div>
              )}

              {selectedChat.messages.length === 0 ? (
                <div className="text-center text-gray-400 text-xs py-12">
                  No historical messages to display. Write a message below to start chatting.
                </div>
              ) : (
                selectedChat.messages.map((msg) => {
                  const isMe = msg.senderType === "User";
                  return (
                    <div key={msg._id || msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}>
                      <div className={`max-w-[85%] md:max-w-[70%] p-4 shadow-sm ${isMe
                        ? "bg-[#08b36a] text-white rounded-[24px] rounded-br-sm shadow-green-100"
                        : "bg-white text-gray-800 rounded-[24px] rounded-bl-sm border border-gray-100"
                        }`}>
                        <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                        <div className={`flex items-center gap-1 mt-2 text-[9px] font-black uppercase tracking-wider ${isMe ? "text-green-100 justify-end" : "text-gray-400"}`}>
                          {formatTime(msg.createdAt)} {isMe && <FiCheckCircle size={12} />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Form Bar */}
            <div className="p-4 md:p-6 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3 max-w-4xl mx-auto">
                <button
                  type="button"
                  disabled={isChatExpired}
                  className="p-3.5 bg-gray-50 text-gray-400 hover:text-[#08b36a] rounded-full transition-colors disabled:opacity-50 disabled:hover:text-gray-400"
                >
                  <FiPaperclip size={20} />
                </button>
                <input
                  type="text"
                  disabled={isChatExpired}
                  placeholder={isChatExpired ? "This session has completed or expired." : "Type your medical query here..."}
                  className="flex-1 py-4 px-6 bg-gray-50 border border-gray-100 rounded-full outline-none font-bold text-sm focus:bg-white focus:ring-2 ring-[#08b36a]/20 transition-all shadow-inner disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isChatExpired}
                  className="w-14 h-14 bg-[#08b36a] text-white rounded-full flex items-center justify-center shadow-lg shadow-green-200 hover:bg-[#068a52] hover:scale-105 transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:scale-100"
                >
                  <FiSend size={20} className="ml-1" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50/50">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl shadow-green-50 mb-6">
              <MdOutlineMedicalServices className="text-[#08b36a]" size={48} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Medical Communications</h2>
            <p className="text-gray-500 font-medium max-w-sm">
              Please choose a current appointment from the left sidebar to access the medical chat room.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 