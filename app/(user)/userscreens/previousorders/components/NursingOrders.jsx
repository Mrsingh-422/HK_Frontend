"use client";
import React, { useState } from 'react';
import {
    FiX, FiStar, FiArrowLeft, FiCheckCircle, FiClock, FiCalendar,
    FiUser, FiAward, FiBriefcase, FiGlobe, FiPhone, FiRefreshCw, FiAlertCircle,
    FiSearch, FiDownload, FiMapPin, FiActivity
} from 'react-icons/fi';
import { MdVerified, MdOutlineMedicalServices } from 'react-icons/md';

// --- SUB-COMPONENT: TRACKER ---
const StatusStepper = ({ currentStep }) => {
    const steps = ["Assigned", "On The Way", "Arrived", "In-Service"];
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
    const [orders] = useState([
        {
            id: "NUR-7720",
            status: "On The Way",
            currentStep: 1,
            date: "14 Oct 2023",
            name: "Sarah Jenkins",
            speciality: "Critical Care",
            experience: "8 Years",
            qualification: "B.Sc Nursing",
            hospital: "Max Healthcare",
            price: 1400.00,
            rating: 4.8,
            shift: "Day Shift",
            languages: ["English", "Hindi"],
            services: ["ECG Monitoring", "Ventilator Support", "IV Infusion"],
            image: "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&w=200&q=80"
        },
        {
            id: "NUR-1015",
            status: "Completed",
            currentStep: 3,
            date: "10 Oct 2023",
            name: "Home Nursing Care",
            speciality: "General Nursing",
            experience: "5 Years",
            qualification: "GNM Nursing",
            hospital: "Apollo Home Care",
            price: 1150.99,
            rating: 4.2,
            shift: "Full Day",
            languages: ["English", "Hindi"],
            services: ["Injection", "BP Monitoring"],
            image: "https://images.unsplash.com/photo-1576765608598-0735df749e43?auto=format&fit=crop&w=200&q=80"
        },
        {
            id: "NUR-0921",
            status: "Cancelled",
            currentStep: 0,
            date: "28 Sep 2023",
            name: "Elena Gilbert",
            speciality: "Elderly Care",
            hospital: "City Clinic",
            price: 900.00,
            image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=200&q=80"
        }
    ]);

    const [modal, setModal] = useState({ isOpen: false, type: 'details', data: null });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed': return 'text-emerald-600 bg-emerald-50';
            case 'On The Way': return 'text-amber-600 bg-amber-50';
            case 'Cancelled': return 'text-rose-500 bg-rose-50';
            default: return 'text-slate-500 bg-slate-50';
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h3 className="font-black text-slate-900 text-xl tracking-tight">Service Registry</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Nursing & Professional Care</p>
                </div>
                <div className="relative w-full md:w-80">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search by provider or ID..." className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 text-sm font-semibold outline-none ring-1 ring-slate-100 focus:ring-emerald-500 transition-all" />
                </div>
            </div>

            {/* THE TABLE */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Request ID</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Provider Info</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Speciality</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Session Date</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cost</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-6">
                                    <span className="text-xs font-bold text-slate-400 tracking-tighter">#{order.id}</span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <img src={order.image} className="w-11 h-11 rounded-2xl object-cover ring-4 ring-white shadow-sm" alt="" />
                                        <div>
                                            <p className="text-sm font-black text-slate-800 leading-none flex items-center gap-1.5">{order.name} <MdVerified className="text-blue-500 text-xs"/></p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1.5">{order.hospital}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">{order.speciality || "General"}</span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-800">{order.date}</span>
                                        <span className="text-[10px] text-slate-400 font-medium uppercase mt-1">{order.shift || "Standard"}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-sm font-black text-slate-900">₹{order.price}</span>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                            order.status === 'Completed' ? 'bg-emerald-500' : 
                                            order.status === 'On The Way' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'
                                        }`} />
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    {order.status === "Cancelled" ? (
                                        <button className="text-slate-300 hover:text-emerald-600 transition-colors"><FiRefreshCw size={18}/></button>
                                    ) : (
                                        <button 
                                            onClick={() => setModal({ isOpen: true, type: order.status === 'On The Way' ? 'track' : 'details', data: order })}
                                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                order.status === 'On The Way' ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900'
                                            }`}
                                        >
                                            {order.status === 'On The Way' ? 'Track' : 'Details'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- CLINICAL MODAL SYSTEM --- */}
            {modal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
                        
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                    <MdOutlineMedicalServices size={20}/>
                                </div>
                                <h3 className="font-black text-[11px] uppercase tracking-widest text-slate-400">Service Record</h3>
                            </div>
                            <button onClick={() => setModal({ ...modal, isOpen: false })} className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full transition-all text-slate-400"><FiX /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
                            {/* 1. TRACKING VIEW */}
                            {modal.type === 'track' && (
                                <div className="space-y-10">
                                    <div className="text-center bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-10 opacity-10"><FiMapPin size={120} /></div>
                                        <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase mb-6 tracking-widest">
                                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                                            Active Service
                                        </div>
                                        <h2 className="text-4xl font-black mb-2 tracking-tight">On The Way</h2>
                                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">ETA: 14 Minutes</p>
                                    </div>
                                    <StatusStepper currentStep={modal.data.currentStep} />
                                    <div className="flex gap-4">
                                        <button className="flex-1 py-5 bg-slate-100 text-slate-900 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"><FiClock /> Schedule Change</button>
                                        <button className="flex-1 py-5 bg-emerald-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-100 flex items-center justify-center gap-2"><FiPhone /> Contact Provider</button>
                                    </div>
                                </div>
                            )}

                            {/* 2. SPECIFICATION VIEW */}
                            {modal.type === 'details' && (
                                <div className="space-y-10">
                                    {/* Header Profile */}
                                    <div className="flex flex-col md:flex-row gap-10">
                                        <div className="relative shrink-0">
                                            <img src={modal.data.image} className="w-40 h-40 rounded-[40px] object-cover ring-8 ring-slate-50" alt="" />
                                            <div className="absolute -bottom-2 -right-2 bg-white shadow-xl p-2 rounded-2xl">
                                                <div className="bg-emerald-500 text-white p-2 rounded-xl"><FiActivity /></div>
                                            </div>
                                        </div>
                                        <div className="pt-2 flex-1">
                                            <h2 className="text-3xl font-black text-slate-900 mb-2 leading-none">{modal.data.name}</h2>
                                            <p className="text-emerald-600 font-black uppercase text-[11px] tracking-widest mb-6">{modal.data.qualification} • {modal.data.hospital}</p>
                                            <div className="flex flex-wrap gap-4">
                                                <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Success Rate</p>
                                                    <p className="text-xs font-black text-slate-900 flex items-center gap-1"><FiStar className="text-amber-400 fill-amber-400"/> {modal.data.rating} Avg.</p>
                                                </div>
                                                <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Exp.</p>
                                                    <p className="text-xs font-black text-slate-900">{modal.data.experience}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Medical Specs Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <section className="space-y-4">
                                            <h4 className="font-black text-[10px] uppercase tracking-[0.25em] text-slate-400 flex items-center gap-2"><FiAward className="text-emerald-500"/> Core Services</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {modal.data.services?.map((svc, i) => (
                                                    <span key={i} className="text-[10px] font-bold text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">{svc}</span>
                                                ))}
                                            </div>
                                        </section>
                                        <section className="space-y-4">
                                            <h4 className="font-black text-[10px] uppercase tracking-[0.25em] text-slate-400 flex items-center gap-2"><FiGlobe className="text-emerald-500"/> Communication</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {modal.data.languages?.map((lang, i) => (
                                                    <span key={i} className="text-[10px] font-bold text-slate-600 bg-emerald-50/50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100/50">{lang}</span>
                                                ))}
                                            </div>
                                        </section>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row gap-4">
                                        <button onClick={() => setModal({...modal, type: 'rating', ratingTarget: modal.data.name})} className="flex-1 py-5 bg-slate-900 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-100 hover:scale-[1.02] transition-all">
                                            <FiStar className="inline mr-2" /> Rate Provider
                                        </button>
                                        <button className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">
                                            <FiDownload className="inline mr-2" /> View Receipt
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* 3. RATING VIEW */}
                            {modal.type === 'rating' && (
                                <StarRating 
                                    title={modal.data?.name} 
                                    onBack={() => setModal({ ...modal, type: 'details' })} 
                                    onSubmit={(s) => { 
                                        alert(`Submitted ${s} stars for ${modal.data?.name}`); 
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