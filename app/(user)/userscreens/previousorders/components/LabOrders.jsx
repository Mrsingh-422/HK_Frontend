"use client";
import React, { useState } from 'react';
import {
    FiX, FiStar, FiArrowLeft, FiCheckCircle, FiClock,
    FiDownload, FiActivity, FiMapPin, FiClipboard,
    FiFileText, FiRefreshCw, FiExternalLink
} from 'react-icons/fi';
import { MdOutlineScience, MdVerified } from 'react-icons/md';

// --- SUB-COMPONENT: LAB STATUS STEPPER ---
const StatusStepper = ({ currentStep }) => {
    const steps = ["Booked", "Sample Collected", "In Lab", "Report Ready"];
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
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase mb-6 hover:text-[#08b36a] transition-colors"><FiArrowLeft /> Back</button>
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
    );
};

function LabOrders() {
    // --- LAB ORDERS DATA ---
    const [orders] = useState([
        {
            id: "LAB-441",
            status: "Report Ready",
            date: "Oct 12, 2023",
            // Your Test Data
            name: "Heart Health Package",
            vendor: "City Care Diagnostics",
            price: "₹4,500",
            discountPrice: "₹2,799",
            priceValue: 2799,
            image: "https://images.unsplash.com/photo-1580281657521-6b6b2c8b8f6c?auto=format&fit=crop&w=400&q=80",
            rating: 4,
            distance: 2.1,
            tests: "Includes 25 Parameters",
            detailedTests: ["ECG", "2D Echo", "Lipid Profile", "High Sensitivity CRP", "Homocysteine", "Troponin I", "CK-MB"]
        },
        {
            id: "LAB-502",
            status: "Processing",
            currentStep: 2,
            date: "Today, 10:00 AM",
            name: "Full Body Checkup",
            vendor: "Pathology Lab Inc",
            discountPrice: "₹1,499",
            image: "https://images.unsplash.com/photo-1579152276503-3172e276081e?auto=format&fit=crop&w=400&q=80",
            tests: "60+ Parameters"
        },
        {
            id: "LAB-003",
            status: "Cancelled",
            date: "Sep 20, 2023",
            name: "COVID-19 RT-PCR",
            vendor: "Apollo Diagnostics",
            discountPrice: "₹699",
            image: "https://images.unsplash.com/photo-1583946099361-ff78a1c0851e?auto=format&fit=crop&w=400&q=80",
            tests: "Single Parameter"
        }
    ]);

    const [modal, setModal] = useState({ isOpen: false, type: 'details', data: null, ratingTarget: null });

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Report Ready': return 'bg-green-50 text-green-600';
            case 'Processing': return 'bg-indigo-50 text-indigo-600 border border-indigo-100';
            case 'Cancelled': return 'bg-red-50 text-red-600';
            default: return 'bg-gray-50 text-gray-500';
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm hover:shadow-xl transition-all flex flex-col group">
                    <div className="flex justify-between items-start mb-6">
                        <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest">ID: {order.id}</span>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusStyles(order.status)}`}>
                            {order.status}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <img src={order.image} className={`w-16 h-16 rounded-2xl object-cover border border-gray-50 ${order.status === 'Cancelled' ? 'grayscale opacity-50' : ''}`} alt="" />
                        <div>
                            <h3 className="font-black text-gray-800 text-base leading-tight group-hover:text-[#08b36a] transition-colors">{order.name}</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{order.vendor}</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-2xl mb-6 flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight flex items-center gap-2">
                            <FiClipboard className="text-[#08b36a]" /> {order.tests}
                        </span>
                        {order.distance && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight flex items-center gap-1">
                            <FiMapPin className="text-[#08b36a]" /> {order.distance} km
                        </span>}
                    </div>

                    <div className="mt-auto pt-5 border-t border-gray-50 flex items-center justify-between">
                        <div>
                            <p className="text-xl font-black text-gray-900">{order.discountPrice}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{order.date}</p>
                        </div>

                        <button
                            onClick={() => setModal({ isOpen: true, type: order.status === 'Processing' ? 'track' : 'details', data: order })}
                            className={`${order.status === 'Report Ready' ? 'bg-[#08b36a]' : order.status === 'Cancelled' ? 'bg-red-600 text-white' : 'bg-indigo-600'} text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95`}
                        >
                            {order.status === 'Report Ready' ? 'View Report' : order.status === 'Cancelled' ? 'Details' : 'Track Lab'}
                        </button>
                    </div>
                </div>
            ))}

            {/* --- MODAL SYSTEM --- */}
            {modal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

                        <div className="sticky top-0 z-10 bg-white px-8 py-6 border-b border-gray-50 flex justify-between items-center">
                            <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                <MdOutlineScience className="text-[#08b36a] text-lg" />
                                {modal.type === 'track' ? 'Processing Status' : 'Lab Test Summary'}
                            </h3>
                            <button onClick={() => setModal({ ...modal, isOpen: false })} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"><FiX size={24} /></button>
                        </div>

                        <div className="p-8">
                            {/* 1. TRACKING VIEW */}
                            {modal.type === 'track' && (
                                <div className="space-y-8">
                                    <StatusStepper currentStep={modal.data.currentStep} />
                                    <div className="bg-indigo-50 p-6 rounded-[32px] flex items-center gap-6 border border-indigo-100">
                                        <div className="w-16 h-16 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                                            <FiActivity size={32} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-indigo-900">In Lab Processing</h4>
                                            <p className="text-sm font-bold text-indigo-400 uppercase tracking-tighter mt-1">Samples are being analyzed</p>
                                        </div>
                                    </div>
                                    <p className="text-center text-xs text-gray-400 font-bold">Estimated report time: Within 24 hours</p>
                                </div>
                            )}

                            {/* 2. TEST DETAILS VIEW */}
                            {modal.type === 'details' && (
                                <div className="space-y-8">
                                    {/* Test Header */}
                                    <div className="flex flex-col md:flex-row gap-6 items-start">
                                        <img src={modal.data.image} className="w-32 h-32 rounded-[32px] object-cover border-4 border-gray-50 shadow-md" alt="" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="text-2xl font-black text-gray-900">{modal.data.name}</h2>
                                                <MdVerified className="text-blue-500" />
                                            </div>
                                            <p className="text-[#08b36a] font-bold text-sm mb-4">{modal.data.vendor}</p>
                                            <div className="flex gap-2">
                                                <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-xl text-[10px] font-black uppercase flex items-center gap-1"><FiStar fill="currentColor" /> {modal.data.rating} Rating</span>
                                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-xl text-[10px] font-black uppercase flex items-center gap-1"><FiMapPin /> {modal.data.distance} km</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed Tests List */}
                                    <div className="bg-gray-50 p-6 rounded-[32px]">
                                        <h4 className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-gray-400 mb-4">
                                            <FiFileText className="text-[#08b36a]" /> What's Included ({modal.data.tests})
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {modal.data.detailedTests?.map((test, i) => (
                                                <div key={i} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-[#08b36a]"></div>
                                                    <span className="text-xs font-bold text-gray-600">{test}</span>
                                                </div>
                                            )) || <p className="text-xs text-gray-400">Consult lab for full parameter list.</p>}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-4 pt-6">
                                        {modal.data.status === 'Report Ready' ? (
                                            <button className="w-full flex items-center justify-center gap-3 py-5 bg-[#08b36a] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-green-100 active:scale-95 transition-all">
                                                <FiDownload size={20} /> Download PDF Report
                                            </button>
                                        ) : modal.data.status === 'Cancelled' ? (
                                            <button className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all">
                                                Re-book This Package
                                            </button>
                                        ) : null}

                                        <div className="grid grid-cols-2 gap-4">
                                            <button onClick={() => setModal({ ...modal, type: 'rating', ratingTarget: 'Lab Accuracy' })} className="flex items-center justify-center gap-2 py-4 border-2 border-gray-100 text-gray-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-[#08b36a] transition-all">
                                                <FiStar /> Rate Lab
                                            </button>
                                            <button className="flex items-center justify-center gap-2 py-4 border-2 border-gray-100 text-gray-600 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                                                <FiExternalLink /> Share Report
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* RATING VIEW */}
                            {modal.type === 'rating' && (
                                <StarRating title={modal.ratingTarget} onBack={() => setModal({ ...modal, type: 'details' })} onSubmit={(s) => { alert("Feedback received!"); setModal({ ...modal, isOpen: false }); }} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LabOrders;