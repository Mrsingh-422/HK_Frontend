'use client'
import React, { useState, useEffect } from 'react'
import { 
    FaSearch, FaMapMarkerAlt, FaTimes, 
    FaUserCircle, FaCheckCircle, FaUserNurse, FaExchangeAlt, 
    FaPhoneAlt, FaReceipt, FaRoute, FaClipboardList, FaMapPin,
    FaHospital, FaBed, FaSyncAlt, FaFileMedical, FaClock
} from 'react-icons/fa'
import { toast, Toaster } from 'react-hot-toast'
import NurseAPI from '@/app/services/NurseAPI'

export default function TrackNursePage() {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // Track Live Modal states
    const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
    const [liveTracking, setLiveTracking] = useState(null);
    const [trackingLoading, setTrackingLoading] = useState(false);

    // Reassign Modal states
    const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
    const [targetBooking, setTargetBooking] = useState(null);
    const [availableStaff, setAvailableStaff] = useState([]);
    const [reassignLoading, setReassignLoading] = useState(false);

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002';

    const formatImagePath = (path) => {
        if (!path) return null;
        if (typeof path === 'string' && (path.startsWith('blob') || path.startsWith('http') || path.startsWith('https'))) return path;
        const cleanPath = String(path).replace(/^public[\\/]/, '').replace(/\\/g, '/'); 
        return `${BACKEND_URL}/${cleanPath}`;
    };

    // Fetch active bookings
    const fetchBookingsToTrack = async () => {
        setLoading(true);
        try {
            const res = await NurseAPI.getBookings('Assigned');
            if (res.success) {
                setBookings(res.data || []);
                setFilteredBookings(res.data || []);
            } else {
                toast.error("Failed to retrieve tracking data.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while fetching bookings.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookingsToTrack();
    }, []);

    // Filter search list
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (!val.trim()) {
            setFilteredBookings(bookings);
            return;
        }
        const filtered = bookings.filter(b => 
            (b.bookingId && b.bookingId.toLowerCase().includes(val.toLowerCase())) ||
            (b.bookingIdCustom && b.bookingIdCustom.toLowerCase().includes(val.toLowerCase())) ||
            (b.assignedStaffId && b.assignedStaffId.name && b.assignedStaffId.name.toLowerCase().includes(val.toLowerCase())) ||
            (b.assignedStaff && b.assignedStaff.name && b.assignedStaff.name.toLowerCase().includes(val.toLowerCase())) ||
            (b.assignedStaff && b.assignedStaff.staffName && b.assignedStaff.staffName.toLowerCase().includes(val.toLowerCase()))
        );
        setFilteredBookings(filtered);
    };

    // Open Live Tracker (API 5.3)
    const openLiveTracker = async (bookingId) => {
        setTrackingLoading(true);
        setLiveTracking(null);
        setIsTrackModalOpen(true);
        try {
            const res = await NurseAPI.trackLiveNurse(bookingId);
            if (res.success) {
                setLiveTracking(res.data);
            } else {
                toast.error(res.message || "Failed to load tracking details.");
                setIsTrackModalOpen(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error retrieving tracking data.");
            setIsTrackModalOpen(false);
        } finally {
            setTrackingLoading(false);
        }
    };

    // Open Staff Reassignment UI
    const openReassignment = async (booking) => {
        setTargetBooking(booking);
        setReassignLoading(true);
        setIsReassignModalOpen(true);
        try {
            const res = await NurseAPI.getAvailableStaff();
            if (res.success) {
                setAvailableStaff(res.data || []);
            } else {
                toast.error("Failed to retrieve available staff list.");
                setIsReassignModalOpen(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error fetching available staff.");
            setIsReassignModalOpen(false);
        } finally {
            setReassignLoading(false);
        }
    };

    // Process Reassignment (API 4.4)
    const handleReassignStaff = async (staffId) => {
        if (!targetBooking || !staffId) return;
        setReassignLoading(true);
        try {
            const payload = {
                bookingId: targetBooking._id || targetBooking.bookingId,
                newStaffId: staffId
            };
            const res = await NurseAPI.reassignStaffToBooking(payload);
            if (res.success) {
                toast.success(res.message || "Staff reassigned successfully.");
                setIsReassignModalOpen(false);
                setIsTrackModalOpen(false); 
                fetchBookingsToTrack(); 
            } else {
                toast.error(res.message || "Reassignment transaction failed.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to reassign staff member.");
        } finally {
            setReassignLoading(false);
        }
    };

    // Reassignment trigger launched from within Live Tracking modal
    const handleReassignFromTrackerModal = (trackerData) => {
        setIsTrackModalOpen(false);
        openReassignment({
            _id: trackerData.bookingId,
            bookingId: trackerData.bookingIdCustom || trackerData.bookingId,
            assignedStaff: trackerData.assignedStaff
        });
    };

    return (
        <div className="bg-[#F8FAFC] min-h-screen font-sans p-6 md:p-10 text-slate-900">
            <Toaster position="top-right" />
            
            {/* Top Bar Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 text-[#08B36A] font-black text-[11px] uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 mb-2">
                        <span className="w-2 h-2 rounded-full bg-[#08B36A] animate-ping" />
                        Live Field Staff Monitor
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        Track & Reassign <span className="text-[#08B36A]">Nurses</span>
                    </h1>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search Order ID / Nurse..." 
                            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 outline-none focus:border-[#08B36A] focus:ring-2 focus:ring-emerald-100 shadow-xs text-xs font-semibold"
                        />
                    </div>
                    <button 
                        type="button"
                        onClick={fetchBookingsToTrack}
                        className="bg-white hover:bg-emerald-50 text-[#08B36A] font-black px-5 py-3 rounded-2xl text-xs uppercase tracking-wider border border-emerald-200 flex items-center gap-2 transition-all shadow-xs shrink-0 cursor-pointer"
                    >
                        <FaSyncAlt className={loading ? "animate-spin" : ""} size={12} />
                        <span>Sync</span>
                    </button>
                </div>
            </div>

            {/* Tracking Table Container */}
            <div className="bg-white rounded-[2rem] border border-slate-200/90 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
                        <div className="w-10 h-10 border-4 border-[#08B36A] border-t-transparent rounded-full animate-spin" />
                        <span className="font-bold text-xs uppercase tracking-wider">Fetching live operations...</span>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <FaUserNurse size={48} className="text-slate-200 mb-3" />
                        <span className="font-bold text-xs uppercase tracking-wider">No active field orders found</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/60">
                                    <th className="px-7 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">#</th>
                                    <th className="px-7 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Booking ID</th>
                                    <th className="px-7 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Assigned Staff</th>
                                    <th className="px-7 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Location Type</th>
                                    <th className="px-7 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Schedule</th>
                                    <th className="px-7 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {filteredBookings.map((item, idx) => {
                                    const assignedNurseName = item.assignedStaff?.name || item.assignedStaff?.staffName || item.assignedStaffId?.name || "Unassigned";
                                    const assignedNursePhone = item.assignedStaff?.phone || item.assignedStaff?.staffPhone || item.assignedStaffId?.phone || "No phone";
                                    const assignedNursePic = item.assignedStaff?.profilePic || item.assignedStaff?.staffProfilePic || item.assignedStaffId?.profilePic || null;
                                    const isHospital = item.assessmentLocation === "At Hospital" || !!item.hospitalDetails;
                                    
                                    return (
                                        <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-7 py-5 text-slate-400 font-bold">{idx + 1}</td>
                                            <td className="px-7 py-5 font-mono font-bold text-slate-900">
                                                {item.bookingIdCustom || item.bookingId || "N/A"}
                                            </td>
                                            <td className="px-7 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-slate-100 rounded-xl border border-slate-200/80 overflow-hidden flex items-center justify-center text-slate-400 shadow-xs shrink-0">
                                                        {assignedNursePic ? (
                                                            <img 
                                                                src={formatImagePath(assignedNursePic)} 
                                                                alt="Avatar" 
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <FaUserCircle size={20} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900">{assignedNurseName}</div>
                                                        <div className="text-[10px] text-[#08B36A] font-extrabold">{assignedNursePhone}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-7 py-5">
                                                <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                                                    isHospital 
                                                        ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                                        : 'bg-emerald-50 text-[#08B36A] border-emerald-200'
                                                }`}>
                                                    {isHospital ? <FaHospital size={9} /> : <FaMapMarkerAlt size={9} />}
                                                    {isHospital ? "Hospital Care" : "Home Care"}
                                                </span>
                                            </td>
                                            <td className="px-7 py-5 font-medium text-slate-600">
                                                <span className="font-bold text-slate-800 block">
                                                    {item.schedule?.startDate ? new Date(item.schedule.startDate).toLocaleDateString() : 'N/A'}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">{item.schedule?.duration || ''}</span>
                                            </td>
                                            <td className="px-7 py-5 text-right">
                                                <button 
                                                    type="button"
                                                    onClick={() => openLiveTracker(item._id)}
                                                    className="inline-flex items-center gap-1.5 bg-[#08B36A] hover:bg-[#079c5c] text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm shadow-emerald-600/20 active:scale-95 cursor-pointer"
                                                >
                                                    <FaMapMarkerAlt size={10} /> Track Live
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* LIVE TRACKING & FULL INFO MODAL */}
            {isTrackModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
                    <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in duration-300 border border-slate-100 my-auto max-h-[90vh] flex flex-col">
                        
                        {/* Modal Header */}
                        <div className="p-6 sm:p-8 pb-4 flex justify-between items-center border-b border-slate-100 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-50 p-3 rounded-2xl text-[#08B36A] border border-emerald-100">
                                    <FaUserNurse size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Field Operations Monitor</h2>
                                        <span className="bg-[#08B36A] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                                            {liveTracking?.status || 'Active'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 font-mono mt-0.5">Order Ref: {liveTracking?.bookingIdCustom || liveTracking?.bookingId || 'Loading...'}</p>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setIsTrackModalOpen(false)} 
                                className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2.5 rounded-full transition-colors cursor-pointer"
                            >
                                <FaTimes size={16} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        {trackingLoading ? (
                            <div className="p-20 flex flex-col items-center justify-center gap-3">
                                <div className="w-10 h-10 border-4 border-[#08B36A] border-t-transparent rounded-full animate-spin" />
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Syncing GPS & Live Tracking State...</p>
                            </div>
                        ) : liveTracking ? (
                            <div className="overflow-y-auto p-6 sm:p-8 space-y-6 flex-1 scrollbar-none">
                                
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    
                                    {/* Left Column (7/12) - Staff & Timeline Tracker */}
                                    <div className="lg:col-span-7 space-y-5 border-r border-slate-100 lg:pr-6">
                                        
                                        {/* Assigned Field Nurse Card */}
                                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                                Dispatched Nursing Officer
                                            </span>

                                            {liveTracking.assignedStaff ? (
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3.5">
                                                        <div className="w-13 h-13 bg-white rounded-2xl flex items-center justify-center text-slate-300 border border-slate-200 shadow-xs overflow-hidden shrink-0">
                                                            {liveTracking.assignedStaff.profilePic || liveTracking.assignedStaff.staffProfilePic ? (
                                                                <img 
                                                                    src={formatImagePath(liveTracking.assignedStaff.profilePic || liveTracking.assignedStaff.staffProfilePic)} 
                                                                    className="w-full h-full object-cover" 
                                                                    alt="Staff"
                                                                />
                                                            ) : (
                                                                <FaUserCircle size={36} />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-900 text-sm">{liveTracking.assignedStaff.name || liveTracking.assignedStaff.staffName}</p>
                                                            <p className="text-slate-500 text-xs font-semibold">{liveTracking.assignedStaff.phone || liveTracking.assignedStaff.staffPhone || 'No Phone Registered'}</p>
                                                            <span className="inline-block text-[9px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full uppercase tracking-wider mt-1">
                                                                {liveTracking.assignedStaff.status || liveTracking.assignedStaff.staffStatus || 'On Job'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="font-black text-amber-700 text-xs">No Staff Assigned</p>
                                                        <p className="text-[10px] text-slate-400">Allocate a nurse to initiate live tracking.</p>
                                                    </div>
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleReassignFromTrackerModal(liveTracking)}
                                                        className="bg-[#08B36A] text-white font-black px-3.5 py-2 rounded-xl text-[10px] uppercase tracking-wider hover:bg-[#079c5c] transition-all cursor-pointer"
                                                    >
                                                        Assign Staff
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Tracking Distance / Duration Metrics */}
                                        {liveTracking.trackingMetrics && (
                                            <div className="grid grid-cols-2 gap-3.5">
                                                <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 flex items-center gap-3">
                                                    <div className="p-2.5 rounded-xl bg-white text-[#08B36A] shadow-xs">
                                                        <FaRoute size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Est. Distance</p>
                                                        <p className="text-sm font-black text-slate-900 mt-0.5">{liveTracking.trackingMetrics.distance || 'In Proximity'}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 flex items-center gap-3">
                                                    <div className="p-2.5 rounded-xl bg-white text-[#08B36A] shadow-xs">
                                                        <FaClock size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">ETA Duration</p>
                                                        <p className="text-sm font-black text-slate-900 mt-0.5">{liveTracking.trackingMetrics.eta || 'On Schedule'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Interactive Progress Timeline */}
                                        <div className="pt-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Live Service Progress</p>
                                            <div className="space-y-0 pl-1">
                                                <TimelineItem 
                                                    title="Nurse Assigned" 
                                                    desc="Staff allocation verified and confirmed." 
                                                    isCompleted={!!liveTracking.progress?.isAssigned || !!liveTracking.assignedStaff} 
                                                />
                                                <TimelineItem 
                                                    title="On the Way" 
                                                    desc="Nurse is in transit to patient destination." 
                                                    isCompleted={!!liveTracking.progress?.isOnWay || liveTracking.status === "On the way"} 
                                                />
                                                <TimelineItem 
                                                    title="Arrived at Location" 
                                                    desc="Staff reached bedside / address." 
                                                    isCompleted={!!liveTracking.progress?.isArrived || liveTracking.status === "Arrived"} 
                                                    showBadge={liveTracking.status === "Arrived"}
                                                />
                                                <TimelineItem 
                                                    title="Service Commenced" 
                                                    desc="Clinical procedure in progress." 
                                                    isCompleted={!!liveTracking.progress?.isStarted || liveTracking.status === "Service-Started" || liveTracking.status === "In Progress"} 
                                                />
                                                <TimelineItem 
                                                    title="Service Completed" 
                                                    desc="Care session safely completed and closed." 
                                                    isCompleted={!!liveTracking.progress?.isCompleted || liveTracking.status === "Completed"} 
                                                    isLast={true} 
                                                />
                                            </div>
                                        </div>

                                        {/* Live Clinical Notes */}
                                        {liveTracking.serviceNotes && (
                                            <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/80 space-y-1">
                                                <div className="flex items-center gap-1.5 text-amber-800 font-black text-[10px] uppercase tracking-wider">
                                                    <FaFileMedical size={12} />
                                                    <span>Live Clinical Notes</span>
                                                </div>
                                                <p className="text-xs text-amber-950 font-medium leading-relaxed">
                                                    {liveTracking.serviceNotes}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Column (5/12) - Patient & Location Specs */}
                                    <div className="lg:col-span-5 space-y-5">
                                        
                                        {/* LOCATION SPEC: HOSPITAL BEDSIDE OR HOME ADDRESS */}
                                        {liveTracking.assessmentLocation === "At Hospital" || liveTracking.hospitalDetails ? (
                                            <div className="bg-purple-50/60 rounded-2xl p-5 border border-purple-200/80 space-y-3">
                                                <div className="flex items-center gap-2 text-purple-900">
                                                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
                                                        <FaHospital size={14} />
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider block">Hospital Care Location</span>
                                                        <p className="font-black text-sm text-slate-900">
                                                            {liveTracking.hospitalDetails?.hospitalName || "Hospital Bedside"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-purple-200/50 text-xs">
                                                    <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Ward / Section</span>
                                                        <span className="font-black text-slate-900">{liveTracking.hospitalDetails?.wardName || "General Ward"}</span>
                                                    </div>
                                                    <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Bed Number</span>
                                                        <span className="font-black text-purple-700">{liveTracking.hospitalDetails?.bedNumber || "Bed N/A"}</span>
                                                    </div>
                                                </div>

                                                {liveTracking.hospitalDetails?.floorNumber && (
                                                    <p className="text-[11px] font-medium text-slate-600">
                                                        Floor: <span className="font-bold">{liveTracking.hospitalDetails.floorNumber}</span> • {liveTracking.hospitalDetails.hospitalAddress || ''}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-2">
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <FaMapMarkerAlt className="text-[#08B36A]" size={13} />
                                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Home Service Destination</span>
                                                </div>
                                                <p className="text-xs font-bold text-slate-800 leading-relaxed">
                                                    {liveTracking.address?.houseNo}, {liveTracking.address?.sector}
                                                    {liveTracking.address?.landmark && `, Landmark: ${liveTracking.address.landmark}`}
                                                </p>
                                                <p className="text-[11px] text-slate-500 font-medium">
                                                    {liveTracking.address?.city}, {liveTracking.address?.state} - {liveTracking.address?.pincode}
                                                </p>
                                            </div>
                                        )}

                                        {/* Patient Details */}
                                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300 border border-slate-200 overflow-hidden shrink-0">
                                                    {liveTracking.patientDetails?.patientProfilePic ? (
                                                        <img 
                                                            src={formatImagePath(liveTracking.patientDetails.patientProfilePic)} 
                                                            className="w-full h-full object-cover" 
                                                            alt="Patient"
                                                        />
                                                    ) : (
                                                        <FaUserCircle size={24} />
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Patient Name</span>
                                                    <p className="text-sm font-black text-slate-900">{liveTracking.patientDetails?.patientName || 'Registered Patient'}</p>
                                                    <p className="text-xs text-slate-500 font-semibold">{liveTracking.patientDetails?.patientPhone || 'No Contact Record'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Service Details Card */}
                                        <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 border border-slate-800">
                                            <div>
                                                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-[#08B36A] border border-white/10">
                                                    {liveTracking.bookingType || 'Nursing'} Service
                                                </span>
                                                <h4 className="font-black text-sm text-white mt-1.5">{liveTracking.serviceDetails?.title || 'Clinical Care Visit'}</h4>
                                                <p className="text-[11px] text-slate-400 mt-0.5">Mode: {liveTracking.serviceDetails?.type || liveTracking.serviceDetails?.duration || 'Standard Session'}</p>
                                            </div>
                                            
                                            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                                                <span className="text-slate-400">Total Booking Value</span>
                                                <span className="font-black text-base text-[#08B36A]">₹{liveTracking.serviceDetails?.basePrice || liveTracking.totalPrice || 0}</span>
                                            </div>
                                        </div>

                                    </div>

                                </div>

                            </div>
                        ) : (
                            <div className="p-8 text-center text-xs text-slate-400 font-semibold">Failed to retrieve tracking metrics.</div>
                        )}

                        {/* Modal Footer */}
                        <div className="p-6 sm:p-8 pt-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
                            {liveTracking?.assignedStaff && (
                                <button 
                                    type="button"
                                    onClick={() => handleReassignFromTrackerModal(liveTracking)}
                                    className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                                >
                                    <FaExchangeAlt size={11} /> Reassign Staff
                                </button>
                            )}
                            <button 
                                type="button"
                                onClick={() => setIsTrackModalOpen(false)}
                                className="px-6 py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* REASSIGN STAFF MODAL */}
            {isReassignModalOpen && targetBooking && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative p-6 sm:p-8 animate-in zoom-in duration-300 border border-slate-100">
                        <div className="flex justify-between items-center mb-5">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">Reassign Staff</h3>
                                <p className="text-xs text-slate-400 font-mono mt-0.5">Order Ref: {targetBooking.bookingId}</p>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setIsReassignModalOpen(false)} 
                                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <FaTimes size={18} />
                            </button>
                        </div>

                        {reassignLoading ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-3">
                                <div className="w-8 h-8 border-4 border-[#08B36A] border-t-transparent rounded-full animate-spin" />
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Processing staff query...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-xs">
                                    <span className="font-bold text-slate-400 uppercase text-[10px] block">Currently Assigned</span>
                                    <p className="text-sm font-black text-slate-900 mt-0.5">
                                        {targetBooking.assignedStaff?.staffName || targetBooking.assignedStaff?.name || targetBooking.assignedStaffId?.name || "No Staff Assigned"}
                                    </p>
                                </div>

                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                    Select Available Staff
                                </span>
                                
                                {availableStaff.length === 0 ? (
                                    <p className="text-xs text-rose-500 font-bold italic py-4">No available nursing staff right now.</p>
                                ) : (
                                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-none">
                                        {availableStaff.map((staff) => (
                                            <div 
                                                key={staff._id}
                                                className="flex justify-between items-center p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-[#08B36A] hover:bg-emerald-50/20 transition-all cursor-pointer group"
                                                onClick={() => handleReassignStaff(staff._id)}
                                            >
                                                <div>
                                                    <p className="font-black text-slate-900 text-xs group-hover:text-[#08B36A]">{staff.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-semibold">{staff.phone || 'No phone'}</p>
                                                </div>
                                                <span className="text-[10px] bg-emerald-50 text-[#08B36A] border border-emerald-200 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                                                    Assign
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Timeline Item Sub-Component
function TimelineItem({ title, desc, isCompleted = false, isLast = false, showBadge = false }) {
    return (
        <div className="flex gap-4 relative">
            {!isLast && (
                <div className={`absolute left-[11px] top-[24px] bottom-0 w-[2px] ${isCompleted ? 'bg-[#08B36A]' : 'bg-slate-200'}`} />
            )}
            
            <div className="z-10 bg-white py-1 shrink-0">
                {isCompleted ? (
                    <FaCheckCircle className="text-[#08B36A]" size={22} />
                ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 ml-0.5" />
                )}
            </div>

            <div className="pb-6 flex-1">
                <p className={`font-black text-xs transition-colors ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>{title}</p>
                <p className={`text-[11px] leading-relaxed ${isCompleted ? 'text-slate-500' : 'text-slate-300'}`}>{desc}</p>
                {showBadge && (
                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-[#08B36A] px-2 py-0.5 rounded-full border border-emerald-200 mt-1.5">
                         <div className="w-1.5 h-1.5 bg-[#08B36A] rounded-full animate-ping" />
                         <span className="text-[9px] font-black uppercase tracking-widest">Live Now</span>
                    </div>
                )}
            </div>
        </div>
    );
}