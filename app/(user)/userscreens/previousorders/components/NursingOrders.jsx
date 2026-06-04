"use client";
import UserAPI from '@/app/services/UserAPI';
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom'; // Required for screen centering

import {
    FiX, FiStar, FiArrowLeft, FiClock,
    FiUser, FiAward, FiDownload, FiRefreshCw,
    FiSearch, FiMapPin, FiActivity, FiLoader
} from 'react-icons/fi';
import { MdVerified, MdOutlineMedicalServices } from 'react-icons/md';

// --- SUB-COMPONENT: TRACKER ---
const StatusStepper = ({ status }) => {
    const steps = ["Pending", "Confirmed", "Assigned", "In-Service"];
    const statusMap = { "Pending": 0, "Confirmed": 1, "Assigned": 2, "Completed": 3 };
    const currentStep = statusMap[status] ?? 0;

    return (
        <div className="w-full py-4 md:py-10 px-1 md:px-4">
            <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 -z-10"></div>
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500 transition-all duration-1000 z-10"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                ></div>
                {steps.map((step, index) => (
                    <div key={step} className="flex flex-col items-center gap-1.5 md:gap-2.5 relative z-20">
                        <div className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 transition-all duration-500 ${index <= currentStep ? "bg-emerald-500 border-emerald-100 ring-2 md:ring-4 ring-emerald-50" : "bg-white border-slate-200"
                            }`}></div>
                        <span className={`text-[7.5px] md:text-[9px] font-black uppercase tracking-tighter md:tracking-[0.15em] whitespace-nowrap ${index <= currentStep ? "text-slate-900" : "text-slate-400"
                            }`}>{step}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: STAR RATER ---
const StarRating = ({ title, onBack, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-4 md:py-6">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase mb-6 md:mb-8 hover:text-emerald-600 transition-colors mx-auto"><FiArrowLeft /> Back to Profile</button>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2 tracking-tight">Rate Provider</h3>
            <p className="text-slate-500 text-xs md:text-sm mb-6 md:mb-10 font-medium">How was your session with {title}?</p>
            <div className="flex justify-center gap-2.5 md:gap-4 mb-8 md:mb-12">
                {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => setRating(s)} className="transform transition-transform active:scale-90">
                        <FiStar className={`${(hover || rating) >= s ? "fill-amber-400 text-amber-400 drop-shadow-md" : "text-slate-100"} transition-all size-8 sm:size-10 md:size-11`} />
                    </button>
                ))}
            </div>
            <button
                disabled={rating === 0}
                onClick={() => onSubmit(rating)}
                className={`w-full py-4 md:py-5 rounded-xl md:rounded-[24px] font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all ${rating > 0 ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
            >
                Submit Review
            </button>
        </div>
    );
};

function NursingOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [modal, setModal] = useState({ isOpen: false, type: 'details', data: null });
    const [mounted, setMounted] = useState(false);

    // 1. Handle Mounting for Portals
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // 2. Prevent body scroll when modal is open
    useEffect(() => {
        if (modal.isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [modal.isOpen]);

    // Fetch Data
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await UserAPI.getNursingBookings();
                if (response.success) {
                    setOrders(response.data);
                }
            } catch (error) {
                console.error("Error loading nursing bookings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Confirmed': return 'text-blue-600 bg-blue-50';
            case 'Assigned': return 'text-emerald-600 bg-emerald-50';
            case 'Pending': return 'text-amber-600 bg-amber-50';
            default: return 'text-slate-500 bg-slate-50';
        }
    };

    const filteredOrders = orders.filter(order =>
        order.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.nurseId?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- MODAL PORTAL COMPONENT ---
    const NursingDetailsModal = ({ data, type, onClose }) => {
        if (!mounted) return null;

        return createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 md:p-6">
                {/* Backdrop */}
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
                    onClick={onClose}
                />

                {/* Modal Card */}
                <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.5)] overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 fade-in duration-300">

                    {/* Header */}
                    <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 shadow-sm border border-emerald-100">
                                <MdOutlineMedicalServices size={20} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 text-sm md:text-base tracking-tight uppercase">Case File: {data.bookingId}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nursing Service Record</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 rounded-full transition-all text-slate-400 shrink-0 shadow-sm"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                        {type === 'details' ? (
                            <div className="space-y-8">
                                {/* Provider Profile */}
                                <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start">
                                    <div className="relative shrink-0">
                                        <img
                                            src={`https://your-api-domain.com/${data.nurseId?.profileImage}`}
                                            className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] md:rounded-[3rem] object-cover ring-8 ring-slate-50 shadow-md"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/200'}
                                            alt=""
                                        />
                                        <div className="absolute -bottom-2 -right-2 bg-white shadow-xl p-2 rounded-2xl">
                                            <div className="bg-emerald-500 text-white p-2 rounded-xl text-sm"><FiActivity /></div>
                                        </div>
                                    </div>
                                    <div className="text-center md:text-left flex-1">
                                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 leading-tight flex items-center gap-2 justify-center md:justify-start">
                                            {data.nurseId?.name} <MdVerified className="text-blue-500" />
                                        </h2>
                                        <p className="text-emerald-600 font-black uppercase text-[10px] tracking-[0.2em] mb-6">Verified Healthcare Professional</p>
                                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                            <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
                                                <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5 tracking-widest">Service Type</p>
                                                <p className="text-xs font-black text-slate-900 uppercase">{data.serviceDetails.title}</p>
                                            </div>
                                            <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
                                                <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5 tracking-widest">Session</p>
                                                <p className="text-xs font-black text-slate-900 uppercase">{data.serviceDetails.duration}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Live Progress */}
                                <div className="pt-4">
                                    <h4 className="font-black text-[10px] uppercase tracking-[0.25em] text-slate-400 mb-2 px-1">Live Progress</h4>
                                    <StatusStepper status={data.status} />
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1"><FiUser className="text-emerald-500" /> Patient Info</h4>
                                        {data.patients?.map((patient, i) => (
                                            <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <p className="font-black text-slate-800 text-sm">{patient.name}</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">{patient.relation} • {patient.gender}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1"><FiMapPin className="text-emerald-500" /> Service Location</h4>
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-xs font-bold text-slate-600 leading-relaxed">
                                                {data.address.houseNo}, {data.address.sector}, {data.address.city}, {data.address.state} - {data.address.pincode}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Bar */}
                                <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                                    <button 
                                        onClick={() => setModal(prev => ({ ...prev, type: 'rating' }))} 
                                        className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    >
                                        <FiStar size={14} /> Rate Service
                                    </button>
                                    <button className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                        <FiDownload size={14} /> Download Receipt
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <StarRating
                                title={data?.nurseId?.name}
                                onBack={() => setModal(prev => ({ ...prev, type: 'details' }))}
                                onSubmit={(s) => {
                                    alert(`Submitted ${s} stars for ${data?.bookingId}`);
                                    onClose();
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    return (
        <div className="bg-white border border-slate-200 rounded-[24px] md:rounded-[32px] overflow-hidden shadow-sm animate-fadeIn">
            {/* Header */}
            <div className="p-5 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="font-black text-slate-900 text-lg md:text-xl tracking-tight">Service Registry</h3>
                    <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Nursing & Professional Care</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search provider..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-11 pr-4 text-xs md:text-sm font-semibold outline-none ring-1 ring-slate-100 focus:ring-emerald-500 transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <FiLoader className="text-emerald-500 animate-spin" size={28} />
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Syncing Records...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs font-medium">No booking history recorded.</div>
            ) : (
                <>
                    {/* Desktop View */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">ID</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Provider</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Service</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Cost</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6 text-xs font-bold text-slate-400 tracking-tighter">#{order.bookingId}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 shadow-sm border-2 border-white">
                                                    <img src={`https://your-api-domain.com/${order.nurseId?.profileImage}`} className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/100'} alt="" />
                                                </div>
                                                <p className="text-sm font-black text-slate-800 leading-none">{order.nurseId?.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-xs font-bold text-slate-600">{order.serviceDetails.title}</td>
                                        <td className="px-8 py-6 text-xs font-bold text-slate-800">{order.schedule.startDate ? new Date(order.schedule.startDate).toLocaleDateString() : 'N/A'}</td>
                                        <td className="px-8 py-6 text-sm font-black text-slate-900">₹{order.priceBreakdown.totalPrice}</td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}>{order.status}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button onClick={() => setModal({ isOpen: true, type: 'details', data: order })} className="px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-white border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white transition-all">Details</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View */}
                    <div className="block lg:hidden divide-y divide-slate-100 px-4">
                        {filteredOrders.map((order) => (
                            <div key={order._id} className="py-5 flex flex-col gap-3.5">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0"><img src={`https://your-api-domain.com/${order.nurseId?.profileImage}`} className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/100'} alt="" /></div>
                                        <div>
                                            <span className="text-[10px] font-black text-slate-400">#{order.bookingId}</span>
                                            <h4 className="text-sm font-black text-slate-800 mt-0.5">{order.nurseId?.name}</h4>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${getStatusStyle(order.status)}`}>{order.status}</span>
                                </div>
                                <button onClick={() => setModal({ isOpen: true, type: 'details', data: order })} className="w-full bg-white border border-slate-200 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center shadow-sm">Details</button>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* --- Portal Modal --- */}
            {modal.isOpen && modal.data && (
                <NursingDetailsModal 
                    data={modal.data} 
                    type={modal.type}
                    onClose={() => setModal({ isOpen: false, type: 'details', data: null })} 
                />
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
}

export default NursingOrders;