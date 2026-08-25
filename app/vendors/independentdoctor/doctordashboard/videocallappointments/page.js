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
    FaPaperPlane,
    FaFileMedical,
    FaLock,
    FaCheck
} from 'react-icons/fa';
import { IoCloseOutline } from "react-icons/io5";
import DoctorAPI from '@/app/services/DoctorAPI';
import { toast, Toaster } from 'react-hot-toast';
import { io } from 'socket.io-client';

import VideoCallModal from '../../../../(user)/components/videoCall/VideoCallModal';
import AddPrescriptionModal from './components/AddPrescriptionModal';
import DigitalPrescriptionTemplate from './components/DigitalPrescriptionTemplate';

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239ca3af'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

const getCleanProfilePicUrl = (path) => {
    if (!path) return DEFAULT_AVATAR;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const cleanBaseUrl = SOCKET_URL?.endsWith('/') ? SOCKET_URL.slice(0, -1) : SOCKET_URL;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBaseUrl}${cleanPath}`;
};

function Page() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [activeDoctorId, setActiveDoctorId] = useState(null);
    const [doctorProfile, setDoctorProfile] = useState(null); 

    const [activeCallId, setActiveCallId] = useState(null);
    const [callType, setCallType] = useState('video');
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [newMessageText, setNewMessageText] = useState('');

    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
    const [isPreviewTemplateOpen, setIsPreviewTemplateOpen] = useState(false);
    const [completedPrescriptionData, setCompletedPrescriptionData] = useState(null);

    // Call End Verification Handshake States
    const [isCallEndOtpModalOpen, setIsCallEndOtpModalOpen] = useState(false);
    const [callEndOtpCode, setCallEndOtpCode] = useState('');
    const [callEndOtpLoading, setCallEndOtpLoading] = useState(false);
    const [callEndDevOtp, setCallEndDevOtp] = useState('');

    const chatEndRef = useRef(null);
    const socketRef = useRef(null);
    const selectedAppointmentRef = useRef(null);

    useEffect(() => {
        selectedAppointmentRef.current = selectedAppointment;
    }, [selectedAppointment]);

    const getDoctorIdFromToken = () => {
        if (typeof window === 'undefined') return null;
        const token = localStorage.getItem('doctorToken');
        if (!token) return null;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload).id;
        } catch (e) {
            return null;
        }
    };

    useEffect(() => {
        const resolveDoctorProfile = async () => {
            let id = getDoctorIdFromToken();
            if (id) {
                setActiveDoctorId(id);
            }
            try {
                if (DoctorAPI.getProfile) {
                    const res = await DoctorAPI.getProfile();
                    if (res?.success && res?.data) {
                        setDoctorProfile(res.data); 
                        if (!id) {
                            setActiveDoctorId(res.data._id || res.data.id);
                        }
                    }
                }
            } catch (err) {
                console.error("Unable to resolve dynamic doctor ID:", err);
            }
        };
        resolveDoctorProfile();
    }, []);

    useEffect(() => {
        socketRef.current = io(SOCKET_URL, { transports: ["polling", "websocket"] });
        socketRef.current.on('receive_message', (incomingMsg) => {
            if (selectedAppointmentRef.current?.appointmentId === incomingMsg.appointmentId) {
                setChatMessages((prev) => {
                    if (prev.some(msg => (msg._id || msg.id) === (incomingMsg._id || incomingMsg.id))) return prev;
                    return [...prev, incomingMsg];
                });
            }
        });
        return () => socketRef.current && socketRef.current.disconnect();
    }, []);

    useEffect(() => {
        if (!socketRef.current || !selectedAppointment || !isChatModalOpen) return;
        socketRef.current.emit('join_room', { appointmentId: selectedAppointment.appointmentId });
    }, [isChatModalOpen, selectedAppointment]);

    useEffect(() => {
        fetchAppointments();
    }, []);

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
            setError("An error occurred while fetching appointments.");
        } finally {
            setLoading(false);
        }
    };

    const handleStartCall = async (e, appointment, type) => {
        if (e) e.stopPropagation();
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
                toast.error(res?.message || "Patient unreachable");
            }
        } catch (error) {
            toast.error("An error occurred while starting call");
        } finally {
            setSubmitting(false);
        }
    };

    // 1. Instantly Open Handshake Modal & Trigger OTP Dispatch in Background
    const handleInitiateCallEndHandshake = () => {
        if (!selectedAppointment) return;
        setIsCallEndOtpModalOpen(true);
        setCallEndOtpLoading(true);
        sendOtpForCallEnd();
    };

    const sendOtpForCallEnd = async () => {
        try {
            const apptId = selectedAppointment._id || selectedAppointment.appointmentId;
            console.log("Requesting termination OTP for Booking ID:", selectedAppointment.bookingId);
            
            const res = await DoctorAPI.sendCompletionOtp(apptId);
            if (res && res.success) {
                toast.success(res.message || "Termination OTP successfully sent to patient.");
                if (res.dev_otp) {
                    setCallEndDevOtp(res.dev_otp);
                }
            } else {
                toast.error(res?.message || "Could not request completion token.");
            }
        } catch (err) {
            console.error("End call handshake trigger error:", err);
            toast.error("Error initiating dynamic termination handshake.");
        } finally {
            setCallEndOtpLoading(false);
        }
    };

    // 2. Verify Handshake OTP to Complete Handoff & End Active Call
    const handleVerifyCallEndOtp = async () => {
        if (!callEndOtpCode.trim()) return toast.error("Please enter dynamic 4-digit OTP code");
        try {
            setCallEndOtpLoading(true);
            const apptId = selectedAppointment?._id || selectedAppointment?.appointmentId;
            console.log(`Verifying Call End OTP [${callEndOtpCode.trim()}] for Appointment ID:`, apptId);
            
            const res = await DoctorAPI.verifyCompletionOtp(apptId, callEndOtpCode.trim());
            if (res && res.success) {
                toast.success("Verification successful. Hanging up...");
                setIsVideoModalOpen(false);
                setActiveCallId(null);
                setIsCallEndOtpModalOpen(false);
                setCallEndOtpCode('');
                setCallEndDevOtp('');

                // Append handshake verification flags to active appointment state
                setSelectedAppointment(prev => ({
                    ...prev,
                    isOtpVerified: true,
                    otpVerified: true
                }));

                // Update matching item in master appointments state list to unlock table row button
                setAppointments(prevAppts => 
                    prevAppts.map(appt => 
                        appt.appointmentId === apptId
                            ? { ...appt, isOtpVerified: true, otpVerified: true }
                            : appt
                    )
                );

                // Auto-launch Prescription Form Modal immediately
                setIsPrescriptionModalOpen(true);
            } else {
                toast.error(res?.message || "Invalid call-end handshake OTP.");
            }
        } catch (err) {
            console.error("End call OTP verification error:", err);
            toast.error("Failed to verify call termination token.");
        } finally {
            setCallEndOtpLoading(false);
        }
    };

    const handleCancelCallEnd = () => {
        setIsCallEndOtpModalOpen(false);
        setCallEndOtpCode('');
        setCallEndDevOtp('');
        toast.error("Handshake cancelled. Call session resumed.");
    };

    const handleOpenChat = async (e, appointment) => {
        e.stopPropagation();
        setSelectedAppointment(appointment);
        setIsChatModalOpen(true);
        setChatLoading(true);
        setChatMessages([]);
        try {
            const res = await DoctorAPI.getDoctorChatHistory(appointment.appointmentId);
            if (res && res.success) setChatMessages(res.data || []);
        } catch (error) {
            toast.error("Failed to load conversation history.");
        } finally {
            setChatLoading(false);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessageText.trim() || !selectedAppointment || !socketRef.current) return;
        const verifiedDoctorId = activeDoctorId || selectedAppointment.doctorId;
        const payload = {
            appointmentId: selectedAppointment.appointmentId,
            senderId: verifiedDoctorId,
            senderType: "Doctor",
            text: newMessageText.trim()
        };
        socketRef.current.emit('send_message', payload);
        setNewMessageText('');
    };

    const handlePrescriptionSuccess = (stagedPayload) => {
        setIsPrescriptionModalOpen(false);

        const resolvedUserId = 
            stagedPayload.userId || 
            stagedPayload.patientId || 
            selectedAppointment?.patientId || 
            selectedAppointment?.userAccount?._id || 
            "";

        const formattedPreviewPayload = {
            appointmentId: selectedAppointment?.appointmentId,
            patientId: resolvedUserId,
            userId: resolvedUserId,
            patientInfo: {
                name: selectedAppointment?.patientName || "N/A",
                age: selectedAppointment?.patientAge || "N/A",
                gender: selectedAppointment?.patientGender || "N/A",
                phone: selectedAppointment?.userAccount?.phone || "N/A"
            },
            clinicalDetails: {
                diagnosis: stagedPayload.diagnosis || [],
                medicines: stagedPayload.medicines || [],
                symptoms: stagedPayload.additionalNotes || "",
                chiefComplaints: stagedPayload.chiefComplaints || ""
            },
            deliveryInfo: {
                sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: "Awaiting Signature"
            },
            doctorInfo: {
                name: doctorProfile?.name || "Doctor",
                qualification: doctorProfile?.qualification || "",
                speciality: doctorProfile?.speciality || "Practitioner",
                licenseNumber: doctorProfile?.licenseNumber || "",
                experienceYears: doctorProfile?.experienceYears || "",
                profileImage: doctorProfile?.profileImage || ""
            },
            chiefComplaints: stagedPayload.chiefComplaints || "",
            advisedInvestigations: stagedPayload.advisedInvestigations || "",
            adviceGiven: stagedPayload.adviceGiven || "",
            specialInstructions: stagedPayload.specialInstructions || "",
            nextAppointment: stagedPayload.nextAppointment || "",
            // Preserve Vitals in the preview state payload
            vitals: {
                bp: stagedPayload.bp || "",
                pulse: stagedPayload.pulse || "",
                temp: stagedPayload.temp || "",
                spo2: stagedPayload.spo2 || ""
            },
            bp: stagedPayload.bp || "",
            pulse: stagedPayload.pulse || "",
            temp: stagedPayload.temp || "",
            spo2: stagedPayload.spo2 || ""
        };

        setCompletedPrescriptionData(formattedPreviewPayload);
        setIsPreviewTemplateOpen(true);
    };

    const handleCompleteCase = async (appointmentId, prescriptionPayload) => {
        try {
            const response = await DoctorAPI.completeAppointment(appointmentId, prescriptionPayload);
            if (response && response.success) {
                toast.success("Consultation session finalized and marked Completed.");
                setIsPreviewTemplateOpen(false);
                setCompletedPrescriptionData(null);
                fetchAppointments(); 
            } else {
                toast.error(response?.message || "Failed to finalize consultation.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred during finalization.");
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString('en-IN', {
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

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
            <Toaster position="top-right" />

            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Video Consultations</h1>
                    <p className="text-sm text-gray-500 font-medium">Manage and connect with your remote patients</p>
                </div>

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
                                        <tr key={appt.appointmentId} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={getCleanProfilePicUrl(appt.userAccount?.profilePic)}
                                                        alt={appt.patientName}
                                                        className="w-12 h-12 rounded-2xl object-cover bg-gray-100 border border-gray-100"
                                                        onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                                                    />
                                                    <div>
                                                        <p className="font-black text-gray-900 text-sm uppercase tracking-tight">{appt.patientName}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-black uppercase">{appt.patientGender}</span>
                                                            <span className="text-[10px] text-gray-400 font-bold">Age: {appt.patientAge}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <FaStethoscope className="text-blue-500" />
                                                    <p className="text-sm font-black text-gray-700 truncate max-w-[200px]">{appt.reasonForVisit}</p>
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">ID: {appt.bookingId}</p>
                                            </td>

                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-gray-800 font-black text-sm">
                                                    <FaCalendarAlt className="text-gray-300" size={14} />
                                                    {formatDate(appt.appointmentDate)}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1 text-gray-400 font-bold text-xs">
                                                    <FaClock size={12} /> {appt.appointmentTime}
                                                </div>
                                            </td>

                                            <td className="px-8 py-6">
                                                <div className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-1 ${appt.status === 'In-Progress' ? 'bg-green-50 text-[#08B36A]' : 'bg-yellow-50 text-yellow-600'}`}>
                                                    {appt.status}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-black text-[#08B36A]">₹{appt.totalAmount}</p>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase">(Paid)</span>
                                                </div>
                                            </td>

                                            <td className="px-8 py-6">
                                                <div className="flex justify-center items-center gap-2">
                                                    {appt.isCallActionEnabled ? (
                                                        <>
                                                            <button disabled={submitting} onClick={(e) => handleStartCall(e, appt, 'video')} className="p-3.5 rounded-2xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all active:scale-90 hover:scale-105">
                                                                <FaVideo size={16} />
                                                            </button>
                                                            <button disabled={submitting} onClick={(e) => handleStartCall(e, appt, 'audio')} className="p-3.5 rounded-2xl text-green-600 bg-green-50 hover:bg-green-100 transition-all active:scale-90 hover:scale-105">
                                                                <FaPhoneAlt size={15} />
                                                            </button>
                                                            <button disabled={submitting} onClick={(e) => handleOpenChat(e, appt)} className="p-3.5 rounded-2xl text-purple-600 bg-purple-50 hover:bg-purple-100 transition-all active:scale-90 hover:scale-105">
                                                                <FaComment size={15} />
                                                            </button>
                                                            
                                                            {/* Prescription Button: Strictly visible only if call-completion OTP has been successfully verified */}
                                                            {appt.status === "In-Progress" && (appt.isOtpVerified || appt.otpVerified) && (
                                                                <button
                                                                    disabled={submitting}
                                                                    onClick={() => {
                                                                        setSelectedAppointment(appt);
                                                                        setIsPrescriptionModalOpen(true);
                                                                    }}
                                                                    title="Build Clinical Prescription"
                                                                    className="p-3.5 rounded-2xl text-[#08B36A] bg-green-50 hover:bg-green-100 transition-all active:scale-90 hover:scale-105"
                                                                >
                                                                    <FaFileMedical size={15} />
                                                                </button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-4 py-2.5 bg-gray-50 rounded-xl">Call Disabled</span>
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

            {/* CHAT MODAL WINDOW */}
            {isChatModalOpen && selectedAppointment && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[120] p-0 md:p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full h-full md:h-[650px] md:max-h-[85vh] md:max-w-xl flex flex-col overflow-hidden relative md:rounded-[2.5rem] shadow-2xl">
                        <div className="p-5 border-b border-gray-100 bg-gray-50/70 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <img
                                    src={getCleanProfilePicUrl(selectedAppointment.userAccount?.profilePic)}
                                    alt={selectedAppointment.patientName}
                                    className="w-11 h-11 rounded-2xl object-cover bg-gray-100"
                                    onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                                />
                                <div>
                                    <h2 className="text-base font-black text-gray-900 tracking-tight uppercase">{selectedAppointment.patientName}</h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Booking ID: {selectedAppointment.bookingId}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {/* End Chat Button triggering the call end OTP Handshake */}
                                <button 
                                    onClick={() => {
                                        setIsChatModalOpen(false);
                                        handleInitiateCallEndHandshake();
                                    }}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-sm shrink-0"
                                >
                                    End Chat
                                </button>
                                <button onClick={() => setIsChatModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-50 text-slate-400 hover:text-red-500 transition-colors">
                                    <IoCloseOutline size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f8fafc]">
                            {chatLoading ? (
                                <div className="flex flex-col items-center justify-center h-full gap-2">
                                    <FaSpinner className="animate-spin text-[#08B36A]" size={26} />
                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Loading history...</p>
                                </div>
                            ) : chatMessages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No previous messages.</p>
                                </div>
                            ) : (
                                chatMessages.map((msg, index) => {
                                    const isDoctor = msg.senderType === 'Doctor';
                                    return (
                                        <div key={msg._id || msg.id || `msg-${index}`} className={`flex ${isDoctor ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] rounded-[1.5rem] px-4 py-3 shadow-sm ${isDoctor ? 'bg-[#08B36A] text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'}`}>
                                                <p className="text-sm font-medium leading-relaxed break-words">{msg.text}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                            <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
                                <input
                                    type="text"
                                    placeholder="Type your coordination message..."
                                    value={newMessageText}
                                    onChange={(e) => setNewMessageText(e.target.value)}
                                    className="flex-1 px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm text-gray-700 outline-none focus:bg-white"
                                />
                                <button type="submit" disabled={!newMessageText.trim()} className="w-12 h-12 bg-[#08B36A] text-white rounded-2xl flex items-center justify-center hover:bg-green-600 transition-colors">
                                    <FaPaperPlane size={14} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <AddPrescriptionModal
                isOpen={isPrescriptionModalOpen}
                onClose={() => setIsPrescriptionModalOpen(false)}
                appointment={selectedAppointment}
                onSuccess={handlePrescriptionSuccess}
            />

            <DigitalPrescriptionTemplate
                isOpen={isPreviewTemplateOpen}
                onClose={() => {
                    setIsPreviewTemplateOpen(false);
                    setCompletedPrescriptionData(null);
                }}
                data={completedPrescriptionData}
                onCompleteCase={handleCompleteCase}
            />

            {/* INTERACTIVE CALL CLOSURE OTP HANDSHAKE OVERLAY DIALOG */}
            {isCallEndOtpModalOpen && selectedAppointment && (
                <div className="fixed inset-0 bg-slate-955/60 backdrop-blur-sm flex items-center justify-center z-[260] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border border-slate-100 space-y-6">
                        <div className="text-center space-y-2">
                            <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto">
                                <FaLock size={20} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Handshake Authentication</h3>
                            <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                                Enter the dynamic 4-digit code shared by the patient to authorize call termination and complete the consultation.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                maxLength={4}
                                placeholder="Enter 4-Digit OTP"
                                value={callEndOtpCode}
                                onChange={(e) => setCallEndOtpCode(e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-lg text-slate-800 tracking-widest text-center outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-50 transition-all"
                            />
                            {callEndDevOtp && (
                                <p className="text-center text-[10px] text-slate-400 font-extrabold uppercase">
                                    Sandbox Bypass Code: <span className="text-[#08B36A] tracking-widest">{callEndDevOtp}</span>
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleCancelCallEnd}
                                className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                            >
                                Resume Call
                            </button>
                            <button
                                type="button"
                                disabled={callEndOtpLoading}
                                onClick={handleVerifyCallEndOtp}
                                className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-100 flex items-center justify-center gap-2"
                            >
                                {callEndOtpLoading ? <FaSpinner className="animate-spin" size={12} /> : <FaCheck />}
                                Verify & End
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* VIDEO CALL MODAL WITH OVERLAY ACTION CONTROLLERS */}
            {isVideoModalOpen && (
                <div className="fixed inset-0 z-[200]">
                    <VideoCallModal
                        callId={activeCallId}
                        callerName="Doctor"
                        role="caller"
                        callType={callType}
                        onClose={handleInitiateCallEndHandshake}
                    />
                    
                    {/* Floating Controls Overlay over the Call Interface */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[210] flex gap-4 bg-slate-900/90 px-6 py-3.5 rounded-full shadow-2xl border border-slate-700/50 backdrop-blur-md">
                        {/* Open Live Chat Button */}
                        <button 
                            onClick={(e) => handleOpenChat(e, selectedAppointment)}
                            className="flex items-center justify-center w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-all active:scale-90 hover:scale-105 shadow-lg"
                            title="Open Chat Session"
                        >
                            <FaComment size={18} />
                        </button>
                        
                        {/* Switch Call Type / Redial Button */}
                        <button 
                            onClick={(e) => handleStartCall(e, selectedAppointment, callType === 'video' ? 'audio' : 'video')}
                            className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all active:scale-90 hover:scale-105 shadow-lg"
                            title={`Switch to ${callType === 'video' ? 'Audio Call' : 'Video Call'}`}
                        >
                            {callType === 'video' ? <FaPhoneAlt size={16} /> : <FaVideo size={16} />}
                        </button>

                        {/* End Call Button Overlaid */}
                        <button 
                            onClick={handleInitiateCallEndHandshake}
                            className="flex items-center justify-center w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all active:scale-90 hover:scale-105 shadow-lg"
                            title="End Call & Verify OTP"
                        >
                            <FaPhoneAlt size={16} className="rotate-[135deg]" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Page;