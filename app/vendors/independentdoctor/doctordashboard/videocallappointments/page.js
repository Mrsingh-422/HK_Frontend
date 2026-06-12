"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaVideo, 
  FaPhoneAlt, 
  FaComment, 
  FaSpinner, 
  FaStethoscope, 
  FaWallet,
  FaPaperPlane
} from 'react-icons/fa';
import { IoCloseOutline } from "react-icons/io5";
import DoctorAPI from '@/app/services/DoctorAPI';
import { toast, Toaster } from 'react-hot-toast';
import { io } from 'socket.io-client';

// Adjust this import path to match your actual folder structure
import VideoCallModal from '../../../../(user)/components/videoCall/VideoCallModal';

// Set the socket URL to match your server configuration (e.g., http://192.168.1.26:5002)
const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL; 

function Page() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Video/Audio Call States
  const [activeCallId, setActiveCallId] = useState(null);
  const [callType, setCallType] = useState('video'); // 'video' or 'audio'
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Chat Modal States
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');
  
  // Refs
  const chatEndRef = useRef(null);
  const socketRef = useRef(null);
  const selectedAppointmentRef = useRef(null);

  // Sync ref with selected appointment state for use within callbacks
  useEffect(() => {
    selectedAppointmentRef.current = selectedAppointment;
  }, [selectedAppointment]);

  // 1. Initialize socket.io connection on mount
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ["polling", "websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("Doctor connected to Chat Socket Server");
    });

    // Listen for incoming messages in real-time
    socketRef.current.on('receive_message', (incomingMsg) => {
      // Append the message only if it belongs to the active appointment chat window
      if (selectedAppointmentRef.current?.appointmentId === incomingMsg.appointmentId) {
        setChatMessages((prev) => {
          const exists = prev.some(msg => (msg._id || msg.id) === (incomingMsg._id || incomingMsg.id));
          if (exists) return prev;
          return [...prev, incomingMsg];
        });
      }
    });

    socketRef.current.on('error_response', (err) => {
      if (err && err.message) {
        toast.error(err.message);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // 2. Room Join and Leave handling matching your server's schema
  useEffect(() => {
    if (!socketRef.current || !selectedAppointment || !isChatModalOpen) return;

    const appointmentId = selectedAppointment.appointmentId;
    
    // Join room using the 'appointmentId' key, identical to user side
    socketRef.current.emit('join_room', { appointmentId });

    return () => {
      // Leave room cleanup if necessary
    };
  }, [isChatModalOpen, selectedAppointment]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatModalOpen]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await DoctorAPI.getVideoCallAppointments();
      
      if (response && response.success) {
        setAppointments(response.data || []);
      } else {
        setError("Failed to retrieve valid appointment data.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err || "An error occurred while fetching appointments.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartCall = async (e, appointment, type) => {
    e.stopPropagation();
    try {
      setSubmitting(true);
      setCallType(type);
      setSelectedAppointment(appointment);

      const payload = {
        appointmentId: appointment.appointmentId,
        callId: appointment.appointmentId,
        callType: type,
        callerName: "Doctor",
        receiverId: appointment.userAccount?._id || appointment.appointmentId, 
      };

      const res = await DoctorAPI.initiateVideoCall(payload);

      if (res && res.success) {
        toast.success(`Calling patient via ${type}...`);
        setActiveCallId(res.callData?.callId || appointment.appointmentId);
        setIsVideoModalOpen(true);
      } else {
        toast.error(res?.message || "Patient is offline or unreachable");
      }
    } catch (error) {
      console.error(`Error starting ${type} call:`, error);
      toast.error(`An error occurred while starting the ${type} call`);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Chat Modal & Fetch previous messages from Database API
  const handleOpenChat = async (e, appointment) => {
    e.stopPropagation();
    setSelectedAppointment(appointment);
    setIsChatModalOpen(true);
    setChatLoading(true);
    setChatMessages([]);

    try {
      const res = await DoctorAPI.getDoctorChatHistory(appointment.appointmentId);
      if (res && res.success) {
        setChatMessages(res.data || []);
      } else {
        toast.error("Could not fetch chat history.");
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      toast.error("Failed to load conversation history.");
    } finally {
      setChatLoading(false);
    }
  };

  // Emit message using the keys expected by the database schema
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedAppointment || !socketRef.current) return;

    if (selectedAppointment.status !== "In-Progress") {
      toast.error("This appointment session is not currently active.");
      return;
    }

    const payload = {
      appointmentId: selectedAppointment.appointmentId,
      senderId: selectedAppointment.doctorId,
      senderType: "Doctor",
      text: newMessageText.trim()
    };

    socketRef.current.emit('send_message', payload);
    setNewMessageText('');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <FaSpinner className="animate-spin text-[#08B36A] mb-4" size={30} />
        <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Fetching video appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-[2rem] border border-gray-100 p-8 text-center max-w-md shadow-sm">
          <p className="text-red-500 font-black text-xs uppercase tracking-widest mb-2">Error Occurred</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button 
            onClick={fetchAppointments}
            className="px-6 py-2.5 bg-[#08B36A] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Block */}
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Video Consultations</h1>
          <p className="text-sm text-gray-500 font-medium">Manage and connect with your remote patients</p>
        </div>

        {/* Responsive Table View */}
        {appointments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No active video consultations found</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Patient Details</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Consultation Reason</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Schedule</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Payment & Status</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Consultation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {appointments.map((appt) => (
                    <tr 
                      key={appt.appointmentId} 
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      {/* Patient Details Column */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img 
                            src={appt.userAccount?.profilePic ? `http://192.168.1.26:5002${appt.userAccount.profilePic}` : '/default-avatar.png'} 
                            alt={appt.patientName} 
                            className="w-12 h-12 rounded-2xl object-cover bg-gray-100 border border-gray-100"
                            onError={(e) => {
                              e.target.src = '/default-avatar.png';
                            }}
                          />
                          <div>
                            <p className="font-black text-gray-900 text-sm uppercase tracking-tight">
                              {appt.patientName}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-black uppercase">
                                {appt.patientGender}
                              </span>
                              <span className="text-[10px] text-gray-400 font-bold">
                                Age: {appt.patientAge}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Consultation Reason Column */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 mb-1">
                          <FaStethoscope className="text-blue-500" />
                          <p className="text-sm font-black text-gray-700 truncate max-w-[200px]">
                            {appt.reasonForVisit}
                          </p>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                          ID: {appt.bookingId}
                        </p>
                      </td>

                      {/* Schedule Column */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-gray-800 font-black text-sm">
                          <FaCalendarAlt className="text-gray-300" size={14} />
                          {formatDate(appt.appointmentDate)}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-gray-400 font-bold text-xs">
                          <FaClock size={12} /> {appt.appointmentTime}
                        </div>
                      </td>

                      {/* Payment & Status Column */}
                      <td className="px-8 py-6">
                        <div className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-1 ${
                          appt.status === 'In-Progress' ? 'bg-green-50 text-[#08B36A]' : 'bg-yellow-50 text-yellow-600'
                        }`}>
                          {appt.status}
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-[#08B36A]">₹{appt.totalAmount}</p>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">(Paid)</span>
                        </div>
                      </td>

                      {/* Multi-Call Actions Column */}
                      <td className="px-8 py-6">
                        <div className="flex justify-center items-center gap-2">
                          {appt.isCallActionEnabled ? (
                            <>
                              {/* Video Call Trigger */}
                              <button
                                disabled={submitting}
                                onClick={(e) => handleStartCall(e, appt, 'video')}
                                title="Start Video Call"
                                className="p-3.5 rounded-2xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all active:scale-90 hover:scale-105"
                              >
                                <FaVideo size={16} />
                              </button>

                              {/* Audio Call Trigger */}
                              <button
                                disabled={submitting}
                                onClick={(e) => handleStartCall(e, appt, 'audio')}
                                title="Start Audio Call"
                                className="p-3.5 rounded-2xl text-green-600 bg-green-50 hover:bg-green-100 transition-all active:scale-90 hover:scale-105"
                              >
                                <FaPhoneAlt size={15} />
                              </button>

                              {/* Messaging Trigger */}
                              <button
                                disabled={submitting}
                                onClick={(e) => handleOpenChat(e, appt)}
                                title="Send Message"
                                className="p-3.5 rounded-2xl text-purple-600 bg-purple-50 hover:bg-purple-100 transition-all active:scale-90 hover:scale-105"
                              >
                                <FaComment size={15} />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-4 py-2.5 bg-gray-50 rounded-xl">
                              Call Disabled
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* CHAT MODAL - Fixed Screen Containment & Elastic Layout */}
      {isChatModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[120] p-0 md:p-4 backdrop-blur-sm">
          {/* Main Card Container */}
          <div className="bg-white w-full h-full md:h-[650px] md:max-h-[85vh] md:max-w-xl flex flex-col overflow-hidden relative md:rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            
            {/* Modal Header (Fixed height) */}
            <div className="p-5 border-b border-gray-100 bg-gray-50/70 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={selectedAppointment.userAccount?.profilePic ? `http://192.168.1.26:5002${selectedAppointment.userAccount.profilePic}` : '/default-avatar.png'} 
                    alt={selectedAppointment.patientName} 
                    className="w-11 h-11 rounded-2xl object-cover bg-gray-100 border border-white shadow-sm"
                  />
                  {selectedAppointment.isCallActionEnabled && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#08B36A] border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900 tracking-tight uppercase">
                    {selectedAppointment.patientName}
                  </h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                    Booking ID: {selectedAppointment.bookingId}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatModalOpen(false)} 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-50 text-gray-400 hover:text-red-500 hover:scale-105 active:scale-95 transition-all"
              >
                <IoCloseOutline size={24} />
              </button>
            </div>

            {/* Chat Body (Scrollable with min-h-0 setting preventing card blowouts) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f8fafc] min-h-0 [&::-webkit-scrollbar]:hidden">
              <div className="flex justify-center mb-2">
                <span className="bg-amber-50 border border-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm text-center">
                  Encrypted Clinical Communication Channel
                </span>
              </div>

              {chatLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <FaSpinner className="animate-spin text-[#08B36A]" size={26} />
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Loading history...</p>
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No previous messages.</p>
                  <p className="text-gray-300 text-[10px] font-medium mt-1">Send a message below to start coordinating care.</p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isDoctor = msg.senderType === 'Doctor';
                  return (
                    <div 
                      key={msg._id || msg.id} 
                      className={`flex ${isDoctor ? 'justify-end' : 'justify-start'} animate-in fade-in-50 duration-200`}
                    >
                      <div className={`max-w-[80%] rounded-[1.5rem] px-4 py-3 shadow-sm ${
                        isDoctor 
                          ? 'bg-[#08B36A] text-white rounded-br-none shadow-green-100/50' 
                          : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                      }`}>
                        <p className="text-sm font-medium leading-relaxed break-words">{msg.text}</p>
                        <p className={`text-[9px] mt-1.5 text-right font-black uppercase tracking-wider ${
                          isDoctor ? 'text-green-100' : 'text-gray-400'
                        }`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Footer (Fixed height) */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder={selectedAppointment.status !== "In-Progress" ? "This consultation session is inactive." : "Type your coordination message..."}
                  disabled={selectedAppointment.status !== "In-Progress"}
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-1 px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm text-gray-700 outline-none focus:bg-white focus:ring-4 focus:ring-green-50 focus:border-[#08B36A] transition-all disabled:bg-gray-100 disabled:cursor-not-allowed shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!newMessageText.trim() || selectedAppointment.status !== "In-Progress"}
                  className="w-12 h-12 shrink-0 bg-[#08B36A] text-white rounded-2xl flex items-center justify-center transition-all hover:bg-green-600 hover:scale-105 active:scale-95 disabled:bg-gray-100 disabled:text-gray-300 disabled:scale-100 shadow-lg shadow-green-100"
                >
                  <FaPaperPlane size={14} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Video/Audio Call WebRTC Modal Container */}
      {isVideoModalOpen && (
        <VideoCallModal
          callId={activeCallId}
          callerName="Doctor"
          role="caller" 
          callType={callType} 
          onClose={() => {
            setIsVideoModalOpen(false);
            setActiveCallId(null);
          }}
        />
      )}
    </div>
  );
}

export default Page;