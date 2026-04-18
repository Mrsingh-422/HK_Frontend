"use client";
import React, { useState } from 'react';
import {
    FiX, FiStar, FiTruck, FiArrowLeft, FiPackage,
    FiAlertCircle, FiShield, FiRefreshCw, FiClock,
    FiMoreVertical, FiExternalLink, FiSearch
} from 'react-icons/fi';
import { MdOutlineLocalPharmacy, MdVerified, MdOutlineScience } from 'react-icons/md';

// --- SUB-COMPONENT: TRACKER ---
const StatusStepper = ({ currentStep }) => {
    const steps = ["Order", "Processed", "Shipped", "Delivered"];
    return (
        <div className="w-full py-8">
            <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 -z-10"></div>
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-600 transition-all duration-1000 z-10"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                ></div>
                {steps.map((step, index) => (
                    <div key={step} className="flex flex-col items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${index <= currentStep ? "bg-indigo-600 border-indigo-200" : "bg-white border-slate-200"
                            }`}></div>
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${index <= currentStep ? "text-slate-900" : "text-slate-400"
                            }`}>{step}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

function PharmacyOrders() {
    const [orders] = useState([
        {
            id: "RX-9920",
            status: "On The Way",
            currentStep: 2,
            date: "14 Oct 2023",
            name: "Invokana 100mg Tablet",
            vendor: "Johnson & Johnson Ltd",
            price: 463,
            actual: 545,
            image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=100&q=80",
            saltComposition: "Canagliflozin 100mg",
            howToUse: "Take once daily before the first meal.",
            sideEffects: ["Frequent urination", "Dehydration", "UTI"],
            storage: "Store below 30°C."
        },
        {
            id: "RX-1025",
            status: "Completed",
            currentStep: 3,
            date: "10 Oct 2023",
            name: "Paracetamol 500mg",
            vendor: "GSK Pharma",
            price: 42,
            actual: 50,
            image: "https://images.unsplash.com/photo-1550572017-ed200f54dd49?auto=format&fit=crop&w=100&q=80",
        },
        {
            id: "RX-0051",
            status: "Cancelled",
            currentStep: 0,
            date: "28 Sep 2023",
            name: "Vitamin C Chewable",
            vendor: "Abbott",
            price: 180,
            actual: 200,
            image: "https://images.unsplash.com/photo-1616671285442-990566378e91?auto=format&fit=crop&w=100&q=80",
        }
    ]);

    const [modal, setModal] = useState({ isOpen: false, type: 'details', data: null });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed': return 'text-emerald-600 bg-emerald-50';
            case 'On The Way': return 'text-indigo-600 bg-indigo-50';
            case 'Cancelled': return 'text-rose-500 bg-rose-50';
            default: return 'text-slate-500 bg-slate-50';
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
            {/* Table Search Header */}
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="font-black text-slate-900 text-lg">Pharmacy Ledger</h3>
                <div className="relative w-full md:w-72">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search orders..." className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 text-sm font-medium outline-none ring-1 ring-slate-200 focus:ring-indigo-500 transition-all" />
                </div>
            </div>

            {/* THE TABLE */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order ID</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Product</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Price</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="px-6 py-5">
                                    <span className="text-xs font-bold text-slate-500 tracking-wider">#{order.id}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <img src={order.image} className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100" alt="" />
                                        <div>
                                            <p className="text-sm font-black text-slate-800 leading-none mb-1">{order.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{order.vendor}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-xs font-bold text-slate-600">{order.date}</td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-slate-900">₹{order.price}</span>
                                        <span className="text-[9px] text-slate-300 line-through">₹{order.actual}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'Completed' ? 'bg-emerald-500' :
                                                order.status === 'On The Way' ? 'bg-indigo-500 animate-pulse' : 'bg-rose-500'
                                            }`} />
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    {order.status === "Cancelled" ? (
                                        <button className="text-slate-400 hover:text-indigo-600 transition-colors"><FiRefreshCw size={18} /></button>
                                    ) : (
                                        <button
                                            onClick={() => setModal({ isOpen: true, type: order.status === 'On The Way' ? 'track' : 'details', data: order })}
                                            className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                                        >
                                            {order.status === 'On The Way' ? 'Track' : 'View'}
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
                    <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

                        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                            <h3 className="font-black text-sm uppercase tracking-widest text-slate-900 flex items-center gap-2">
                                <MdOutlineLocalPharmacy className="text-indigo-600" size={20} /> Order Details
                            </h3>
                            <button onClick={() => setModal({ ...modal, isOpen: false })} className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full transition-all text-slate-400"><FiX /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10">
                            {/* 1. TRACKING VIEW */}
                            {modal.type === 'track' && (
                                <div className="space-y-8">
                                    <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-6 opacity-20"><FiTruck size={100} /></div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">Live Status</p>
                                        <h2 className="text-3xl font-black mb-4">On the Way</h2>
                                        <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
                                            <div className="flex items-center gap-2"><FiClock /> ETA: 25 Mins</div>
                                            <div className="flex items-center gap-2"><FiPackage /> Courier: Assigned</div>
                                        </div>
                                    </div>
                                    <StatusStepper currentStep={modal.data.currentStep} />
                                    <button className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100">Call Dispatch Center</button>
                                </div>
                            )}

                            {/* 2. SPECIFICATION VIEW */}
                            {modal.type === 'details' && (
                                <div className="space-y-10">
                                    <div className="flex gap-8">
                                        <img src={modal.data.image} className="w-32 h-32 rounded-[32px] object-cover ring-4 ring-slate-50" alt="" />
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-black text-slate-900 mb-1">{modal.data.name}</h2>
                                            <p className="text-indigo-600 font-black uppercase text-[10px] tracking-widest mb-4">{modal.data.vendor}</p>
                                            <div className="flex gap-4">
                                                <div className="bg-slate-50 px-4 py-2 rounded-xl">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase">Paid</p>
                                                    <p className="text-sm font-black">₹{modal.data.price}</p>
                                                </div>
                                                <div className="bg-slate-50 px-4 py-2 rounded-xl">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase">ID</p>
                                                    <p className="text-sm font-black">#{modal.data.id}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <section className="space-y-3">
                                            <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-2"><MdOutlineScience className="text-indigo-500" /> Composition</h4>
                                            <p className="text-xs font-bold text-slate-700 leading-relaxed">{modal.data.saltComposition || "Proprietary Medical Formula"}</p>
                                        </section>
                                        <section className="space-y-3">
                                            <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-2"><FiShield className="text-emerald-500" /> Storage</h4>
                                            <p className="text-xs font-bold text-slate-700 leading-relaxed">{modal.data.storage || "Controlled temperature environment"}</p>
                                        </section>
                                    </div>

                                    <div className="bg-amber-50 p-6 rounded-[32px] border border-amber-100 flex gap-4">
                                        <FiAlertCircle className="text-amber-600 shrink-0" size={24} />
                                        <div>
                                            <p className="text-[10px] font-black text-amber-700 uppercase mb-1">Safety Instruction</p>
                                            <p className="text-xs font-medium text-amber-600 leading-relaxed">Please consult your physician before use. Do not exceed the recommended dosage. Keep out of reach of children.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button className="flex-1 py-5 bg-indigo-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100"><FiStar className="inline mr-2" /> Rate Delivery</button>
                                        <button className="flex-1 py-5 bg-slate-900 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest"><FiExternalLink className="inline mr-2" /> View Invoice</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PharmacyOrders;