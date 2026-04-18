"use client";
import React, { useState } from 'react';
import {
    FiX, FiStar, FiArrowLeft, FiCheckCircle, FiClock,
    FiDownload, FiActivity, FiMapPin, FiClipboard,
    FiFileText, FiRefreshCw, FiExternalLink, FiSearch, FiLayers
} from 'react-icons/fi';
import { MdOutlineScience, MdVerified } from 'react-icons/md';

// --- SUB-COMPONENT: LAB STATUS STEPPER ---
const StatusStepper = ({ currentStep }) => {
    const steps = ["Booked", "Sample Collected", "In Lab", "Report Ready"];
    return (
        <div className="w-full py-10 px-4">
            <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 -z-10"></div>
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-600 transition-all duration-1000 z-10"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                ></div>
                {steps.map((step, index) => (
                    <div key={step} className="flex flex-col items-center gap-2.5">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-500 ${index <= currentStep ? "bg-indigo-600 border-indigo-100 ring-4 ring-indigo-50" : "bg-white border-slate-200"
                            }`}></div>
                        <span className={`text-[9px] font-bold uppercase tracking-[0.15em] ${index <= currentStep ? "text-slate-900" : "text-slate-400"
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
            <button onClick={onBack} className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase mb-8 hover:text-emerald-600 transition-colors mx-auto">
                <FiArrowLeft /> Back to Summary
            </button>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Rate Lab Experience</h3>
            <p className="text-slate-500 text-sm mb-10 font-medium">How was the service at {title}?</p>
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
                className={`w-full py-5 rounded-[24px] font-black text-[11px] uppercase tracking-widest transition-all ${rating > 0 ? "bg-emerald-600 text-white shadow-xl shadow-emerald-100" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
            >
                Confirm Rating
            </button>
        </div>
    );
};

function LabOrders() {
    const [orders] = useState([
        {
            id: "LAB-4410",
            status: "Report Ready",
            currentStep: 3,
            date: "12 Oct 2023",
            name: "Heart Health Package",
            vendor: "City Care Diagnostics",
            price: "₹2,799",
            actual: "₹4,500",
            image: "https://images.unsplash.com/photo-1580281657521-6b6b2c8b8f6c?auto=format&fit=crop&w=200&q=80",
            rating: 4.5,
            tests: "25 Parameters",
            detailedTests: ["ECG", "Lipid Profile", "CRP", "Homocysteine", "Troponin I", "CK-MB", "Blood Glucose"]
        },
        {
            id: "LAB-5021",
            status: "Processing",
            currentStep: 2,
            date: "Today, 10:00 AM",
            name: "Full Body Checkup",
            vendor: "Pathology Lab Inc",
            price: "₹1,499",
            actual: "₹2,999",
            image: "https://images.unsplash.com/photo-1579152276503-3172e276081e?auto=format&fit=crop&w=200&q=80",
            tests: "60+ Parameters"
        },
        {
            id: "LAB-0035",
            status: "Cancelled",
            currentStep: 0,
            date: "20 Sep 2023",
            name: "COVID-19 RT-PCR",
            vendor: "Apollo Diagnostics",
            price: "₹699",
            actual: "₹999",
            image: "https://images.unsplash.com/photo-1583946099361-ff78a1c0851e?auto=format&fit=crop&w=200&q=80",
            tests: "Single Parameter"
        }
    ]);

    const [modal, setModal] = useState({ isOpen: false, type: 'details', data: null });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Report Ready': return 'text-emerald-600 bg-emerald-50';
            case 'Processing': return 'text-indigo-600 bg-indigo-50';
            case 'Cancelled': return 'text-rose-500 bg-rose-50';
            default: return 'text-slate-500 bg-slate-50';
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h3 className="font-black text-slate-900 text-xl tracking-tight">Diagnostic Ledger</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Laboratory & Radiology Reports</p>
                </div>
                <div className="relative w-full md:w-80">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search by test or lab ID..." className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 text-sm font-semibold outline-none ring-1 ring-slate-100 focus:ring-indigo-500 transition-all" />
                </div>
            </div>

            {/* THE TABLE */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order ID</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Test Details</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Parameters</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total</th>
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
                                            <p className="text-sm font-black text-slate-800 leading-none mb-1.5 group-hover:text-indigo-600 transition-colors">{order.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{order.vendor}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-500">
                                        <FiLayers className="text-indigo-500" /> {order.tests}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-xs font-bold text-slate-700">{order.date}</td>
                                <td className="px-8 py-6">
                                    <span className="text-sm font-black text-slate-900">{order.price}</span>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'Report Ready' ? 'bg-emerald-500' :
                                            order.status === 'Processing' ? 'bg-indigo-500 animate-pulse' : 'bg-rose-500'
                                            }`} />
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    {order.status === "Cancelled" ? (
                                        <button className="text-slate-300 hover:text-indigo-600 transition-colors"><FiRefreshCw size={18} /></button>
                                    ) : (
                                        <button
                                            onClick={() => setModal({ isOpen: true, type: order.status === 'Processing' ? 'track' : 'details', data: order })}
                                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${order.status === 'Report Ready' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:bg-slate-900' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900'
                                                }`}
                                        >
                                            {order.status === 'Report Ready' ? 'View Report' : 'Track Lab'}
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
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                    <MdOutlineScience size={20} />
                                </div>
                                <h3 className="font-black text-[11px] uppercase tracking-widest text-slate-400">Diagnostic Summary</h3>
                            </div>
                            <button onClick={() => setModal({ ...modal, isOpen: false })} className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full transition-all text-slate-400"><FiX /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
                            {/* 1. TRACKING VIEW */}
                            {modal.type === 'track' && (
                                <div className="space-y-10">
                                    <div className="text-center bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-10 opacity-10"><FiActivity size={120} /></div>
                                        <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase mb-6 tracking-widest">
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                                            Lab In Progress
                                        </div>
                                        <h2 className="text-4xl font-black mb-2 tracking-tight tracking-tight">Analyzing Samples</h2>
                                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Est. Ready: 24-48 Hours</p>
                                    </div>
                                    <StatusStepper currentStep={modal.data.currentStep} />
                                    <button className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-slate-900 transition-all">
                                        Contact Lab Support
                                    </button>
                                </div>
                            )}

                            {/* 2. SPECIFICATION VIEW */}
                            {modal.type === 'details' && (
                                <div className="space-y-10">
                                    {/* Header Section */}
                                    <div className="flex flex-col md:flex-row gap-10">
                                        <img src={modal.data.image} className="w-40 h-40 rounded-[40px] object-cover ring-8 ring-slate-50 shadow-inner" alt="" />
                                        <div className="pt-2 flex-1 text-center md:text-left">
                                            <h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">{modal.data.name}</h2>
                                            <p className="text-emerald-600 font-black uppercase text-[11px] tracking-widest mb-6 flex items-center justify-center md:justify-start gap-1">
                                                <MdVerified className="text-blue-500" /> {modal.data.vendor}
                                            </p>
                                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                                <div className="bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Price Paid</p>
                                                    <p className="text-sm font-black text-slate-900">{modal.data.price}</p>
                                                </div>
                                                <div className="bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Parameters</p>
                                                    <p className="text-sm font-black text-slate-900">{modal.data.tests}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Parameters Grid */}
                                    <div className="space-y-4">
                                        <h4 className="font-black text-[10px] uppercase tracking-[0.25em] text-slate-400 flex items-center gap-2"><FiFileText className="text-indigo-500" /> Included Parameters</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {modal.data.detailedTests?.map((test, i) => (
                                                <div key={i} className="text-[10px] font-bold text-slate-600 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {test}
                                                </div>
                                            )) || <p className="text-xs text-slate-400 col-span-full italic">Standard diagnostic profiling applies.</p>}
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="pt-8 border-t border-slate-100 space-y-4">
                                        {modal.data.status === 'Report Ready' && (
                                            <button className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 hover:bg-slate-900 transition-all">
                                                <FiDownload size={18} /> Download Health Report (PDF)
                                            </button>
                                        )}
                                        <div className="flex gap-4">
                                            <button onClick={() => setModal({ ...modal, type: 'rating', ratingTarget: modal.data.vendor })} className="flex-1 py-4 border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all">
                                                <FiStar className="inline mr-2" /> Rate Lab
                                            </button>
                                            <button className="flex-1 py-4 border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                                                <FiExternalLink className="inline mr-2" /> Share Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3. RATING VIEW */}
                            {modal.type === 'rating' && (
                                <StarRating
                                    title={modal.data?.vendor}
                                    onBack={() => setModal({ ...modal, type: 'details' })}
                                    onSubmit={(s) => {
                                        alert(`Submitted ${s} stars for diagnostic accuracy.`);
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

export default LabOrders;