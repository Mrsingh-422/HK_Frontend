"use client";
import React, { useState } from 'react';
// Icons
import { FiClock, FiCheckCircle, FiPackage } from 'react-icons/fi';
import { MdOutlineMedicalServices, MdOutlineLocalPharmacy, MdOutlineScience } from 'react-icons/md';

// Components
import NursingOrders from './components/NursingOrders';
import PharmacyOrders from './components/PharmacyOrders';
import LabOrders from './components/LabOrders';

function PreviousOrders() {
    const [activeTab, setActiveTab] = useState("nursing");

    // --- TAB STYLING LOGIC ---
    const getTabClass = (tab) => {
        const base = "relative flex-1 flex items-center justify-center gap-3 py-3.5 px-4 text-[11px] md:text-sm font-bold uppercase tracking-wider transition-all duration-500 cursor-pointer rounded-2xl ";

        return activeTab === tab
            ? `${base} bg-white text-emerald-600 shadow-xl shadow-emerald-900/10 scale-[1.02] z-10`
            : `${base} text-slate-500 hover:text-emerald-600 hover:bg-white/50`;
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden">
            {/* --- DECORATIVE BACKGROUND ELEMENTS --- */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">

                {/* --- PAGE HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="h-1 w-8 bg-emerald-500 rounded-full" />
                            <p className="text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em]">Patient Dashboard</p>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                            Order <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">History</span>
                        </h1>
                    </div>

                    {/* --- QUICK STATS SUMMARY --- */}
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {[
                            { label: 'Completed', count: '12', icon: <FiCheckCircle />, color: 'text-emerald-500' },
                            { label: 'In Progress', count: '02', icon: <FiClock />, color: 'text-amber-500' },
                            { label: 'Total', count: '14', icon: <FiPackage />, color: 'text-blue-500' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white border border-slate-100 p-3 px-5 rounded-2xl shadow-sm flex items-center gap-3 min-w-fit">
                                <div className={`${stat.color} text-lg`}>{stat.icon}</div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">{stat.label}</p>
                                    <p className="text-sm font-black text-slate-800 leading-none">{stat.count}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- MODERN TAB NAVIGATION --- */}
                <div className="mb-12">
                    <div className="bg-slate-200/60 backdrop-blur-md p-1.5 rounded-[24px] flex flex-row gap-1 shadow-inner border border-white/50">

                        <button onClick={() => setActiveTab("nursing")} className={getTabClass("nursing")}>
                            <MdOutlineMedicalServices className={`text-xl ${activeTab === 'nursing' ? 'animate-pulse' : ''}`} />
                            <span>Nursing</span>
                            {activeTab === 'nursing' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full" />}
                        </button>

                        <button onClick={() => setActiveTab("pharmacy")} className={getTabClass("pharmacy")}>
                            <MdOutlineLocalPharmacy className={`text-xl ${activeTab === 'pharmacy' ? 'animate-pulse' : ''}`} />
                            <span>Pharmacy</span>
                            {activeTab === 'pharmacy' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full" />}
                        </button>

                        <button onClick={() => setActiveTab("lab")} className={getTabClass("lab")}>
                            <MdOutlineScience className={`text-xl ${activeTab === 'lab' ? 'animate-pulse' : ''}`} />
                            <span>Lab Tests</span>
                            {activeTab === 'lab' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full" />}
                        </button>

                    </div>
                </div>

                {/* --- CONTENT AREA WITH TRANSITION --- */}
                <div className="relative">
                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-emerald-400/5 blur-[100px] -z-10 rounded-full" />

                    <div className="transition-all duration-500 ease-in-out">
                        {activeTab === "nursing" && (
                            <div className="animate-in fade-in zoom-in-95 duration-500">
                                <NursingOrders />
                            </div>
                        )}
                        {activeTab === "pharmacy" && (
                            <div className="animate-in fade-in zoom-in-95 duration-500">
                                <PharmacyOrders />
                            </div>
                        )}
                        {activeTab === "lab" && (
                            <div className="animate-in fade-in zoom-in-95 duration-500">
                                <LabOrders />
                            </div>
                        )}
                    </div>
                </div>

                {/* --- FOOTER INFO --- */}
                <div className="mt-20 flex items-center justify-center gap-4 text-slate-400">
                    <div className="h-px w-12 bg-slate-200" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em]">End of Records</p>
                    <div className="h-px w-12 bg-slate-200" />
                </div>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

export default PreviousOrders;