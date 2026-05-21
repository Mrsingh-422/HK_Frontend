"use client";
import React, { useState, useEffect } from "react";
// React Icons
import { 
    HiOutlinePhone, 
    HiOutlineLocationMarker, 
    HiStar, 
    HiOutlineClock, 
    HiChevronDown, 
    HiChevronUp,
    HiShieldCheck
} from "react-icons/hi";
import { FiTruck, FiUser, FiInfo, FiAlertCircle } from "react-icons/fi";
import { MdVerified, MdTimeline, MdTag } from "react-icons/md";
import UserAPI from "@/app/services/UserAPI";

function AmbulanceBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTrackingId, setActiveTrackingId] = useState(null);

    // --- Fetch Data ---
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await UserAPI.myAmbulanceBooking();
                if (res.success) {
                    setBookings(res.data || []);
                } else {
                    setError(res.message || "Failed to load bookings");
                }
            } catch (err) {
                setError("An error occurred while fetching bookings.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case "Confirmed": return "bg-green-100 text-green-700 border-green-200";
            case "Completed": 
            case "Delivered": return "bg-blue-100 text-blue-700 border-blue-200";
            case "Cancelled": return "bg-red-100 text-red-700 border-red-200";
            case "Searching": return "bg-yellow-100 text-yellow-700 border-yellow-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-10 h-10 border-4 border-[#08b36a] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md w-full">
                    <div className="bg-red-50 text-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FiAlertCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h3>
                    <p className="text-gray-500 text-sm mb-6">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="w-full bg-[#08b36a] text-white py-3 rounded-xl font-bold shadow-md transition-all active:scale-98 hover:bg-[#069656]"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                            Ambulance Bookings <MdVerified className="text-[#08b36a]" />
                        </h1>
                        <p className="text-gray-500 mt-1">Manage your emergency transport and equipment details.</p>
                    </div>
                    <div className="text-left sm:text-right">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Records</span>
                        <p className="text-[#08b36a] font-bold">{bookings.length} Dispatches Found</p>
                    </div>
                </div>

                {/* EMPTY STATE */}
                {bookings.length === 0 && (
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                        <div className="bg-gray-50 text-gray-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FiTruck size={32} />
                        </div>
                        <p className="text-gray-700 font-bold text-lg">No bookings found</p>
                        <p className="text-gray-400 text-sm max-w-xs mx-auto mt-1">You haven't requested any emergency dispatch operations yet.</p>
                    </div>
                )}

                {/* BOOKINGS LIST */}
                <div className="space-y-8">
                    {bookings.map((item) => (
                        <div key={item._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">

                            {/* TOP STRIP */}
                            <div className="bg-gray-50 px-6 py-3 flex flex-wrap justify-between items-center border-b border-gray-100 gap-2">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {item.bookingId}</span>
                                    <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(item.status)}`}>
                                        {item.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                    <HiOutlineClock className="text-[#08b36a]" /> 
                                    {item.scheduledAt ? new Date(item.scheduledAt).toLocaleDateString() : new Date(item.createdAt).toLocaleDateString()}
                                    {item.scheduledTime && <span className="text-gray-400">({item.scheduledTime})</span>}
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row">
                                {/* IMAGE CONTAINER */}
                                <div className="w-full md:w-1/3 xl:w-1/4 h-48 md:h-auto shrink-0 relative bg-gray-100 flex items-center justify-center overflow-hidden">
                                    <img
                                        src={item.serviceType === "Referral Ambulance" 
                                            ? "https://www.forcemotors.com/wp-content/uploads/2025/02/Traveller-Ambulance-D-mob-1.png" 
                                            : "https://img.freepik.com/premium-vector/ambulance-vector-design-white-background_1120557-12349.jpg"
                                        }
                                        alt="Ambulance Equipment Type"
                                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 left-3 bg-[#08b36a] text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                        {item.ambulanceId?.vehicleType || "Standard"}
                                    </div>
                                    {item.ambulanceId?.vehicleNumber && (
                                        <div className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider">
                                            {item.ambulanceId.vehicleNumber}
                                        </div>
                                    )}
                                </div>

                                {/* DETAILS CONTENT */}
                                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                                    <div>
                                        {/* Row Title */}
                                        <div className="flex justify-between items-start mb-3 gap-2">
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-800 tracking-tight leading-tight">
                                                    {item.ambulanceId?.name || "LifeLine Unit"}
                                                </h2>
                                                <p className="text-xs font-semibold text-[#08b36a] mt-0.5 uppercase tracking-wide">
                                                    {item.serviceType} • <span className="text-red-500 font-bold">{item.triageLevel}</span>
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md shrink-0">
                                                <HiStar className="text-yellow-500" />
                                                <span className="font-bold text-yellow-700 text-xs">5.0</span>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-gray-500 text-sm leading-relaxed mb-6 italic bg-gray-50 p-3 rounded-xl border border-gray-100/50">
                                            "{item.patientDetails?.emergencyDescription || item.patientDetails?.referralReason || "Emergency medical dispatch handover protocol active."}"
                                        </p>

                                        {/* INFO GRID */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="bg-green-50 p-2 rounded-xl text-[#08b36a] shrink-0"><FiUser size={18} /></div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Patient</p>
                                                    <p className="text-xs font-bold text-gray-700 truncate">{item.patientDetails?.name || "Unknown Patient"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="bg-green-50 p-2 rounded-xl text-[#08b36a] shrink-0"><FiInfo size={18} /></div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Relation</p>
                                                    <p className="text-xs font-bold text-gray-700 truncate">{item.patientDetails?.relation || "Not Specified"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="bg-green-50 p-2 rounded-xl text-[#08b36a] shrink-0"><HiOutlineLocationMarker size={18} /></div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Destination Facility</p>
                                                    <p className="text-xs font-bold text-gray-700 truncate" title={item.hospitalId?.name}>
                                                        {item.hospitalId?.name || "Emergency Room Center"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* TRACKING TIMELINE SECTION */}
                                    {activeTrackingId === item._id && (
                                        <div className="mb-6 p-5 bg-gray-50/80 rounded-2xl border border-gray-100 transition-all duration-300">
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest flex items-center gap-1.5">
                                                <MdTimeline size={14} className="text-[#08b36a]" /> Dispatch Route Logs
                                            </p>
                                            <div className="space-y-4 pl-1">
                                                {item.trackingTimeline && item.trackingTimeline.length > 0 ? (
                                                    item.trackingTimeline.map((log, idx) => (
                                                        <div key={log._id || idx} className="flex gap-3">
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-2 h-2 rounded-full bg-[#08b36a] ring-4 ring-green-100"></div>
                                                                {idx !== item.trackingTimeline.length - 1 && <div className="w-0.5 h-full bg-gray-200 my-1"></div>}
                                                            </div>
                                                            <div className="-mt-1">
                                                                <p className="text-xs font-bold text-gray-800">{log.status}</p>
                                                                {log.note && <p className="text-[11px] text-gray-500 mt-0.5">{log.note}</p>}
                                                                <p className="text-[9px] text-gray-400 font-medium mt-0.5">
                                                                    {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-gray-400 italic flex items-center gap-1.5 pl-1">
                                                        <HiShieldCheck /> Booking secured. Awaiting transit coordinates updates.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* FOOTER METRICS AND ACTIONS */}
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-5 border-t border-gray-100 gap-4 mt-auto">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Valuation</p>
                                            <p className="text-2xl font-black text-gray-900">
                                                {item.pricing?.total > 0 ? `₹${item.pricing.total}` : "Free Service"}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            {item.ambulanceId?.phone && (
                                                <a
                                                    href={`tel:${item.ambulanceId.phone}`}
                                                    className="flex-1 sm:flex-none border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold text-xs text-center transition-all hover:bg-gray-50 hover:border-gray-300 flex items-center justify-center gap-1.5"
                                                >
                                                    <HiOutlinePhone size={14} className="text-[#08b36a]" />
                                                    Call Unit
                                                </a>
                                            )}
                                            <button 
                                                onClick={() => setActiveTrackingId(activeTrackingId === item._id ? null : item._id)}
                                                className="flex-1 sm:flex-none bg-[#08b36a] hover:bg-[#069656] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                            >
                                                {activeTrackingId === item._id ? <HiChevronUp size={14} /> : <HiChevronDown size={14} />}
                                                Track Logistics
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AmbulanceBookings;