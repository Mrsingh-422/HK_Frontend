'use client'
import React, { useState, useEffect } from 'react'
import { 
    FaSearch, FaMapMarkerAlt, FaTimes, 
    FaUserCircle, FaCheckCircle, FaUserNurse, FaExchangeAlt, 
    FaPhoneAlt, FaReceipt, FaRoute, FaClipboardList, FaMapPin
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
            // Retrieve bookings marked as 'Assigned'
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
            toast.error("Error fetching available providers.");
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

    // Handles reassignment triggers launched from within the Live Tracking modal
    const handleReassignFromTrackerModal = (trackerData) => {
        setIsTrackModalOpen(false);
        openReassignment({
            _id: trackerData.bookingId, // Database object identifier
            bookingId: trackerData.bookingIdCustom || trackerData.bookingId,
            assignedStaff: trackerData.assignedStaff
        });
    };

    return (
        <div className="bg-[#F9FAFB] min-h-screen font-sans p-6 md:p-12">
            <Toaster position="top-right" />
            
            {/* --- TOP BAR --- */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-extrabold text-gray-800">
                    Track & Reassign <span className="text-[#08B36A]">Nurses</span>
                </h1>
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search Order ID / Name..." 
                            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-[#08B36A] shadow-sm text-sm"
                        />
                    </div>
                    <button 
                        onClick={fetchBookingsToTrack}
                        className="bg-green-50 text-[#08B36A] font-bold px-6 py-3 rounded-2xl text-xs uppercase tracking-wider border border-green-100 whitespace-nowrap hover:bg-green-100/50 transition-all"
                    >
                        Sync Dashboard
                    </button>
                </div>
            </div>

            {/* --- TRACKING TABLE --- */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
                        <div className="w-10 h-10 border-4 border-[#08B36A] border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-bold text-sm">Fetching active orders...</span>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <FaUserNurse size={48} className="text-gray-200 mb-3" />
                        <span className="font-bold text-sm">No trackable orders found in system</span>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/30">
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Serial no.</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Order ID</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Assigned Nurse</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Schedule Start</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredBookings.map((item, idx) => {
                                // Maps both list formats (assignedStaffId.name) and detail payloads (assignedStaff.staffName)
                                const assignedNurseName = item.assignedStaffId?.name || item.assignedStaff?.staffName || item.assignedStaff?.name || "Unassigned";
                                const assignedNursePhone = item.assignedStaffId?.phone || item.assignedStaff?.staffPhone || item.assignedStaff?.phone || "No Contact";
                                const assignedNursePic = item.assignedStaffId?.profilePic || item.assignedStaff?.staffProfilePic || null;
                                
                                return (
                                    <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6 text-gray-600 font-medium">{idx + 1}</td>
                                        <td className="px-8 py-6 text-gray-500 text-sm font-mono">
                                            {item.bookingIdCustom || item.bookingId || "N/A"}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-gray-100 rounded-full border border-gray-100 overflow-hidden flex items-center justify-center text-gray-400 shadow-sm">
                                                    {assignedNursePic ? (
                                                        <img 
                                                            src={formatImagePath(assignedNursePic)} 
                                                            alt="Nurse Avatar" 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <FaUserCircle size={22} />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-[#1e40af]">{assignedNurseName}</div>
                                                    <div className="text-[10px] text-[#08B36A] mt-0.5 font-bold">{assignedNursePhone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 font-medium text-gray-600">
                                            {item.schedule?.startDate ? new Date(item.schedule.startDate).toLocaleDateString() : 'N/A'}
                                            <span className="block text-[10px] text-gray-400 mt-0.5">{item.schedule?.duration || ''}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button 
                                                onClick={() => openLiveTracker(item._id)}
                                                className="flex items-center gap-2 bg-[#08B36A] hover:bg-[#069a5a] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-green-100"
                                            >
                                                <FaMapMarkerAlt size={12} /> Track
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* --- WEB-STYLE LIVE TRACKING & FULL INFO MODAL --- */}
            {isTrackModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-5xl rounded-[32px] shadow-2xl overflow-hidden relative animate-in zoom-in duration-300">
                        
                        {/* Modal Header */}
                        <div className="p-8 pb-4 flex justify-between items-center border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-50 p-2 rounded-xl text-[#08B36A]">
                                    <FaUserNurse size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-800 tracking-tight">Booking Live Tracker</h2>
                                    <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {liveTracking?.bookingIdCustom || liveTracking?.bookingId || 'Loading...'}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsTrackModalOpen(false)} className="text-gray-300 hover:text-gray-500 transition-colors bg-gray-50 p-2.5 rounded-full">
                                <FaTimes size={18} />
                            </button>
                        </div>

                        {trackingLoading ? (
                            <div className="p-20 flex flex-col items-center justify-center gap-3">
                                <div className="w-10 h-10 border-4 border-[#08B36A] border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-sm text-gray-500 font-bold">Querying live tracking payload...</p>
                            </div>
                        ) : liveTracking ? (
                            <div className="max-h-[70vh] overflow-y-auto p-8 space-y-6">
                                
                                {/* Desktop Split Columns */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    
                                    {/* Left Column (Width: 7/12) - Live Transit Details */}
                                    <div className="lg:col-span-7 space-y-6 border-r border-gray-100 lg:pr-8">
                                        
                                        {/* Dispatched Field Nurse Card */}
                                        <div className="bg-[#FAFBFC] rounded-3xl p-5 border border-gray-100">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Dispatched Field Nurse</p>
                                            {liveTracking.assignedStaff ? (
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-300 border border-gray-100 shadow-sm overflow-hidden">
                                                            {liveTracking.assignedStaff.staffProfilePic ? (
                                                                <img 
                                                                    src={formatImagePath(liveTracking.assignedStaff.staffProfilePic)} 
                                                                    className="w-full h-full object-cover" 
                                                                    alt="Staff avatar"
                                                                />
                                                            ) : (
                                                                <FaUserCircle size={36} />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-800 text-sm">{liveTracking.assignedStaff.staffName}</p>
                                                            <p className="text-gray-400 text-xs">{liveTracking.assignedStaff.staffPhone || 'No phone registered'}</p>
                                                            <p className="text-[9px] bg-blue-50 text-[#1e40af] border border-blue-100 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider w-fit mt-1">
                                                                {liveTracking.assignedStaff.staffStatus || 'Active'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                </div>
                                            ) : (
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                    <div>
                                                        <p className="font-bold text-amber-600 text-sm">No Field Staff Dispatched</p>
                                                        <p className="text-[11px] text-gray-400 mt-0.5">Dispatched staff details are required to monitor live transit progress.</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleAssignFromTracker(liveTracking)}
                                                        className="bg-[#1e40af] text-white font-black px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider hover:bg-[#1e3a8a] transition-all whitespace-nowrap"
                                                    >
                                                        Assign Staff
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Tracking Metrics Bar (Distance & ETA) */}
                                        {liveTracking.trackingMetrics && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-50/80 flex items-center gap-3">
                                                    <div className="p-3 rounded-xl bg-blue-50 text-[#1e40af]">
                                                        <FaRoute size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase text-blue-400 tracking-widest">Est. Distance</p>
                                                        <p className="text-base font-black text-[#1e40af] mt-0.5">{liveTracking.trackingMetrics.distance || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-green-50/40 rounded-2xl p-4 border border-green-50 flex items-center gap-3">
                                                    <div className="p-3 rounded-xl bg-green-50 text-[#08B36A]">
                                                        <FaMapMarkerAlt size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase text-[#08B36A] tracking-widest">Est. Duration (ETA)</p>
                                                        <p className="text-base font-black text-[#08B36A] mt-0.5">{liveTracking.trackingMetrics.eta || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Interactive Tracking Timeline */}
                                        <div className="space-y-0 pl-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Service Timeline Tracker</p>
                                            <TimelineItem 
                                                title="Booking Assigned" 
                                                desc="Staff allocation recorded." 
                                                isCompleted={!!liveTracking.progress?.isAssigned} 
                                            />
                                            <TimelineItem 
                                                title="On the Way" 
                                                desc="Provider is in-transit to patient location." 
                                                isCompleted={!!liveTracking.progress?.isOnWay} 
                                            />
                                            <TimelineItem 
                                                title="Arrived at Location" 
                                                desc="Field nurse arrived at destination." 
                                                isCompleted={!!liveTracking.progress?.isArrived} 
                                                showBadge={!!liveTracking.progress?.isArrived && !liveTracking.progress?.isCompleted}
                                            />
                                            <TimelineItem 
                                                title="Service Commenced" 
                                                desc="Procedure started." 
                                                isCompleted={!!liveTracking.progress?.isStarted} 
                                            />
                                            <TimelineItem 
                                                title="Completed" 
                                                desc="Operational session closed." 
                                                isCompleted={!!liveTracking.progress?.isCompleted} 
                                                isLast={true} 
                                            />
                                        </div>
                                    </div>

                                    {/* Right Column (Width: 5/12) - Client & Booking Profile */}
                                    <div className="lg:col-span-5 space-y-6">
                                        
                                        {/* Patient Details & Info */}
                                        <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4 text-xs">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-300 border border-gray-100 shadow-sm overflow-hidden">
                                                    {liveTracking.patientDetails?.patientProfilePic ? (
                                                        <img 
                                                            src={formatImagePath(liveTracking.patientDetails.patientProfilePic)} 
                                                            className="w-full h-full object-cover" 
                                                            alt="Patient avatar"
                                                        />
                                                    ) : (
                                                        <FaUserCircle size={36} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient Details</p>
                                                    <p className="text-base font-black text-gray-800">{liveTracking.patientDetails?.patientName || 'N/A'}</p>
                                                    <p className="text-gray-500 mt-0.5">{liveTracking.patientDetails?.patientPhone || 'N/A'}</p>
                                                </div>
                                            </div>

                                            <div className="border-t border-gray-200/60 pt-3">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                                    <FaMapMarkerAlt size={10} className="text-[#08B36A]" /> Service Address
                                                </p>
                                                <p className="text-gray-700 font-medium leading-relaxed">
                                                    House No {liveTracking.address?.houseNo}
                                                    {liveTracking.address?.landmark && `, Landmark: ${liveTracking.address.landmark}`}
                                                    <span className="block mt-1 font-bold text-gray-600">{liveTracking.address?.city}, {liveTracking.address?.state} - {liveTracking.address?.pincode}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Service Description Card */}
                                        <div className="border border-gray-100 rounded-3xl p-6 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="bg-blue-50 text-[#1e40af] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-blue-100">
                                                        {liveTracking.bookingType || 'Prescription'} Booking
                                                    </span>
                                                    <h4 className="font-extrabold text-gray-800 text-sm mt-1.5">{liveTracking.serviceDetails?.title || 'Prescription Service'}</h4>
                                                </div>
                                                <span className="text-xs text-gray-400 font-black uppercase tracking-wider">{liveTracking.serviceDetails?.duration || 'Standard'}</span>
                                            </div>
                                            <p className="text-xs text-gray-500">Type: {liveTracking.serviceDetails?.type || 'Standard Care'}</p>
                                            <div className="border-t border-gray-100/80 pt-4 flex justify-between text-xs text-gray-600 font-medium">
                                                <span>Base Price</span>
                                                <span className="font-extrabold text-gray-800 text-base">₹{liveTracking.serviceDetails?.basePrice || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        ) : (
                            <div className="p-8 text-center text-xs text-gray-400">Failed to retrieve tracking metrics.</div>
                        )}

                        {/* Footer Close Actions with Reassign Trigger */}
                        <div className="p-8 pt-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                            {liveTracking?.assignedStaff && (
                                <button 
                                    onClick={() => handleReassignFromTrackerModal(liveTracking)}
                                    className="flex items-center gap-2 px-8 py-4 bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-100"
                                >
                                    <FaExchangeAlt size={12} /> Reassign Staff
                                </button>
                            )}
                            <button 
                                onClick={() => setIsTrackModalOpen(false)}
                                className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-black rounded-2xl text-xs uppercase tracking-wider transition-all"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- REASSIGN STAFF MODAL --- */}
            {isReassignModalOpen && targetBooking && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden relative p-8 animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-800 tracking-tight">Reassign Staff</h3>
                                <p className="text-xs text-gray-400 mt-1">Order Ref: {targetBooking.bookingId}</p>
                            </div>
                            <button onClick={() => setIsReassignModalOpen(false)} className="text-gray-300 hover:text-gray-500 transition-colors">
                                <FaTimes size={24} />
                            </button>
                        </div>

                        {reassignLoading ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-3">
                                <div className="w-8 h-8 border-4 border-[#1e40af] border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-xs text-gray-500 font-bold">Processing reallocation query...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl border border-dashed border-gray-100 bg-gray-50/50 text-xs">
                                    <p className="font-bold text-gray-500">Currently Assigned:</p>
                                    <p className="text-sm font-black text-gray-800 mt-1">
                                        {targetBooking.assignedStaff?.staffName || targetBooking.assignedStaffId?.name || "No staff assigned"}
                                    </p>
                                </div>

                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Select Available Staff</p>
                                
                                {availableStaff.length === 0 ? (
                                    <p className="text-xs text-red-500 italic py-4">No active nursing staff are available right now.</p>
                                ) : (
                                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                                        {availableStaff.map((staff) => (
                                            <div 
                                                key={staff._id}
                                                className="flex justify-between items-center p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#08B36A] hover:bg-green-50/10 transition-all cursor-pointer group"
                                                onClick={() => handleReassignStaff(staff._id)}
                                            >
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm group-hover:text-[#08B36A]">{staff.name}</p>
                                                    <p className="text-[10px] text-gray-400">{staff.phone || 'No phone record'}</p>
                                                </div>
                                                <span className="text-[10px] bg-green-50 text-[#08B36A] border border-green-100 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
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

// Timeline Helper Component
function TimelineItem({ title, desc, isCompleted = false, isLast = false, showBadge = false }) {
    return (
        <div className="flex gap-6 relative">
            {!isLast && (
                <div className={`absolute left-[13px] top-[26px] bottom-0 w-[2px] ${isCompleted ? 'bg-[#08B36A]' : 'bg-gray-100'}`}></div>
            )}
            
            <div className="z-10 bg-white py-1">
                {isCompleted ? (
                    <FaCheckCircle className="text-[#08B36A]" size={26} />
                ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-100 ml-0.5"></div>
                )}
            </div>

            <div className="pb-8 flex-1 flex justify-between items-start">
                <div className="space-y-1">
                    <p className={`font-bold text-sm transition-all ${isCompleted ? 'text-gray-800' : 'text-gray-300'}`}>{title}</p>
                    <p className={`text-[11px] leading-relaxed max-w-[220px] ${isCompleted ? 'text-gray-500' : 'text-gray-300'}`}>{desc}</p>
                    {showBadge && (
                        <div className="inline-flex items-center gap-1.5 bg-green-50 text-[#08B36A] px-2 py-0.5 rounded-full border border-green-100 mt-2">
                             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                             <span className="text-[9px] font-black uppercase tracking-widest">Live Now</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}