'use client'
import React, { useState, useEffect, useRef } from 'react'
import {
    FaCalendarAlt, FaHome, FaClock,
    FaVideo, FaHospital, FaCheck, FaTimes, FaUndo, FaSpinner, FaInfoCircle, FaUser,
    FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaWallet, FaStethoscope, FaExclamationTriangle,
    FaExchangeAlt, FaMoneyBillWave, FaComment, FaPaperPlane
} from 'react-icons/fa'
import { IoCloseOutline } from "react-icons/io5";
import DoctorAPI from '@/app/services/DoctorAPI';
import { toast, Toaster } from 'react-hot-toast';
import { io } from 'socket.io-client';
import VideoCallModal from '../../../../(user)/components/videoCall/VideoCallModal';

// Interactive E-Prescription Components
import AddPrescriptionModal from '../videocallappointments/components/AddPrescriptionModal';
import DigitalPrescriptionTemplate from '../videocallappointments/components/DigitalPrescriptionTemplate';

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239ca3af'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState(''); // Empty means 'All'
    const [filterConsultationType, setFilterConsultationType] = useState(''); // Empty means 'All'
    const [searchQuery, setSearchQuery] = useState(''); // Search query state
    const [doctorProfile, setDoctorProfile] = useState(null); // Local doctor profile state

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // Modal States
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false); // Cancel Modal State
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const [rescheduleData, setRescheduleData] = useState({ date: '', time: '', reason: '' });
    const [cancelData, setCancelData] = useState({ reason: 'Doctor has emergency shift', isPermanent: false });
    const [submitting, setSubmitting] = useState(false);

    const [activeCallId, setActiveCallId] = useState(null);
    const [activeCallType, setActiveCallType] = useState('video');
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    // Chat Integration States
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [newMessageText, setNewMessageText] = useState('');

    // Prescription & Live Preview States
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
    const [isPreviewTemplateOpen, setIsPreviewTemplateOpen] = useState(false);
    const [completedPrescriptionData, setCompletedPrescriptionData] = useState(null);

    const socketRef = useRef(null);
    const chatEndRef = useRef(null);
    const selectedAppointmentRef = useRef(null);

    useEffect(() => {
        selectedAppointmentRef.current = selectedAppointment;
    }, [selectedAppointment]);

    // Socket Connection Setup
    useEffect(() => {
        socketRef.current = io(SOCKET_URL, { transports: ["polling", "websocket"] });
        socketRef.current.on('receive_message', (incomingMsg) => {
            const currentApptId = selectedAppointmentRef.current?._id || selectedAppointmentRef.current?.appointmentId;
            if (currentApptId === incomingMsg.appointmentId) {
                setChatMessages((prev) => {
                    if (prev.some(msg => (msg._id || msg.id) === (incomingMsg._id || incomingMsg.id))) return prev;
                    return [...prev, incomingMsg];
                });
            }
        });
        return () => socketRef.current && socketRef.current.disconnect();
    }, []);

    useEffect(() => {
        const currentApptId = selectedAppointment?._id || selectedAppointment?.appointmentId;
        if (!socketRef.current || !currentApptId || !isChatModalOpen) return;
        socketRef.current.emit('join_room', { appointmentId: currentApptId });
    }, [isChatModalOpen, selectedAppointment]);

    useEffect(() => {
        fetchData();
        fetchDoctorProfile();
    }, [filterStatus, filterConsultationType]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const apiFilter = filterStatus === 'Cancelled' ? '' : filterStatus;

            const queryParams = {
                status: apiFilter,
                consultationType: filterConsultationType || undefined
            };

            const [statsRes, bookingsRes] = await Promise.all([
                DoctorAPI.getAppointmentStats(),
                DoctorAPI.getPatientBookings(queryParams)
            ]);

            if (statsRes.success) setStats(statsRes.data);
            if (bookingsRes.success) {
                setAppointments(bookingsRes.data);
                setCurrentPage(1); 
            }
        } catch (error) {
            toast.error("Failed to fetch appointments");
        } finally {
            setLoading(false);
        }
    };

    const fetchDoctorProfile = async () => {
        try {
            const res = await DoctorAPI.getProfile();
            if (res && res.success && res.data) {
                setDoctorProfile(res.data);
            }
        } catch (err) {
            console.error("Unable to resolve dynamic doctor profile details:", err);
        }
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

    const handleAction = async (e, id, action) => {
        e.stopPropagation(); 
        if (action === 'cancel') {
            const appt = appointments.find(a => a._id === id);
            openCancelModal(e, appt || { _id: id });
            return;
        }

        try {
            setSubmitting(true);
            let res;
            if (action === 'confirm') res = await DoctorAPI.confirmAppointment(id);

            if (res.success) {
                toast.success(`Appointment confirmed successfully`);
                fetchData();
            }
        } catch (error) {
            toast.error("Action failed");
        } finally {
            setSubmitting(false);
        }
    };

    const openCancelModal = (e, appt) => {
        if (e) e.stopPropagation();
        setSelectedAppointment(appt);
        setCancelData({
            reason: 'Doctor has emergency shift',
            isPermanent: false
        });
        setIsCancelModalOpen(true);
    };

    const handleCancelSubmit = async () => {
        if (!selectedAppointment) return;
        if (!cancelData.reason.trim()) return toast.error("Please enter a valid cancellation reason");

        try {
            setSubmitting(true);
            const payload = {
                reason: cancelData.reason.trim(),
                isPermanent: Boolean(cancelData.isPermanent)
            };

            const res = await DoctorAPI.cancelAppointment(selectedAppointment._id, payload);
            if (res && res.success) {
                toast.success(res.message || "Appointment cancelled successfully");
                setIsCancelModalOpen(false);
                setIsViewModalOpen(false);
                fetchData();
            } else {
                toast.error(res?.message || "Failed to cancel appointment");
            }
        } catch (error) {
            console.error("Cancellation Submit Error:", error);
            toast.error(error.response?.data?.message || "Error cancelling appointment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRescheduleSubmit = async () => {
        if (!rescheduleData.date || !rescheduleData.time) return toast.error("Please select date and time");
        try {
            setSubmitting(true);
            const res = await DoctorAPI.rescheduleAppointment(selectedAppointment._id, {
                newDate: rescheduleData.date,
                newTime: rescheduleData.time,
                reason: rescheduleData.reason
            });
            if (res.success) {
                toast.success("Rescheduled successfully");
                setIsRescheduleModalOpen(false);
                fetchData();
            }
        } catch (error) {
            toast.error("Failed to reschedule");
        } finally {
            setSubmitting(false);
        }
    };

    const handleStartCall = async (appointment, type = 'video') => {
        try {
            setSubmitting(true);
            setActiveCallType(type);

            const payload = {
                appointmentId: appointment._id,
                callId: appointment._id, 
                callType: type,
                callerName: "Dr. " + (doctorProfile?.name || appointment.doctorId?.name || "Doctor"),
                receiverId: appointment.userId?._id || appointment.userId, 
            };
            const res = await DoctorAPI.initiateVideoCall(payload);

            if (res.success) {
                toast.success(`Calling patient via ${type}...`);
                setSelectedAppointment(appointment);
                setActiveCallId(payload.callId); 
                setIsVideoModalOpen(true); 
            } else {
                toast.error("Patient is offline or unreachable");
            }
        } catch (error) {
            console.error(error);
            toast.error("Could not initiate call session");
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenChat = async (e, appointment) => {
        if (e) e.stopPropagation();
        setSelectedAppointment(appointment);
        setIsChatModalOpen(true);
        setChatLoading(true);
        setChatMessages([]);
        try {
            const apptId = appointment._id || appointment.appointmentId;
            const res = await DoctorAPI.getDoctorChatHistory(apptId);
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
        const verifiedDoctorId = doctorProfile?._id || doctorProfile?.id || selectedAppointment.doctorId;
        const apptId = selectedAppointment._id || selectedAppointment.appointmentId;
        const payload = {
            appointmentId: apptId,
            senderId: verifiedDoctorId,
            senderType: "Doctor",
            text: newMessageText.trim()
        };
        socketRef.current.emit('send_message', payload);
        setNewMessageText('');
    };

    const handleNoShow = async (e, id) => {
        if (e) e.stopPropagation();
        
        // Interactive native comment input request
        const reason = window.prompt("Please enter comment details for marking this Consultation as No-Show:");
        if (reason === null) return; // Action aborted
        if (!reason.trim()) {
            toast.error("Comments are required to log No-Show.");
            return;
        }

        try {
            setSubmitting(true);
            const res = await DoctorAPI.noShowAppointment(id, reason.trim());
            if (res && res.success) {
                toast.success(res.message || "Consultation No-Show logged successfully.");
                setIsViewModalOpen(false);
                fetchData();
            } else {
                toast.error(res?.message || "Failed to log No-Show.");
            }
        } catch (error) {
            console.error("No Show Submit Error:", error);
            toast.error("Error setting appointment status to No-Show");
        } finally {
            setSubmitting(false);
        }
    };

    // Starts clinical case flow and normalizes patient metrics
    const handleStartCase = (appt) => {
        const normalizedAppt = {
            ...appt,
            patientName: appt.patients?.[0]?.patientName || appt.userId?.name || "N/A",
            bookingId: appt.bookingId || "N/A",
            patientGender: appt.patients?.[0]?.gender || "N/A",
            patientAge: appt.patients?.[0]?.patientAge || "N/A",
            patientId: appt.userId?._id || appt.userId || ""
        };
        setSelectedAppointment(normalizedAppt);
        setIsPrescriptionModalOpen(true);
    };

    const handlePrescriptionSuccess = (stagedPayload) => {
        setIsPrescriptionModalOpen(false);

        const patientAddress = selectedAppointment?.consultationType === 'Home Visit' && selectedAppointment?.address
            ? `${selectedAppointment.address.houseNo || ''}, ${selectedAppointment.address.sector || ''}, ${selectedAppointment.address.city || ''}, ${selectedAppointment.address.state || ''}`
            : "Clinic Visit";

        // Broad-spectrum fallback resolver for Patient/User ID mapping
        const resolvedUserId = 
            stagedPayload.patientId || 
            stagedPayload.userId || 
            selectedAppointment?.userId?._id || 
            selectedAppointment?.userId || 
            selectedAppointment?.patientId || 
            "";

        const formattedPreviewPayload = {
            appointmentId: selectedAppointment?._id || selectedAppointment?.appointmentId,
            patientId: resolvedUserId,
            userId: resolvedUserId,
            patientInfo: {
                name: selectedAppointment?.patientName || "N/A",
                age: selectedAppointment?.patientAge || "N/A",
                gender: selectedAppointment?.patientGender || "N/A",
                phone: selectedAppointment?.userId?.phone || "N/A",
                address: patientAddress
            },
            clinicalDetails: {
                diagnosis: stagedPayload.diagnosis || [],
                medicines: stagedPayload.medicines || [],
                symptoms: stagedPayload.additionalNotes || ""
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
            advisedInvestigations: stagedPayload.advisedInvestigations || "",
            adviceGiven: stagedPayload.adviceGiven || "",
            specialInstructions: stagedPayload.specialInstructions || "",
            nextAppointment: stagedPayload.nextAppointment || "",
            // Dynamic Vitals payload mapping (Option A & C support)
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
                fetchData(); 
            } else {
                toast.error(response?.message || "Failed to finalize consultation.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred during finalization.");
        }
    };

    const getConsultationIcon = (type) => {
        switch (type) {
            case 'Home Visit': return <FaHome className="text-orange-500" />;
            case 'Online': return <FaVideo className="text-blue-500" />;
            case 'Clinic Visit': return <FaHospital className="text-emerald-500" />;
            default: return <FaHospital className="text-emerald-500" />;
        }
    };

    const isCancelledStatus = (status) => {
        if (!status) return false;
        return status.toLowerCase().includes('cancelled');
    };

    const isCancelledByUserStatus = (status) => {
        if (!status) return false;
        return status.toLowerCase() === 'cancelled-by-user';
    };

    const openViewModal = (appt) => {
        setSelectedAppointment(appt);
        setIsViewModalOpen(true);
    };

    const openRescheduleModal = (e, appt) => {
        e.stopPropagation(); 
        setSelectedAppointment(appt);
        setRescheduleData({ date: '', time: '', reason: '' });
        setIsRescheduleModalOpen(true);
    };

    const getAppointmentBucket = (dateStr) => {
        if (!dateStr) return 2; 
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const target = new Date(dateStr);
            target.setHours(0, 0, 0, 0);

            if (target.getTime() === today.getTime()) {
                return 0; 
            } else if (target.getTime() > today.getTime()) {
                return 1; 
            } else {
                return 2; 
            }
        } catch (e) {
            return 2;
        }
    };

    const filteredAppointments = appointments.filter(appt => {
        let matchesStatus = true;
        if (filterStatus) {
            if (filterStatus === 'Cancelled') {
                matchesStatus = isCancelledStatus(appt.status);
            } else {
                matchesStatus = appt.status === filterStatus;
            }
        }

        let matchesSearch = true;
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const patientName = (appt.patients?.[0]?.patientName || appt.userId?.name || '').toLowerCase();
            const bookingId = (appt.bookingId || '').toLowerCase();
            const phone = (appt.userId?.phone || '').toLowerCase();
            const email = (appt.userId?.email || '').toLowerCase();

            matchesSearch = patientName.includes(query) || 
                            bookingId.includes(query) || 
                            phone.includes(query) || 
                            email.includes(query);
        }

        return matchesStatus && matchesSearch;
    });

    const sortedAppointments = [...filteredAppointments].sort((a, b) => {
        const bucketA = getAppointmentBucket(a.appointmentDate);
        const bucketB = getAppointmentBucket(b.appointmentDate);

        if (bucketA !== bucketB) {
            return bucketA - bucketB; 
        }

        return new Date(a.appointmentDate) - new Date(b.appointmentDate);
    });

    const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAppointments = sortedAppointments.slice(indexOfFirstItem, indexOfLastItem);

    const isOnlineConsultation =
        selectedAppointment?.consultationType?.toLowerCase().includes('online') ||
        selectedAppointment?.consultationType?.toLowerCase().includes('video');

    const isTerminalStatus =
        selectedAppointment?.status === 'Completed' ||
        selectedAppointment?.status === 'No Show' ||
        selectedAppointment?.status === 'No-Show' ||
        (isCancelledStatus(selectedAppointment?.status) && !isCancelledByUserStatus(selectedAppointment?.status));

    // Determine if cancellation details exist
    const hasCancellationInfo = selectedAppointment && (
        selectedAppointment.cancellationDetails?.reason ||
        selectedAppointment.cancelReason ||
        selectedAppointment.cancellationDetails?.cancelledAt ||
        selectedAppointment.cancellationDetails?.refundAmountCalculated
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
            <Toaster position="top-right" />

            <div className="max-w-7xl mx-auto space-y-8">

                {/* PAGE HEADER */}
                <div>
                    <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Patient Bookings</h1>
                    <p className="text-sm text-gray-500 font-medium">Manage your schedule and consultations</p>
                </div>

                {/* STATS CARDS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total', value: stats?.totalAppointments || 0, color: 'bg-blue-500' },
                        { label: 'Pending', value: stats?.pending || 0, color: 'bg-orange-500' },
                        { label: 'Completed', value: stats?.completed || 0, color: 'bg-emerald-500' },
                        { label: 'Revenue', value: `₹${stats?.totalRevenue || 0}`, color: 'bg-purple-500' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{s.label}</p>
                            <h3 className="text-2xl font-black text-gray-800">{s.value}</h3>
                            <div className={`h-1 w-8 rounded-full mt-2 ${s.color}`}></div>
                        </div>
                    ))}
                </div>

                {/* TABS & SEARCH CONTROLS ROW (Aligned to Left) */}
                <div className="flex flex-col xl:flex-row justify-start items-start xl:items-center gap-4">
                    <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-stretch sm:items-center">
                        
                        <div className="relative flex-grow sm:flex-grow-0">
                            <input
                                type="text"
                                placeholder="Search patient name, ID..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="w-full sm:w-64 bg-white pl-11 pr-5 py-3.5 rounded-2xl shadow-sm border border-gray-100 text-[11px] font-black uppercase tracking-widest text-gray-700 placeholder-gray-400 outline-none focus:ring-4 focus:ring-green-50 focus:border-[#08B36A] transition-all"
                            />
                            <div className="absolute top-1/2 left-4 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                                </svg>
                            </div>
                        </div>

                        {/* Restricted Filter Tabs (Section 3 & Custom Requirement) */}
                        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex gap-1 overflow-x-auto">
                            {['', 'Pending', 'Confirmed', 'Completed', 'Cancelled', 'No-Show'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => { setFilterStatus(status); setCurrentPage(1); }}
                                    className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterStatus === status ? 'bg-[#08B36A] text-white' : 'text-gray-400 hover:bg-gray-50'
                                        }`}
                                >
                                    {status === 'No-Show' ? 'No Show' : (status || 'All')}
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <select
                                value={filterConsultationType}
                                onChange={(e) => { setFilterConsultationType(e.target.value); setCurrentPage(1); }}
                                className="w-full sm:w-auto bg-white px-5 py-3.5 rounded-2xl shadow-sm border border-gray-100 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-800 hover:border-gray-200 outline-none focus:ring-4 focus:ring-green-50 focus:border-[#08B36A] transition-all cursor-pointer appearance-none pr-12"
                            >
                                <option value="">All Types</option>
                                <option value="video">Video Consult</option>
                                <option value="clinic">Clinic Visit</option>
                                <option value="home">Home Visit</option>
                            </select>
                            <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LIST VIEW */}
                {loading ? (
                    <div className="flex flex-col items-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
                        <FaSpinner className="animate-spin text-[#08B36A] mb-4" size={30} />
                        <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Fetching appointments...</p>
                    </div>
                ) : sortedAppointments.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
                        <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No appointments found for this selection</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Patient Details</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Consultation</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Schedule</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Payment & Status</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {currentAppointments.map((appt) => {
                                        const isOnline = appt.consultationType?.toLowerCase().includes('online') || appt.consultationType?.toLowerCase().includes('video');
                                        return (
                                            <tr
                                                key={appt._id}
                                                onClick={() => openViewModal(appt)}
                                                className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 font-black text-lg uppercase group-hover:bg-green-50 group-hover:text-[#08B36A] transition-all">
                                                            {appt.patients[0]?.patientName?.charAt(0) || appt.userId?.name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-gray-900 text-sm uppercase tracking-tight">
                                                                {appt.patients[0]?.patientName || appt.userId?.name}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-black uppercase">{appt.patients[0]?.gender}</span>
                                                                <span className="text-[10px] text-gray-400 font-bold">Age: {appt.patients[0]?.patientAge}</span>
                                                            </div>
                                                            {/* Dynamic Reschedules and Cancellations limits display on card */}
                                                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                                <span className="text-[9px] bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                                                                    Reschedules Left: {appt.remainingReschedules ?? "N/A"}
                                                                </span>
                                                                <span className="text-[9px] bg-red-50 text-red-700 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                                                                    Cancels Left: {appt.remainingCancellations ?? "N/A"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {getConsultationIcon(appt.consultationType)}
                                                        <p className="text-sm font-black text-gray-700">{appt.consultationType}</p>
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
                                                    <div className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-1 ${isCancelledStatus(appt.status) ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'}`}>
                                                        {appt.status}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-black text-[#08B36A]">₹{appt.totalAmount}</p>
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase">({appt.paymentStatus})</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex justify-end items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                        {appt.status === 'Pending' ? (
                                                            <>
                                                                <button
                                                                    disabled={submitting}
                                                                    onClick={(e) => openCancelModal(e, appt)}
                                                                    className="p-3 rounded-2xl text-red-500 bg-red-50 hover:bg-red-100 transition-all active:scale-90"
                                                                    title="Cancel Appointment"
                                                                >
                                                                    <FaTimes />
                                                                </button>
                                                                <button
                                                                    disabled={submitting}
                                                                    onClick={(e) => handleAction(e, appt._id, 'confirm')}
                                                                    className="p-3 rounded-2xl text-white bg-[#08B36A] hover:bg-green-600 shadow-lg shadow-green-100 transition-all active:scale-90"
                                                                    title="Confirm Appointment"
                                                                >
                                                                    <FaCheck />
                                                                </button>
                                                            </>
                                                        ) : isCancelledByUserStatus(appt.status) ? (
                                                            <button
                                                                onClick={(e) => openRescheduleModal(e, appt)}
                                                                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-orange-200 text-orange-600 hover:bg-orange-50 transition-all"
                                                            >
                                                                <FaUndo /> Reschedule
                                                            </button>
                                                        ) : (isCancelledStatus(appt.status) || appt.status === 'Completed' || appt.status === 'No Show' || appt.status === 'No-Show') ? (
                                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-4 py-2 bg-gray-50 rounded-xl">View Only</span>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                {appt.status === 'Confirmed' && (appt.consultationType === 'Home Visit' || appt.consultationType === 'Clinic Visit') && (
                                                                    <>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleStartCase(appt);
                                                                            }}
                                                                            className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-100 transition-all"
                                                                        >
                                                                            Start Case
                                                                        </button>
                                                                        {/* Dynamic "No Show" action button displayed inside Start Case flow */}
                                                                        <button
                                                                            disabled={submitting}
                                                                            onClick={(e) => handleNoShow(e, appt._id)}
                                                                            className="flex items-center gap-1.5 px-4 py-2.5 bg-red-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-red-600 shadow-md transition-all active:scale-95"
                                                                            title="Mark Patient as No Show"
                                                                        >
                                                                            No Show
                                                                        </button>
                                                                    </>
                                                                )}

                                                                {/* Interactive Communications Toolbar (Voice, Video & Chat) */}
                                                                {isOnline && (
                                                                    <>
                                                                        <button
                                                                            disabled={submitting}
                                                                            onClick={(e) => { e.stopPropagation(); handleStartCall(appt, 'video'); }}
                                                                            className="p-3 rounded-2xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all active:scale-90"
                                                                            title="Video Consultation"
                                                                        >
                                                                            <FaVideo size={13} />
                                                                        </button>
                                                                        <button
                                                                            disabled={submitting}
                                                                            onClick={(e) => { e.stopPropagation(); handleStartCall(appt, 'audio'); }}
                                                                            className="p-3 rounded-2xl text-green-600 bg-green-50 hover:bg-green-100 transition-all active:scale-90"
                                                                            title="Voice Consultation"
                                                                        >
                                                                            <FaPhoneAlt size={13} />
                                                                        </button>
                                                                        <button
                                                                            disabled={submitting}
                                                                            onClick={(e) => handleOpenChat(e, appt)}
                                                                            className="p-3 rounded-2xl text-purple-600 bg-purple-50 hover:bg-purple-100 transition-all active:scale-90"
                                                                            title="Chat coordination"
                                                                        >
                                                                            <FaComment size={13} />
                                                                        </button>
                                                                    </>
                                                                )}

                                                                <button
                                                                    onClick={(e) => openCancelModal(e, appt)}
                                                                    className="p-3 rounded-2xl text-red-500 bg-red-50 hover:bg-red-100 transition-all active:scale-90"
                                                                    title="Cancel Appointment"
                                                                >
                                                                    <FaTimes />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => openRescheduleModal(e, appt)}
                                                                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-100 text-gray-500 hover:bg-gray-50 transition-all"
                                                                >
                                                                    <FaUndo /> Reschedule
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION PANEL */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-8 py-5 bg-gray-50/50 border-t border-gray-100">
                                <p className="text-xs text-gray-400 font-bold">
                                    Showing <span className="font-black text-gray-800">{indexOfFirstItem + 1}</span> to{' '}
                                    <span className="font-black text-gray-800">
                                        {Math.min(indexOfLastItem, sortedAppointments.length)}
                                    </span>{' '}
                                    of <span className="font-black text-gray-800">{sortedAppointments.length}</span> appointments
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.max(prev - 1, 1)); }}
                                        className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.min(prev + 1, totalPages)); }}
                                        className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* VIEW DETAILS MODAL */}
            {isViewModalOpen && selectedAppointment && (
                <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[3.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden relative shadow-2xl animate-in fade-in zoom-in-95 duration-300 flex flex-col">
                        
                        <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-[#08B36A] rounded-[1.5rem] flex items-center justify-center text-white text-xl font-black">
                                    {selectedAppointment.patients[0]?.patientName?.charAt(0) || selectedAppointment.userId?.name?.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">{selectedAppointment.patients[0]?.patientName || selectedAppointment.userId?.name}</h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Booking ID: {selectedAppointment.bookingId}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsViewModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-400 hover:text-red-500 transition-all">
                                <IoCloseOutline size={28} />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-8">
                            
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 rounded-[1.5rem] bg-gray-50 border border-gray-100">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                    <p className={`text-xs font-black uppercase ${isCancelledStatus(selectedAppointment.status) ? 'text-red-500' : 'text-[#08B36A]'}`}>{selectedAppointment.status}</p>
                                </div>
                                <div className="p-4 rounded-[1.5rem] bg-gray-50 border border-gray-100">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Type</p>
                                    <p className="text-xs font-black text-gray-800 uppercase">{selectedAppointment.consultationType}</p>
                                </div>
                                <div className="p-4 rounded-[1.5rem] bg-gray-50 border border-gray-100">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment</p>
                                    <p className="text-xs font-black text-orange-500 uppercase">{selectedAppointment.paymentStatus}</p>
                                </div>
                            </div>

                            {/* CANCELLATION DETAILS SECTION */}
                            {hasCancellationInfo && (
                                <div className="space-y-3">
                                    <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <FaExclamationTriangle size={10} className="text-red-500" /> Cancellation Details
                                    </h4>
                                    <div className="p-5 bg-red-50/70 border border-red-100 rounded-[2rem] space-y-3 text-xs">
                                        {/* Conditionally render cancellation reason if provided */}
                                        {(selectedAppointment.cancellationDetails?.reason || selectedAppointment.cancelReason) && (
                                            <div className="flex justify-between border-b border-red-100 pb-2">
                                                <span className="font-bold text-gray-500">Reason</span>
                                                <span className="font-black text-red-700 italic">
                                                    "{selectedAppointment.cancellationDetails?.reason || selectedAppointment.cancelReason}"
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between border-b border-red-100 pb-2">
                                            <span className="font-bold text-gray-500">Cancellation Mode</span>
                                            <span className={`font-black uppercase ${selectedAppointment.cancellationDetails?.isPermanent ? 'text-red-600' : 'text-blue-600'}`}>
                                                {selectedAppointment.cancellationDetails?.isPermanent }
                                            </span>
                                        </div>
                                        {selectedAppointment.cancellationDetails?.refundAmountCalculated > 0 && (
                                            <div className="flex justify-between border-b border-red-100 pb-2">
                                                <span className="font-bold text-gray-500">Refund Amount</span>
                                                <span className="font-black text-green-700">₹{selectedAppointment.cancellationDetails.refundAmountCalculated}</span>
                                            </div>
                                        )}
                                        {selectedAppointment.cancellationDetails?.cancelledAt && (
                                            <div className="flex justify-between">
                                                <span className="font-bold text-gray-500">Cancelled On</span>
                                                <span className="font-bold text-gray-700">{new Date(selectedAppointment.cancellationDetails.cancelledAt).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><FaUser size={10} /> Patient Information</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between py-2 border-b border-gray-50">
                                            <span className="text-xs font-bold text-gray-500">Gender</span>
                                            <span className="text-xs font-black text-gray-800">{selectedAppointment.patients[0]?.gender || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-50">
                                            <span className="text-xs font-bold text-gray-500">Age</span>
                                            <span className="text-xs font-black text-gray-800">{selectedAppointment.patients[0]?.patientAge ? `${selectedAppointment.patients[0].patientAge} Years` : "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-xs font-bold text-gray-500">Relation</span>
                                            <span className="text-xs font-black text-gray-800 uppercase">{selectedAppointment.patients[0]?.relation || "Self"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><FaStethoscope size={10} /> Reason for Visit</h4>
                                    <div className="p-4 bg-blue-50 rounded-2xl min-h-[80px]">
                                        <p className="text-xs font-bold text-blue-700 italic">
                                            "{selectedAppointment.patients[0]?.reasonForVisit || "General Consultation Checkup"}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><FaClock size={10} /> Schedule Info</h4>
                                    <div className="p-4 bg-green-50 rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FaCalendarAlt className="text-[#08B36A]" />
                                            <span className="text-sm font-black text-gray-800">{formatDate(selectedAppointment.appointmentDate)}</span>
                                        </div>
                                        <div className="w-px h-8 bg-green-200"></div>
                                        <div className="flex items-center gap-3">
                                            <FaClock className="text-[#08B36A]" />
                                            <span className="text-sm font-black text-gray-800">{selectedAppointment.appointmentTime}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><FaPhoneAlt size={10} /> Primary Contact</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-xs font-bold text-gray-700">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><FaPhoneAlt size={12} /></div>
                                            {selectedAppointment.userId?.phone || "N/A"}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs font-bold text-gray-700">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><FaEnvelope size={12} /></div>
                                            {selectedAppointment.userId?.email || "N/A"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedAppointment.consultationType === 'Home Visit' && (
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><FaMapMarkerAlt size={10} /> Visit Address</h4>
                                    <div className="p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
                                        <p className="text-xs font-bold text-gray-800 leading-relaxed uppercase">
                                            {selectedAppointment.address?.houseNo}, {selectedAppointment.address?.sector},
                                            {selectedAppointment.address?.landmark && ` ${selectedAppointment.address.landmark},`} {selectedAppointment.address?.city},
                                            {selectedAppointment.address?.state} - {selectedAppointment.address?.pincode}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><FaWallet size={10} /> Bill Breakdown</h4>
                                <div className="bg-slate-900 rounded-[2rem] p-6 text-white">
                                    <div className="space-y-2 border-b border-slate-800 pb-4 mb-4">
                                        <div className="flex justify-between text-xs font-medium text-slate-400">
                                            <span>Base Consultation Fee</span>
                                            <span>₹{selectedAppointment.pricingBreakdown?.baseFee || 0}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-medium text-slate-400">
                                            <span>Visit/Travel Charges</span>
                                            <span>+ ₹{selectedAppointment.pricingBreakdown?.visitCharges || 0}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-medium text-[#08B36A]">
                                            <span>Discount Applied</span>
                                            <span>- ₹{selectedAppointment.pricingBreakdown?.discountAmount || 0}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total Paid</span>
                                        <span className="text-2xl font-black text-white">₹{selectedAppointment.totalAmount || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-8 border-t border-gray-50 flex gap-3">
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="flex-1 py-4 rounded-2xl border border-gray-100 font-black text-[10px] uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all text-center"
                            >
                                Close Details
                            </button>
                            {!isTerminalStatus && (
                                isOnlineConsultation ? (
                                    <div className="flex-1 flex gap-2">
                                        <button
                                            disabled={submitting}
                                            onClick={() => handleStartCall(selectedAppointment, 'video')}
                                            className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2"
                                        >
                                            {submitting && activeCallType === 'video' ? <FaSpinner className="animate-spin" /> : <FaVideo />}
                                            Video Call
                                        </button>
                                        <button
                                            disabled={submitting}
                                            onClick={() => handleStartCall(selectedAppointment, 'audio')}
                                            className="flex-1 py-4 rounded-2xl bg-green-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-green-700 shadow-xl shadow-green-100 transition-all flex items-center justify-center gap-2"
                                        >
                                            {submitting && activeCallType === 'audio' ? <FaSpinner className="animate-spin" /> : <FaPhoneAlt />}
                                            Voice Call
                                        </button>
                                        <button
                                            disabled={submitting}
                                            onClick={(e) => {
                                                setIsViewModalOpen(false);
                                                handleOpenChat(e, selectedAppointment);
                                            }}
                                            className="flex-1 py-4 rounded-2xl bg-purple-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-purple-700 shadow-xl shadow-purple-100 transition-all flex items-center justify-center gap-2"
                                        >
                                            <FaComment />
                                            Chat
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex gap-2">
                                        {selectedAppointment.status === 'Confirmed' && (selectedAppointment.consultationType === 'Home Visit' || selectedAppointment.consultationType === 'Clinic Visit') && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setIsViewModalOpen(false);
                                                        handleStartCase(selectedAppointment);
                                                    }}
                                                    className="flex-1 py-4 rounded-2xl bg-orange-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 shadow-xl shadow-orange-100 transition-all"
                                                >
                                                    Start Case
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        setIsViewModalOpen(false);
                                                        handleNoShow(e, selectedAppointment._id);
                                                    }}
                                                    className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-600 shadow-xl transition-all"
                                                >
                                                    No Show
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={(e) => openCancelModal(e, selectedAppointment)}
                                            className="px-5 py-4 rounded-2xl bg-red-50 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                setIsViewModalOpen(false);
                                                openRescheduleModal(e, selectedAppointment);
                                            }}
                                            className="flex-1 py-4 rounded-2xl bg-[#08B36A] text-white font-black text-[10px] uppercase tracking-widest hover:bg-green-600 shadow-xl shadow-green-100 transition-all"
                                        >
                                            Modify Schedule
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* DOCTOR CANCELLATION MODAL (PATCH /doctor/appointments/cancel/:id) */}
            {isCancelModalOpen && selectedAppointment && (
                <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[130] p-4 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100">
                        
                        {/* Header */}
                        <div className="p-8 border-b border-gray-50 bg-red-50/50 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-black text-red-600 uppercase tracking-tight flex items-center gap-2">
                                    <FaExclamationTriangle /> Cancel Appointment
                                </h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                    Booking ID: #{selectedAppointment.bookingId}
                                </p>
                            </div>
                            <button onClick={() => setIsCancelModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-400 hover:text-red-500 transition-all border border-gray-100">
                                <IoCloseOutline size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                                    Reason for Cancellation <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="e.g. Doctor has emergency surgery or shift conflict"
                                    value={cancelData.reason}
                                    onChange={(e) => setCancelData({ ...cancelData, reason: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-xs text-gray-800 focus:ring-4 focus:ring-red-50 focus:border-red-500 outline-none transition-all resize-none"
                                />
                            </div>

                            {/* Option Selector Cards */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">
                                    Select Cancellation Mode
                                </label>

                                {/* Option 1: Reschedule-Ready (isPermanent: false) */}
                                <div 
                                    onClick={() => setCancelData({ ...cancelData, isPermanent: false })}
                                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                                        !cancelData.isPermanent 
                                            ? 'border-[#08B36A] bg-green-50/40 shadow-xs' 
                                            : 'border-gray-100 bg-white hover:border-gray-200'
                                    }`}
                                >
                                    <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${!cancelData.isPermanent ? 'bg-[#08B36A] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <FaExchangeAlt size={14} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <p className="font-extrabold text-gray-900 text-xs">Allow Free Reschedule</p>
                                            <span className="text-[9px] font-black text-[#08B36A] uppercase bg-green-100 px-2 py-0.5 rounded">
                                                Recommended
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-1">
                                            Frees up your calendar slot. The payment stays active so the patient can reschedule for free anytime.
                                        </p>
                                    </div>
                                </div>

                                {/* Option 2: Permanent Cancellation & Refund (isPermanent: true) */}
                                <div 
                                    onClick={() => setCancelData({ ...cancelData, isPermanent: true })}
                                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                                        cancelData.isPermanent 
                                            ? 'border-red-500 bg-red-50/40 shadow-xs' 
                                            : 'border-gray-100 bg-white hover:border-gray-200'
                                    }`}
                                >
                                    <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${cancelData.isPermanent ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <FaMoneyBillWave size={14} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <p className="font-extrabold text-gray-900 text-xs">Permanent Refund</p>
                                            <span className="text-[9px] font-black text-red-600 uppercase bg-red-100 px-2 py-0.5 rounded">
                                                Full Refund
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-1">
                                            Permanently terminates the booking and initiates a full financial refund back to the patient.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Controls */}
                        <div className="p-8 pt-0 flex gap-3">
                            <button
                                onClick={() => setIsCancelModalOpen(false)}
                                className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all"
                            >
                                Back
                            </button>
                            <button
                                disabled={submitting}
                                onClick={handleCancelSubmit}
                                className={`flex-[2] py-4 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg ${
                                    cancelData.isPermanent 
                                        ? 'bg-red-500 hover:bg-red-600 shadow-red-100' 
                                        : 'bg-[#08B36A] hover:bg-green-600 shadow-green-100'
                                }`}
                            >
                                {submitting ? <FaSpinner className="animate-spin" /> : 'Confirm Cancellation'}
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* RESCHEDULE MODAL */}
            {isRescheduleModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[120] p-4 backdrop-blur-md">
                    <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden relative shadow-2xl animate-in slide-in-from-bottom-4 duration-300">

                        <div className="p-8 border-b border-gray-50 bg-gray-50/50">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Update Schedule</h2>
                                <button onClick={() => setIsRescheduleModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-400 hover:text-red-500 transition-all">
                                    <IoCloseOutline size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">New Appointment Date</label>
                                <input
                                    type="date"
                                    value={rescheduleData.date}
                                    onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-gray-700 focus:ring-4 focus:ring-green-50 focus:border-[#08B36A] outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Preferred Slot Time</label>
                                <input
                                    type="time"
                                    value={rescheduleData.time}
                                    onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-gray-700 focus:ring-4 focus:ring-green-50 focus:border-[#08B36A] outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Reason for Rescheduling</label>
                                <textarea
                                    rows={3}
                                    placeholder="e.g., Doctor has an emergency surgery clash"
                                    value={rescheduleData.reason || ''}
                                    onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm text-gray-700 focus:ring-4 focus:ring-green-50 focus:border-[#08B36A] outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="bg-orange-50 p-5 rounded-[2rem] border border-orange-100">
                                <div className="flex gap-3">
                                    <FaInfoCircle className="text-orange-500 shrink-0 mt-1" />
                                    <p className="text-xs font-bold text-orange-700 leading-relaxed">
                                        Rescheduling will send a notification to the patient. They must accept the new time to confirm.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 pt-0 flex flex-col gap-3">
                            <p className="text-xs text-center text-red-500 font-bold uppercase">
                                Action consumes rescheduling limits if confirmed.
                            </p>
                            <button
                                disabled={submitting}
                                onClick={handleRescheduleSubmit}
                                className="w-full py-5 rounded-[2rem] bg-[#08B36A] text-white font-black text-xs uppercase tracking-widest hover:bg-green-600 shadow-xl shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {submitting ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                                {submitting ? 'Updating...' : 'Confirm Reschedule'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CHAT MODAL WINDOW */}
            {isChatModalOpen && selectedAppointment && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[250] p-0 md:p-4 backdrop-blur-sm animate-fade-in animate-in fade-in duration-200">
                    <div className="bg-white w-full h-full md:h-[650px] md:max-h-[85vh] md:max-w-xl flex flex-col overflow-hidden relative md:rounded-[2.5rem] shadow-2xl">
                        <div className="p-5 border-b border-gray-100 bg-gray-50/70 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-[#08B36A] flex items-center justify-center text-white text-md font-black uppercase">
                                    {selectedAppointment.patients?.[0]?.patientName?.charAt(0) || selectedAppointment.userId?.name?.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-gray-900 tracking-tight uppercase">
                                        {selectedAppointment.patients?.[0]?.patientName || selectedAppointment.userId?.name}
                                    </h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Booking ID: {selectedAppointment.bookingId}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsChatModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-50 text-slate-400 hover:text-red-500 transition-colors">
                                <IoCloseOutline size={24} />
                            </button>
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

            {/* Prescription Form Modal Builder */}
            <AddPrescriptionModal
                isOpen={isPrescriptionModalOpen}
                onClose={() => setIsPrescriptionModalOpen(false)}
                appointment={selectedAppointment}
                onSuccess={handlePrescriptionSuccess}
            />

            {/* Digital Template Preview Summary Sheet */}
            <DigitalPrescriptionTemplate
                isOpen={isPreviewTemplateOpen}
                onClose={() => {
                    setIsPreviewTemplateOpen(false);
                    setCompletedPrescriptionData(null);
                }}
                data={completedPrescriptionData}
                onCompleteCase={handleCompleteCase}
            />

            {/* VIDEO CALL MODAL WITH OVERLAY ACTION CONTROLLERS */}
            {isVideoModalOpen && (
                <div className="fixed inset-0 z-[200]">
                    <VideoCallModal
                        callId={activeCallId}
                        callerName="Doctor"
                        role="caller"
                        callType={activeCallType}
                        onClose={() => {
                            setIsVideoModalOpen(false);
                            setActiveCallId(null);
                        }}
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
                            onClick={(e) => handleStartCall(selectedAppointment, activeCallType === 'video' ? 'audio' : 'video')}
                            className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all active:scale-90 hover:scale-105 shadow-lg"
                            title={`Switch to ${activeCallType === 'video' ? 'Audio Call' : 'Video Call'}`}
                        >
                            {activeCallType === 'video' ? <FaPhoneAlt size={16} /> : <FaVideo size={16} />}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}