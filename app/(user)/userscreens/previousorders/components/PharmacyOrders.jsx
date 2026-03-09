"use client";
import React, { useState } from 'react';
import { 
    FiX, FiStar, FiTruck, FiArrowLeft, FiPackage, 
    FiCheckCircle, FiInfo, FiAlertCircle, FiDroplet, 
    FiShield, FiRefreshCw, FiShoppingCart 
} from 'react-icons/fi';
import { MdOutlineLocalPharmacy, MdVerified } from 'react-icons/md';

// --- SUB-COMPONENT: PHARMACY TRACKER ---
const StatusStepper = ({ currentStep }) => {
    const steps = ["Ordered", "Packed", "On The Way", "Delivered"];
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

function PharmacyOrders() {
    // --- PHARMACY ORDERS DATA ---
    const [orders] = useState([
        {
            id: "PHA-882",
            status: "On The Way",
            currentStep: 2,
            date: "Today, 02:45 PM",
            // Your Medicine Data
            name: "Invokana 100mg Tablet",
            vendor: "Johnson & Johnson Ltd",
            actualPrice: 545,
            discountPrice: 463,
            image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
            introduction: "Invokana 100mg Tablet is used to control high blood sugar levels in patients with type 2 diabetes.",
            description: "It works by helping the kidneys remove excess glucose from the bloodstream through urine.",
            useOfMedicine: ["Type 2 Diabetes", "Blood sugar control"],
            drugCategory: "SGLT2 Inhibitor",
            sideEffects: ["Frequent urination", "Dehydration", "Dizziness", "UTI"],
            safetyAdvice: "Use with caution in kidney disease patients. Avoid excessive alcohol consumption.",
            saltComposition: "Canagliflozin 100mg",
            primaryUse: "Treatment of Type 2 Diabetes Mellitus",
            storage: "Store below 30°C in a dry place away from sunlight.",
            benefits: ["Improves blood sugar control", "Supports heart health"],
            howToUse: "Take once daily before the first meal of the day as prescribed by your doctor."
        },
        {
            id: "PHA-102",
            status: "Completed",
            date: "Oct 20, 2023",
            name: "Paracetamol 500mg",
            vendor: "GSK Pharma",
            actualPrice: 50,
            discountPrice: 42,
            image: "https://images.unsplash.com/photo-1550572017-ed200f54dd49?auto=format&fit=crop&w=400&q=80",
            status: "Completed"
        },
        {
            id: "PHA-005",
            status: "Cancelled",
            date: "Sep 28, 2023",
            name: "Vitamin C Chewable",
            vendor: "Abbott",
            actualPrice: 200,
            discountPrice: 180,
            image: "https://images.unsplash.com/photo-1616671285442-990566378e91?auto=format&fit=crop&w=400&q=80"
        }
    ]);

    const [modal, setModal] = useState({ isOpen: false, type: 'details', data: null, ratingTarget: null });

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-50 text-green-600';
            case 'On The Way': return 'bg-blue-50 text-blue-600 border border-blue-100';
            case 'Cancelled': return 'bg-red-50 text-red-600';
            default: return 'bg-gray-50 text-gray-500';
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm hover:shadow-xl transition-all flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest">ORDER ID: {order.id}</span>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusStyles(order.status)}`}>
                            {order.status}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <img src={order.image} className={`w-16 h-16 rounded-2xl object-cover border border-gray-50 ${order.status === 'Cancelled' ? 'grayscale opacity-50' : ''}`} alt="Med" />
                        <div>
                            <h3 className="font-black text-gray-800 text-lg leading-tight">{order.name}</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{order.vendor}</p>
                        </div>
                    </div>

                    <div className="mt-auto pt-5 border-t border-gray-50 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-xl font-black text-gray-900">${order.discountPrice}</p>
                                <p className="text-xs text-gray-300 line-through">${order.actualPrice}</p>
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{order.date}</p>
                        </div>

                        {order.status === "Cancelled" ? (
                            <button className="flex items-center gap-2 text-xs font-black uppercase text-red-500 hover:underline">
                                <FiRefreshCw /> Re-order
                            </button>
                        ) : (
                            <button 
                                onClick={() => setModal({ isOpen: true, type: order.status === 'On The Way' ? 'track' : 'details', data: order })}
                                className={`${order.status === 'On The Way' ? 'bg-blue-500' : 'bg-[#08b36a]'} text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-transform active:scale-95`}
                            >
                                {order.status === 'On The Way' ? 'Track Package' : 'Details & Info'}
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
                            <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                <MdOutlineLocalPharmacy className="text-[#08b36a] text-lg"/> 
                                {modal.type === 'track' ? 'Live Tracking' : 'Medicine Information'}
                            </h3>
                            <button onClick={() => setModal({ ...modal, isOpen: false })} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"><FiX size={24}/></button>
                        </div>

                        <div className="p-8">
                            {/* 1. TRACKING VIEW */}
                            {modal.type === 'track' && (
                                <div className="space-y-8">
                                    <StatusStepper currentStep={modal.data.currentStep} />
                                    <div className="bg-gray-50 p-6 rounded-[32px] flex items-center gap-6">
                                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                                            <FiTruck size={32} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-gray-900">Out for Delivery</h4>
                                            <p className="text-sm font-bold text-gray-400">Arriving today by 6:00 PM</p>
                                        </div>
                                    </div>
                                    <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Call Delivery Partner</button>
                                </div>
                            )}

                            {/* 2. MEDICINE DETAILS VIEW */}
                            {modal.type === 'details' && (
                                <div className="space-y-8">
                                    {/* Product Header */}
                                    <div className="flex flex-col md:flex-row gap-6 items-start">
                                        <img src={modal.data.image} className="w-32 h-32 rounded-[32px] object-cover border border-gray-100 shadow-md" alt="" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="text-2xl font-black text-gray-900">{modal.data.name}</h2>
                                                <MdVerified className="text-blue-500" />
                                            </div>
                                            <p className="text-[#08b36a] font-bold text-sm mb-4">{modal.data.vendor}</p>
                                            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Salt Composition</p>
                                                <p className="text-xs font-bold text-gray-700">{modal.data.saltComposition || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Clinical Info Sections */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Introduction */}
                                        <div className="space-y-3">
                                            <h4 className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-gray-800"><FiInfo className="text-[#08b36a]"/> Introduction</h4>
                                            <p className="text-sm text-gray-500 leading-relaxed font-medium">{modal.data.introduction}</p>
                                        </div>
                                        {/* Side Effects */}
                                        <div className="space-y-3">
                                            <h4 className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-gray-800"><FiAlertCircle className="text-red-500"/> Side Effects</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {modal.data.sideEffects?.map((eff, i) => (
                                                    <span key={i} className="text-[10px] font-black uppercase bg-red-50 text-red-600 px-3 py-1 rounded-lg">{eff}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* How to use / Storage */}
                                    <div className="bg-gray-50 p-6 rounded-[32px] grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <h4 className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-gray-800 mb-2"><FiRefreshCw className="text-[#08b36a]"/> How to Use</h4>
                                            <p className="text-xs text-gray-500 font-medium">{modal.data.howToUse}</p>
                                        </div>
                                        <div>
                                            <h4 className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-gray-800 mb-2"><FiPackage className="text-[#08b36a]"/> Storage</h4>
                                            <p className="text-xs text-gray-500 font-medium">{modal.data.storage}</p>
                                        </div>
                                    </div>

                                    {/* Safety Advice */}
                                    <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 flex gap-4">
                                        <FiShield className="text-amber-600 shrink-0" size={24} />
                                        <div>
                                            <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Safety Advice</h4>
                                            <p className="text-xs text-amber-600 font-medium">{modal.data.safetyAdvice}</p>
                                        </div>
                                    </div>

                                    {/* Rating Buttons */}
                                    <div className="pt-8 border-t border-gray-100 grid grid-cols-2 gap-4">
                                        <button onClick={() => setModal({...modal, type: 'rating', ratingTarget: 'Pharmacy Service'})} className="flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">
                                            <FiStar /> Rate Pharmacy
                                        </button>
                                        <button onClick={() => setModal({...modal, type: 'rating', ratingTarget: 'Delivery Driver'})} className="flex items-center justify-center gap-2 py-4 border-2 border-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest">
                                            <FiTruck /> Rate Driver
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* RATING VIEW */}
                            {modal.type === 'rating' && (
                                <StarRating title={modal.ratingTarget} onBack={() => setModal({ ...modal, type: 'details' })} onSubmit={(s) => { alert("Thanks!"); setModal({ ...modal, isOpen: false }); }} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PharmacyOrders;