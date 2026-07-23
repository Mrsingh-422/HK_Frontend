'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    FaArrowLeft, FaPhoneAlt, FaUser, FaUndo,
    FaCheck, FaCheckCircle, FaSpinner, FaInfoCircle,
    FaExclamationTriangle, FaVials, FaClock, FaClipboardList,
    FaSearch, FaCalendarAlt, FaRupeeSign, FaSyncAlt, FaRoute,
    FaMapMarkerAlt
} from 'react-icons/fa';
import { IoCloseOutline } from 'react-icons/io5';
import { toast, Toaster } from 'react-hot-toast';
import LabVendorAPI from '@/app/services/LabVendorAPI';

export default function TrackLabPhlebotomists() {
    const router = useRouter();
    const [phlebotomists, setPhlebotomists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Details & Tracking Modal States
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedPhlebotomist, setSelectedPhlebotomist] = useState(null);
    const [trackingDetails, setTrackingDetails] = useState(null);
    const [trackingLoading, setTrackingLoading] = useState(false);

    // Reassignment Modal States
    const [reassignTarget, setReassignTarget] = useState(null); // { orderId, currentPhlebotomistId }
    const [availableStaff, setAvailableStaff] = useState([]);
    const [selectedNewStaffId, setSelectedNewStaffId] = useState('');
    const [reassignLoading, setReassignLoading] = useState(false);

    // Fetch master phlebotomist roster
    const fetchPhlebotomists = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await LabVendorAPI.getDrivers(1);
            if (res && res.success) {
                const sorted = (res.data || []).sort((a, b) => {
                    if (a.status === 'Busy' && b.status !== 'Busy') return -1;
                    if (a.status !== 'Busy' && b.status === 'Busy') return 1;
                    return 0;
                });
                setPhlebotomists(sorted);
            } else {
                setError(res?.message || 'Failed to fetch phlebotomist list.');
            }
        } catch (err) {
            console.error('Fetch Phlebotomists Error:', err);
            setError(err.message || 'Error occurred while loading phlebotomist roster.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPhlebotomists();
    }, []);

    // Load detailed live phlebotomist profile & active tracking metadata
    const handleOpenTracking = async (phleb) => {
        setSelectedPhlebotomist(phleb);
        setIsDetailsModalOpen(true);
        setTrackingDetails(null);
        setTrackingLoading(true);

        try {
            // Step 1: Fetch general phlebotomist profile details (returns phlebotomist & activeBooking details)
            const res = await LabVendorAPI.getPhlebotomistDetails(phleb._id);
            if (res && res.success) {
                const details = res.data;
                const bookingId = details?.activeBooking?.bookingMongoId || details?.activeBooking?._id || details?.activeBooking?.bookingId;

                // Step 2: If an active booking is present, fetch deep visual timeline & live coordinates
                if (bookingId) {
                    try {
                        const trackRes = await LabVendorAPI.getBookingTrackingDetails(bookingId);
                        if (trackRes && trackRes.success) {
                            setTrackingDetails({
                                phlebotomist: { ...details.phlebotomist, ...trackRes.data.phlebotomist },
                                activeBooking: {
                                    ...details.activeBooking,
                                    ...trackRes.data,
                                    bookingMongoId: bookingId
                                }
                            });
                        } else {
                            setTrackingDetails(details);
                        }
                    } catch (trackErr) {
                        console.error("Live tracking detail retrieval error, using default details:", trackErr);
                        setTrackingDetails(details);
                    }
                } else {
                    setTrackingDetails(details);
                }
            } else {
                toast.error("Failed to load phlebotomist details.");
            }
        } catch (err) {
            console.error("Live tracking detail load error:", err);
            toast.error("An error occurred while fetching phlebotomist details.");
        } finally {
            setTrackingLoading(false);
        }
    };

    // Open Reassignment Modal & fetch available standby staff
    const initReassignment = async (orderId, currentPhlebotomistId) => {
        setReassignTarget({ orderId, currentPhlebotomistId });
        setSelectedNewStaffId('');
        setAvailableStaff([]);

        try {
            const res = await LabVendorAPI.getAvailablePhlebotomists();
            if (res && res.success) {
                const rawList = res.data || res || [];
                const candidates = rawList.filter(
                    staff => staff._id !== currentPhlebotomistId && staff.status === 'Available'
                );
                setAvailableStaff(candidates);
            } else {
                toast.error("Failed to retrieve standby staff list.");
            }
        } catch (err) {
            console.error("Error fetching standby staff:", err);
            toast.error("Server error occurred while loading available phlebotomists.");
        }
    };

    // Submit dynamic reassignment API request
    const handleReassign = async () => {
        if (!reassignTarget || !selectedNewStaffId) return;

        try {
            setReassignLoading(true);
            const res = await LabVendorAPI.reassignPhlebotomist(reassignTarget.orderId, selectedNewStaffId);
            if (res && res.success) {
                toast.success(res.message || "Phlebotomist reassigned successfully.");
                setReassignTarget(null);
                setIsDetailsModalOpen(false);
                fetchPhlebotomists();
            } else {
                toast.error(res?.message || "Reassignment failed.");
            }
        } catch (err) {
            console.error("Reassignment error:", err);
            toast.error(err.response?.data?.message || "Server error occurred during reassignment.");
        } finally {
            setReassignLoading(false);
        }
    };

    const getImgUrl = (path) => {
        if (!path) return "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
        if (typeof path === 'string' && (path.startsWith('blob') || path.startsWith('http'))) return path;
        const cleanPath = String(path).replace(/^public[\\/]/, '').replace(/\\/g, '/'); 
        return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${cleanPath}`;
    };

    const getStatusBadgeStyles = (status) => {
        const formatStatus = status ? status.toLowerCase() : 'available';
        switch (formatStatus) {
            case 'busy':
                return "bg-amber-50 text-amber-700 border-amber-100 text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-lg border";
            case 'available':
                return "bg-emerald-50 text-emerald-700 border-emerald-100 text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-lg border";
            default:
                return "bg-slate-50 text-slate-500 border-slate-100 text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-lg border";
        }
    };

    // Filter phlebotomists by search query
    const filteredPhlebotomists = phlebotomists.filter(phleb => {
        const matchesSearch = 
            (phleb.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (phleb.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (phleb.vehicleNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    // Map dynamic timeline dates into completed step indices
    const parseTimelineSteps = (activeBooking) => {
        if (!activeBooking) return [];

        if (Array.isArray(activeBooking.timeline) && activeBooking.timeline.length > 0) {
            return activeBooking.timeline;
        }

        const timeline = activeBooking.timeline || {};
        const status = activeBooking.status || '';
        
        return [
            {
                step: "Booking Assigned",
                completed: true,
                description: "Phlebotomist dispatch allocated.",
                timestamp: activeBooking.appointmentDate || activeBooking.createdAt
            },
            {
                step: "On the Way",
                completed: !!timeline?.startedAt,
                description: "Staff is in-transit to patient location.",
                timestamp: timeline?.startedAt
            },
            {
                step: "Arrived at Location",
                completed: !!timeline?.arrivedAt,
                description: "Field agent arrived at destination.",
                timestamp: timeline?.arrivedAt
            },
            {
                step: "Sample Collected",
                completed: !!timeline?.collectedAt,
                description: "Diagnostic sample extraction completed successfully.",
                timestamp: timeline?.collectedAt
            },
            {
                step: "Sample Deposited",
                completed: status === 'Completed' || status === 'Sample Deposited',
                description: "Samples deposited securely at the processing laboratory.",
                timestamp: null
            }
        ];
    };

    return (
        <div className="w-full p-4 md:p-8 min-h-screen bg-gray-50 text-slate-800">
            <Toaster position="top-right" />

            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a8a] mb-1">
                            Phlebotomist Dispatch & Live Tracking
                        </h1>
                        <p className="text-gray-500 text-xs md:text-sm">
                            Real-time home collection tracking, live timeline milestones, and dynamic fallback reallocation.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><FaSearch size={12} /></span>
                            <input 
                                type="text"
                                placeholder="Search by name, vehicle..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-[#08B36A] transition-colors"
                            />
                        </div>
                        <button 
                            onClick={() => router.back()}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#08B36A] hover:bg-green-600 text-white font-medium rounded-xl text-sm transition-colors shadow-sm"
                        >
                            <FaArrowLeft className="text-xs" /> Back
                        </button>
                    </div>
                </div>

                {/* Realtime Stats Cards */}
                {!loading && !error && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                                <FaUser className="text-lg" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Active Staff</p>
                                <h3 className="text-xl font-bold text-gray-800">{phlebotomists.length}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-green-50 text-[#08B36A]">
                                <FaCheckCircle className="text-lg" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Available Standby</p>
                                <h3 className="text-xl font-bold text-green-700">
                                    {phlebotomists.filter(d => d.status === 'Available').length}
                                </h3>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 col-span-2 md:col-span-1">
                            <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
                                <FaRoute className="text-lg" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Active Routes (Busy)</p>
                                <h3 className="text-xl font-bold text-amber-600">
                                    {phlebotomists.filter(d => d.status === 'Busy').length}
                                </h3>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading / Roster Table */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <FaSpinner className="animate-spin text-blue-600 text-3xl mb-3" />
                        <p className="text-gray-500 text-sm font-medium">Fetching phlebotomist operational coordinates...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center bg-white rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-red-500 font-semibold mb-3">{error}</p>
                        <button 
                            onClick={fetchPhlebotomists}
                            className="px-5 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm border border-blue-200 hover:bg-blue-100 transition-all font-medium"
                        >
                            Retry Connection
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 font-bold whitespace-nowrap">Phlebotomist Details</th>
                                        <th className="px-6 py-4 font-bold whitespace-nowrap">Status</th>
                                        <th className="px-6 py-4 font-bold whitespace-nowrap">Vehicle Number</th>
                                        <th className="px-6 py-4 font-bold whitespace-nowrap">Current Status Detail</th>
                                        <th className="px-6 py-4 font-bold whitespace-nowrap text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {filteredPhlebotomists.map((phleb) => {
                                        const isBusy = phleb.status === 'Busy';
                                        return (
                                            <tr key={phleb._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                                                            {phleb.profilePhoto || phleb.profilePic ? (
                                                                <img src={getImgUrl(phleb.profilePhoto || phleb.profilePic)} alt={phleb.name} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }} />
                                                            ) : (
                                                                phleb.name ? phleb.name.charAt(0) : 'P'
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-800">{phleb.name}</p>
                                                            <span className="text-gray-500 flex items-center gap-1.5 mt-0.5 text-xs">
                                                                <FaPhoneAlt className="text-[10px]" /> {phleb.phone || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block border ${getStatusBadgeStyles(phleb.status)}`}>
                                                        {phleb.status || 'Available'}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">
                                                    {phleb.vehicleNumber || (
                                                        <span className="text-gray-400 italic text-xs">Phlebotomy Kit Walk-in</span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    {isBusy ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                                                            <span className="text-xs text-amber-600 font-bold uppercase tracking-wider">In-transit Collection</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-xs">Waiting on standby...</span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    <button 
                                                        onClick={() => handleOpenTracking(phleb)}
                                                        className="px-4 py-1.5 bg-white text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg border border-gray-200 hover:border-emerald-200 text-xs font-medium transition shadow-sm inline-flex items-center gap-1.5"
                                                    >
                                                        <FaVials className="text-[11px]" /> View & Track
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {filteredPhlebotomists.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="text-center py-16 text-gray-400 font-medium">
                                                No matched phlebotomists found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* --- MODAL 1: GLOBAL VIEWPORT LIVE STATUS MONITOR --- */}
            {isDetailsModalOpen && selectedPhlebotomist && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 overflow-y-auto">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-6xl overflow-hidden border border-slate-100 flex flex-col my-8">
                        
                        {/* Header */}
                        <div className="p-6 bg-slate-50 flex justify-between items-center border-b shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold overflow-hidden">
                                    {trackingDetails?.phlebotomist?.profilePic ? (
                                        <img src={getImgUrl(trackingDetails.phlebotomist.profilePic)} alt={trackingDetails.phlebotomist.name} className="h-full w-full object-cover" />
                                    ) : (
                                        selectedPhlebotomist.name?.charAt(0) || 'P'
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                                        Collection Route <span className="text-emerald-600">#{trackingDetails?.phlebotomist?.name || selectedPhlebotomist.name}</span>
                                    </h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                        Active Status: {trackingDetails?.phlebotomist?.status || selectedPhlebotomist.status}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsDetailsModalOpen(false)} className="p-2 bg-white rounded-full text-slate-300 hover:text-rose-500 border transition-all">
                                    <IoCloseOutline size={22} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 md:p-8 overflow-y-auto flex-1 relative">
                            {trackingLoading ? (
                                <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
                                    <FaSyncAlt className="animate-spin text-emerald-500 text-3xl" />
                                    <p className="text-[10px] font-black text-slate-400 tracking-wider">Syncing collection route...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
                                    
                                    {/* DYNAMIC PROGRESS TIMELINE */}
                                    <div className="lg:col-span-6 space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <FaClock /> Progress Timeline Steps
                                        </p>
                                        
                                        {trackingDetails?.activeBooking ? (
                                            <div className="relative border-l-2 border-slate-100 space-y-5 ml-3 pl-6 pt-2">
                                                {parseTimelineSteps(trackingDetails.activeBooking).map((step, idx) => (
                                                    <div key={idx} className="relative">
                                                        <span className={`absolute -left-[31px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                                                            step.completed 
                                                                ? 'bg-[#08B36A] border-[#08B36A] text-white' 
                                                                : 'bg-white border-slate-200 text-slate-300'
                                                        }`}>
                                                            {step.completed ? (
                                                                <FaCheck className="text-[9px]" />
                                                            ) : (
                                                                <span className="h-1.5 w-1.5 rounded-full bg-slate-200"></span>
                                                            )}
                                                        </span>

                                                        <div className="flex justify-between items-start gap-4">
                                                            <div className="space-y-0.5">
                                                                <h4 className={`text-sm font-bold tracking-tight ${
                                                                    step.completed ? 'text-gray-900' : 'text-gray-300'
                                                                }`}>
                                                                    {step.step}
                                                                </h4>
                                                                <p className={`text-xs ${
                                                                    step.completed ? 'text-gray-500 font-medium' : 'text-gray-300'
                                                                }`}>
                                                                    {step.description}
                                                                </p>
                                                            </div>
                                                            <span className={`text-[10px] font-bold whitespace-nowrap uppercase tracking-wider ${
                                                                step.completed ? 'text-gray-400' : 'text-gray-300'
                                                            }`}>
                                                                {step.timestamp ? new Date(step.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-12 text-center space-y-3 bg-gray-50 border border-slate-100 rounded-[24px]">
                                                <FaCheckCircle className="mx-auto text-[#08B36A] text-3xl animate-pulse" />
                                                <h4 className="font-bold text-gray-800 text-sm">Standby State</h4>
                                                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                                                    Phlebotomist is waiting for active route assignments. No active timeline statistics.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* CLINICAL DATA & SPECIFICATIONS VIEW */}
                                    <div className="lg:col-span-6 space-y-6">
                                        {trackingDetails?.activeBooking ? (
                                            <>
                                                {/* Live Tracking Metrics */}
                                                {trackingDetails.activeBooking.liveTracking && (
                                                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                                                            <FaRoute /> Active Live Tracking Metrics
                                                        </div>
                                                        <div className="text-xs font-black text-blue-900 space-x-3">
                                                            <span>Distance: {trackingDetails.activeBooking.liveTracking.distance || 'N/A'}</span>
                                                            <span>•</span>
                                                            <span>ETA: {trackingDetails.activeBooking.liveTracking.eta || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Client Info Grid */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-2"><FaUser /> Patient Recipient</p>
                                                        <p className="text-sm font-extrabold text-slate-700">{trackingDetails.activeBooking.patientDetails?.name}</p>
                                                        <p className="text-xs font-bold text-emerald-600 mt-0.5">{trackingDetails.activeBooking.patientDetails?.phone || 'No Contact'}</p>
                                                    </div>
                                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-2"><FaMapMarkerAlt /> Address Details</p>
                                                        <p className="text-xs text-slate-600 font-bold leading-relaxed">{trackingDetails.activeBooking.patientDetails?.address || 'Collection location not assigned'}</p>
                                                    </div>
                                                </div>

                                                {/* Route specs */}
                                                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="font-bold text-slate-600 flex items-center gap-1.5"><FaClipboardList className="text-slate-400" /> Booking Reference ID</span>
                                                        <span className="font-black text-slate-800">#{trackingDetails.activeBooking.bookingId || trackingDetails.activeBooking.orderId}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="font-bold text-slate-600 flex items-center gap-1.5"><FaCalendarAlt className="text-slate-400" /> Appointment Schedule</span>
                                                        <span className="font-bold text-slate-700">{trackingDetails.activeBooking.appointmentDate ? new Date(trackingDetails.activeBooking.appointmentDate).toLocaleDateString() : 'N/A'} {trackingDetails.activeBooking.appointmentTime ? `at ${trackingDetails.activeBooking.appointmentTime}` : ''}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs pt-2 border-t border-emerald-100">
                                                        <span className="font-bold text-slate-600 flex items-center gap-1.5"><FaRupeeSign className="text-slate-400" /> Collection Bill</span>
                                                        <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">₹{trackingDetails.activeBooking.amount || 0}</span>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="p-8 rounded-[24px] bg-slate-50 border border-slate-100 text-center text-gray-400 text-xs">
                                                <FaInfoCircle className="mx-auto text-lg mb-2 text-gray-300" />
                                                No active route parameters defined for this phlebotomist.
                                            </div>
                                        )}
                                    </div>

                                </div>
                            )}
                        </div>

                        {/* Modal Action Controls Footer */}
                        <div className="p-6 bg-slate-50 border-t flex justify-between items-center shrink-0">
                            <div>
                                {selectedPhlebotomist.status === 'Busy' && trackingDetails?.activeBooking && (
                                    <button
                                        onClick={() => initReassignment(trackingDetails.activeBooking.bookingMongoId || trackingDetails.activeBooking._id, selectedPhlebotomist._id)}
                                        className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-sm flex items-center gap-1"
                                    >
                                        <FaUndo className="inline" /> Reassign Route Staff
                                    </button>
                                )}
                            </div>
                            <button onClick={() => setIsDetailsModalOpen(false)} className="px-6 py-3 bg-white hover:bg-slate-100 border text-slate-500 font-black rounded-xl text-[10px] uppercase tracking-widest transition-all">Close Console</button>
                        </div>

                    </div>
                </div>
            )}

            {/* --- MODAL 2: REASSIGN STAFF CHOOSE POPUP --- */}
            {reassignTarget && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] w-full max-w-xl p-8 space-y-6 shadow-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                                <FaExclamationTriangle className="text-rose-500" size={20} />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-slate-800 uppercase tracking-tight">Fallback Phlebotomist Reassignment</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Booking target ID: {reassignTarget.orderId}</p>
                            </div>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto pr-1 space-y-3">
                            <h4 className="text-gray-500 text-[10px] font-bold uppercase tracking-wider pl-1">Available Standby Staff ({availableStaff.length})</h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {availableStaff.map((staff) => {
                                    const isSelected = selectedNewStaffId === staff._id;

                                    return (
                                        <div 
                                            key={staff._id}
                                            onClick={() => setSelectedNewStaffId(staff._id)}
                                            className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex items-center justify-between ${
                                                isSelected 
                                                    ? 'border-[#08B36A] bg-green-50/40' 
                                                    : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/30'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`h-11 w-11 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden ${
                                                    isSelected ? 'bg-green-100 text-[#08B36A]' : 'bg-slate-100 text-gray-600'
                                                }`}>
                                                    {staff.profilePic ? (
                                                        <img src={getImgUrl(staff.profilePic)} alt={staff.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        staff.name?.charAt(0)
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-900 text-xs truncate">{staff.name}</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">Phone: {staff.phone || 'None'}</p>
                                                </div>
                                            </div>

                                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                                                isSelected ? 'border-[#08B36A] bg-[#08B36A]' : 'border-gray-300 bg-white'
                                            }`}>
                                                {isSelected && <FaCheck className="text-[8px] text-white" />}
                                            </div>
                                        </div>
                                    );
                                })}

                                {availableStaff.length === 0 && (
                                    <div className="col-span-2 p-12 text-center bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                                        <FaUser className="mx-auto text-gray-300 text-2xl" />
                                        <p className="text-gray-500 text-xs font-medium">No standby phlebotomists are active.</p>
                                        <p className="text-gray-400 text-[10px]">Phlebotomists must update status to Online/Available in their panels.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t">
                            <button onClick={() => setReassignTarget(null)} className="flex-1 py-3 bg-white border text-slate-400 font-black rounded-xl text-[10px] uppercase transition-all">Cancel</button>
                            <button 
                                onClick={handleReassign} 
                                disabled={!selectedNewStaffId || reassignLoading} 
                                className="flex-[2] bg-emerald-600 text-white py-3 rounded-xl font-black text-[10px] uppercase transition-all shadow-lg shadow-emerald-50 hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center"
                            >
                                {reassignLoading ? <FaSyncAlt className="animate-spin" /> : 'Confirm Reallocation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}