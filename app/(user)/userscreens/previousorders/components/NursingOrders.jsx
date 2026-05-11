"use client";
import UserAPI from '@/app/services/UserAPI';
import React, { useState, useEffect } from 'react';
// Import your API service

import {
    FiX, FiStar, FiArrowLeft, FiCheckCircle, FiClock, FiCalendar,
    FiUser, FiAward, FiBriefcase, FiGlobe, FiPhone, FiRefreshCw, FiAlertCircle,
    FiSearch, FiDownload, FiMapPin, FiActivity, FiLoader
} from 'react-icons/fi';
import { MdVerified, MdOutlineMedicalServices } from 'react-icons/md';

// --- SUB-COMPONENT: TRACKER ---
const StatusStepper = ({ status }) => {
    // Mapping API status to step index
    const steps = ["Pending", "Confirmed", "Assigned", "In-Service"];
    const statusMap = { "Pending": 0, "Confirmed": 1, "Assigned": 2, "Completed": 3 };
    const currentStep = statusMap[status] ?? 0;

    return (
        <div className="w-full py-10 px-4">
            <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 -z-10"></div>
                <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500 transition-all duration-1000 z-10" 
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                ></div>
                {steps.map((step, index) => (
                    <div key={step} className="flex flex-col items-center gap-2.5">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-500 ${
                            index <= currentStep ? "bg-emerald-500 border-emerald-100 ring-4 ring-emerald-50" : "bg-white border-slate-200"
                        }`}></div>
                        <span className={`text-[9px] font-bold uppercase tracking-[0.15em] ${
                            index <= currentStep ? "text-slate-900" : "text-slate-400"
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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-6">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase mb-8 hover:text-emerald-600 transition-colors mx-auto"><FiArrowLeft /> Back to Profile</button>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Rate Provider</h3>
            <p className="text-slate-500 text-sm mb-10 font-medium">How was your session with {title}?</p>
            <div className="flex justify-center gap-4 mb-12">
                {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => setRating(s)} className="transform transition-transform active:scale-90">
                        <FiStar size={42} className={`${(hover || rating) >= s ? "fill-amber-400 text-amber-400 drop-shadow-md" : "text-slate-100"} transition-all`} />
                    </button>
                ))}
            </div>
            <button 
                disabled={rating === 0} 
                onClick={() => onSubmit(rating)} 
                className={`w-full py-5 rounded-[24px] font-black text-[11px] uppercase tracking-widest transition-all ${
                    rating > 0 ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "bg-slate-100 text-slate-400 cursor-not-allowed"
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

    // --- FETCH DATA FROM UserAPI ---
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

    return (
        <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm min-h-[500px]">
            {/* Table Header */}
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h3 className="font-black text-slate-900 text-xl tracking-tight">Service Registry</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Nursing & Professional Care</p>
                </div>
                <div className="relative w-full md:w-80">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by ID or provider..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 text-sm font-semibold outline-none ring-1 ring-slate-100 focus:ring-emerald-500 transition-all" 
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <FiLoader className="text-emerald-500 animate-spin" size={32} />
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Synchronizing Records...</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Request ID</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Provider Info</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Service</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Schedule</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Cost</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-bold text-slate-400 tracking-tighter">#{order.bookingId}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-2xl bg-slate-100 ring-4 ring-white shadow-sm overflow-hidden">
                                                <img 
                                                    src={`https://your-api-domain.com/${order.nurseId?.profileImage}`} 
                                                    className="w-full h-full object-cover" 
                                                    onError={(e) => e.target.src = 'https://via.placeholder.com/100'} 
                                                    alt="" 
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 leading-none flex items-center gap-1.5">{order.nurseId?.name} <MdVerified className="text-blue-500 text-xs"/></p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1.5">ID: {order.nurseId?._id.slice(-6)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-600">{order.serviceDetails.title}</span>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">{order.serviceDetails.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-800">
                                                {order.schedule.startDate ? new Date(order.schedule.startDate).toLocaleDateString() : 'N/A'}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium uppercase mt-1">
                                                {order.schedule.startTime || '--:--'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-black text-slate-900">₹{order.priceBreakdown.totalPrice}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                order.status === 'Assigned' ? 'bg-emerald-500 animate-pulse' : 
                                                order.status === 'Pending' ? 'bg-amber-500' : 'bg-blue-500'
                                            }`} />
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button 
                                            onClick={() => setModal({ isOpen: true, type: 'details', data: order })}
                                            className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- CLINICAL MODAL SYSTEM --- */}
            {modal.isOpen && modal.data && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
                        
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                    <MdOutlineMedicalServices size={20}/>
                                </div>
                                <h3 className="font-black text-[11px] uppercase tracking-widest text-slate-400">Case File: {modal.data.bookingId}</h3>
                            </div>
                            <button onClick={() => setModal({ ...modal, isOpen: false })} className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full transition-all text-slate-400"><FiX /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
                            {modal.type === 'details' && (
                                <div className="space-y-10">
                                    <div className="flex flex-col md:flex-row gap-10">
                                        <div className="relative shrink-0">
                                            <img 
                                                src={`https://your-api-domain.com/${modal.data.nurseId?.profileImage}`} 
                                                className="w-40 h-40 rounded-[40px] object-cover ring-8 ring-slate-50" 
                                                onError={(e) => e.target.src = 'https://via.placeholder.com/200'}
                                                alt="" 
                                            />
                                            <div className="absolute -bottom-2 -right-2 bg-white shadow-xl p-2 rounded-2xl">
                                                <div className="bg-emerald-500 text-white p-2 rounded-xl"><FiActivity /></div>
                                            </div>
                                        </div>
                                        <div className="pt-2 flex-1">
                                            <h2 className="text-3xl font-black text-slate-900 mb-2 leading-none">{modal.data.nurseId?.name}</h2>
                                            <p className="text-emerald-600 font-black uppercase text-[11px] tracking-widest mb-6">Provider Info & Support</p>
                                            <div className="flex flex-wrap gap-4">
                                                <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Service</p>
                                                    <p className="text-xs font-black text-slate-900">{modal.data.serviceDetails.title}</p>
                                                </div>
                                                <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Duration</p>
                                                    <p className="text-xs font-black text-slate-900">{modal.data.serviceDetails.duration}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Workflow Stepper */}
                                    <div>
                                        <h4 className="font-black text-[10px] uppercase tracking-[0.25em] text-slate-400 mb-2">Live Progress</h4>
                                        <StatusStepper status={modal.data.status} />
                                    </div>

                                    {/* Medical Specs Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <section className="space-y-4">
                                            <h4 className="font-black text-[10px] uppercase tracking-[0.25em] text-slate-400 flex items-center gap-2"><FiUser className="text-emerald-500"/> Patient Detail</h4>
                                            {modal.data.patients.map((patient, i) => (
                                                <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                    <p className="text-sm font-black text-slate-800">{patient.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase">{patient.relation} • {patient.gender}</p>
                                                </div>
                                            ))}
                                        </section>
                                        <section className="space-y-4">
                                            <h4 className="font-black text-[10px] uppercase tracking-[0.25em] text-slate-400 flex items-center gap-2"><FiMapPin className="text-emerald-500"/> Address</h4>
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <p className="text-xs font-bold text-slate-600 leading-relaxed">
                                                    {modal.data.address.houseNo}, {modal.data.address.sector}, {modal.data.address.city}, {modal.data.address.state} - {modal.data.address.pincode}
                                                </p>
                                            </div>
                                        </section>
                                    </div>

                                    {/* Consumables */}
                                    {modal.data.selectedConsumables.length > 0 && (
                                         <section className="space-y-4">
                                            <h4 className="font-black text-[10px] uppercase tracking-[0.25em] text-slate-400 flex items-center gap-2"><FiAward className="text-emerald-500"/> Selected Consumables</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {modal.data.selectedConsumables.map((item, i) => (
                                                    <span key={i} className="text-[10px] font-bold text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                                        {item.itemName} (₹{item.price})
                                                    </span>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Action Bar */}
                                    <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row gap-4">
                                        <button onClick={() => setModal({...modal, type: 'rating'})} className="flex-1 py-5 bg-slate-900 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-100 hover:scale-[1.02] transition-all">
                                            <FiStar className="inline mr-2" /> Rate Service
                                        </button>
                                        <button className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">
                                            <FiDownload className="inline mr-2" /> Receipt
                                        </button>
                                    </div>
                                </div>
                            )}

                            {modal.type === 'rating' && (
                                <StarRating 
                                    title={modal.data?.nurseId?.name} 
                                    onBack={() => setModal({ ...modal, type: 'details' })} 
                                    onSubmit={(s) => { 
                                        alert(`Submitted ${s} stars for ${modal.data?.bookingId}`); 
                                        setModal({ ...modal, isOpen: false }); 
                                    }} 
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
}

export default NursingOrders;