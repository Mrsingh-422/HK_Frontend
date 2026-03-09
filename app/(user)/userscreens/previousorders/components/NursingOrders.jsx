"use client";
import React, { useState } from 'react';
import {
    FiX, FiStar, FiArrowLeft, FiCheckCircle, FiClock, FiCalendar,
    FiUser, FiAward, FiBriefcase, FiGlobe, FiPhone, FiRefreshCw, FiAlertCircle
} from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';

// --- SUB-COMPONENT: NURSING TRACKER ---
const StatusStepper = ({ currentStep }) => {
    const steps = ["Assigned", "On The Way", "Arrived", "In-Service"];
    return (
        <div className="py-10 w-full relative flex items-center justify-between">
            <div className="absolute left-0 top-[50px] w-full h-1 bg-gray-100 z-0"></div>
            <div className="absolute left-0 top-[50px] h-1 bg-[#08b36a] transition-all duration-700 z-0" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}></div>
            {steps.map((step, index) => (
                <div key={step} className="relative z-10 flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full border-4 transition-all duration-500 ${index <= currentStep ? "bg-white border-[#08b36a]" : "bg-white border-gray-100"}`}></div>
                    <span className={`absolute top-8 whitespace-nowrap text-[9px] font-black uppercase tracking-tighter ${index <= currentStep ? "text-gray-800" : "text-gray-300"}`}>{step}</span>
                </div>
            ))}
        </div>
    );
};

// --- SUB-COMPONENT: STAR RATER ---
const StarRating = ({ title, onBack, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase mb-6 hover:text-[#08b36a] transition-colors"><FiArrowLeft /> Back</button>
            <div className="text-center">
                <h3 className="text-lg font-black text-gray-800 mb-6">Rate {title}</h3>
                <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => setRating(s)}>
                            <FiStar size={36} className={`${(hover || rating) >= s ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} transition-all`} />
                        </button>
                    ))}
                </div>
                <button disabled={rating === 0} onClick={() => onSubmit(rating)} className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${rating > 0 ? "bg-[#08b36a] text-white shadow-lg" : "bg-gray-100 text-gray-400"}`}>Submit Feedback</button>
            </div>
        </div>
    );
};

function NursingOrders() {
    // --- NURSING ORDERS DATA ---
    const [orders] = useState([
        {
            id: "NUR-772",
            status: "On The Way",
            currentStep: 1,
            date: "Today, 12:30 PM",
            name: "Sarah Jenkins",
            speciality: "Critical Care",
            experience: "8 Years",
            qualification: "B.Sc Nursing",
            hospital: "Max Healthcare",
            price: 1400.00,
            rating: 4.8,
            totalReviews: 210,
            shift: "Day Shift",
            languages: ["English", "Hindi"],
            description: "Expert in ICU setup and post-operative critical care.",
            services: ["ECG Monitoring", "Ventilator Support", "IV Infusion"],
            image: "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&w=400&q=80"
        },
        {
            id: "NUR-101",
            status: "Completed",
            date: "Oct 25, 2023",
            name: "Home Nursing Care",
            speciality: "General Nursing",
            experience: "5 Years",
            qualification: "GNM Nursing",
            hospital: "Apollo Home Care",
            price: 1150.99,
            rating: 4.2,
            totalReviews: 143,
            shift: "Day / Night",
            languages: ["English", "Hindi"],
            description: "Personalized attention. We specialize in high needs residents.",
            services: ["Injection", "BP Monitoring", "Patient Hygiene"],
            image: "https://images.unsplash.com/photo-1576765608598-0735df749e43?auto=format&fit=crop&w=400&q=80"
        },
        {
            id: "NUR-092",
            status: "Cancelled",
            date: "Oct 20, 2023",
            name: "Elena Gilbert",
            speciality: "Elderly Care",
            hospital: "City Clinic",
            price: 900.00,
            description: "Service cancelled by user.",
            image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=400&q=80"
        }
    ]);

    const [modal, setModal] = useState({ isOpen: false, type: 'details', data: null, ratingTarget: null });

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-50 text-green-600';
            case 'On The Way': return 'bg-amber-50 text-amber-600 border border-amber-100';
            case 'Cancelled': return 'bg-red-50 text-red-600';
            default: return 'bg-gray-50 text-gray-500';
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm hover:shadow-xl transition-all flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest">#{order.id}</span>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusStyles(order.status)}`}>
                            {order.status}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <img src={order.image} className={`w-14 h-14 rounded-2xl object-cover ${order.status === 'Cancelled' ? 'grayscale opacity-50' : ''}`} alt="Nurse" />
                        <div>
                            <h3 className="font-black text-gray-800 text-lg leading-tight">{order.name}</h3>
                            <p className="text-[10px] font-black text-[#08b36a] uppercase tracking-widest">{order.speciality || "Nursing Service"}</p>
                        </div>
                    </div>

                    <div className="mt-auto pt-5 border-t border-gray-50 flex items-center justify-between">
                        <div>
                            <p className="text-xl font-black text-gray-900">${order.price}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{order.date}</p>
                        </div>

                        {order.status === "Cancelled" ? (
                            <button className="flex items-center gap-2 text-xs font-black uppercase text-red-500 hover:underline">
                                <FiRefreshCw /> Re-book
                            </button>
                        ) : order.status === "On The Way" ? (
                            <button
                                onClick={() => setModal({ isOpen: true, type: 'track', data: order })}
                                className="bg-amber-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-100"
                            >
                                Track Nurse
                            </button>
                        ) : (
                            <button
                                onClick={() => setModal({ isOpen: true, type: 'details', data: order })}
                                className="bg-[#08b36a] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-100"
                            >
                                Details
                            </button>
                        )}
                    </div>
                </div>
            ))}

            {/* --- MODAL SYSTEM --- */}
            {modal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

                        <div className="sticky top-0 z-10 bg-white px-8 py-6 border-b border-gray-50 flex justify-between items-center">
                            <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-400">
                                {modal.type === 'track' ? 'Live Tracking' : 'Service Information'}
                            </h3>
                            <button onClick={() => setModal({ ...modal, isOpen: false })} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"><FiX size={24} /></button>
                        </div>

                        <div className="p-8">
                            {/* 1. TRACKING VIEW */}
                            {modal.type === 'track' && (
                                <div className="space-y-8 text-center">
                                    <StatusStepper currentStep={modal.data.currentStep} />
                                    <div className="bg-gray-50 p-6 rounded-[32px] flex flex-col md:flex-row items-center gap-6 text-left">
                                        <img src={modal.data.image} className="w-20 h-20 rounded-2xl object-cover" alt="" />
                                        <div className="flex-1">
                                            <h4 className="text-xl font-black text-gray-900">{modal.data.name}</h4>
                                            <p className="text-sm font-bold text-[#08b36a]">{modal.data.hospital} • {modal.data.speciality}</p>
                                        </div>
                                        <button className="w-full md:w-auto flex items-center justify-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">
                                            <FiPhone /> Call Nurse
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400 font-bold">ETA: Arriving in approx. 12 minutes</p>
                                </div>
                            )}

                            {/* 2. COMPLETED DETAILS VIEW */}
                            {modal.type === 'details' && (
                                <div className="space-y-8">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <img src={modal.data.image} className="w-32 h-32 md:w-40 md:h-40 rounded-[32px] object-cover" alt="" />
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">{modal.data.name} <MdVerified className="text-blue-500" /></h2>
                                            <p className="text-[#08b36a] font-bold text-sm mb-4">{modal.data.qualification} • {modal.data.hospital}</p>
                                            <div className="flex gap-2">
                                                <span className="bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-1"><FiStar fill="currentColor" /> {modal.data.rating}</span>
                                                <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-1"><FiGlobe /> {modal.data.languages.join(", ")}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: "Experience", value: modal.data.experience, icon: FiBriefcase },
                                            { label: "Shift", value: modal.data.shift, icon: FiClock },
                                            { label: "Speciality", value: modal.data.speciality, icon: FiAward },
                                            { label: "Total Cost", value: `$${modal.data.price}`, icon: FiCheckCircle },
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-gray-50 p-4 rounded-2xl">
                                                <stat.icon className="text-[#08b36a] mb-2" size={16} />
                                                <p className="text-[9px] font-black text-gray-300 uppercase">{stat.label}</p>
                                                <p className="text-[11px] font-bold text-gray-700">{stat.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-6 pt-6 border-t border-gray-50">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <button onClick={() => setModal({ ...modal, type: 'rating', ratingTarget: 'Nursing Service' })} className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">Rate Service</button>
                                            <button className="flex-1 py-4 border-2 border-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-[#08b36a] transition-all">Download Invoice</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3. RATING VIEW */}
                            {modal.type === 'rating' && (
                                <StarRating title={modal.ratingTarget} onBack={() => setModal({ ...modal, type: 'details' })} onSubmit={(s) => { alert("Thanks!"); setModal({ ...modal, isOpen: false }) }} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NursingOrders;