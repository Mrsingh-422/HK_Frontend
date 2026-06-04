"use client";
import React, { useState } from 'react';
// Icons
import { MdOutlineMedicalServices, MdOutlineLocalPharmacy, MdOutlineScience, MdHistory } from 'react-icons/md';

// Components (Preserving your exact architecture)
import NursingOrders from './components/NursingOrders';
import PharmacyOrders from './components/PharmacyOrders';
import LabOrders from './components/LabOrders';
import PrescriptionOrders from './components/PrescriptionOrders';

function PreviousOrders() {
    const tabs = [
        { id: 'nursing', label: 'Nursing', icon: MdOutlineMedicalServices },
        { id: 'pharmacy', label: 'Pharmacy', icon: MdOutlineLocalPharmacy },
        { id: 'lab', label: 'Lab Tests', icon: MdOutlineScience },
        { id: 'prescription', label: 'Prescriptions', icon: MdOutlineLocalPharmacy },
    ];

    const [activeTab, setActiveTab] = useState("nursing");
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased selection:bg-emerald-100">
            <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">

                {/* --- PREMIUM MINIMALIST HEADER --- */}
                <header className="mb-12 relative">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-6 w-1 bg-emerald-500 rounded-full" />
                        <p className="text-[12px] font-bold text-emerald-600 uppercase tracking-[0.25em]">
                            Health Records
                        </p>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extralight text-slate-900 tracking-tight">
                        Order <span className="font-semibold text-slate-900">History</span>
                    </h1>
                    <p className="mt-3 text-slate-500 text-sm max-w-md leading-relaxed">
                        Access and manage your medical history, prescriptions, and laboratory results in one secure place.
                    </p>
                </header>

                {/* --- PREMIUM NAVIGATION --- */}
                <div className="mb-10">
                    <div className="relative flex items-center p-1 bg-slate-200/50 rounded-2xl w-fit backdrop-blur-sm" role="tablist">
                        {/* Sliding Background Indicator */}
                        <div
                            className="absolute h-[calc(100%-8px)] top-1 bg-white rounded-xl shadow-sm transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border border-slate-200/50"
                            style={{
                                width: `calc(${100 / tabs.length}% - 4px)`,
                                left: `calc(${(activeIndex * 100) / tabs.length}% + 2px)`,
                            }}
                        />

                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative z-10 flex items-center gap-2.5 px-6 py-3 text-sm font-medium transition-colors duration-300 outline-none whitespace-nowrap ${isActive
                                        ? 'text-emerald-700'
                                        : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                >
                                    <Icon className={`text-lg transition-transform duration-500 ${isActive ? 'scale-110' : 'opacity-70'
                                        }`} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* --- CLEAN CONTENT AREA --- */}
                <main className="relative min-h-[500px]">
                    {/* The Inner Container adds a "Home" for your components */}
                    <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 p-2 md:p-8 transition-all duration-500">
                        <div key={activeTab} className="animate-fadeIn">
                            {activeTab === "nursing" && <NursingOrders />}
                            {activeTab === "pharmacy" && <PharmacyOrders />}
                            {activeTab === "lab" && <LabOrders />}
                            {activeTab === "prescription" && <PrescriptionOrders />}
                        </div>
                    </div>
                </main>

                {/* --- MINIMAL FOOTER --- */}
                <footer className="mt-20 flex flex-col items-center justify-center gap-4">
                    <div className="flex items-center gap-2 text-slate-300">
                        <MdHistory className="text-xl" />
                        <div className="h-px w-24 bg-slate-200" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em]">
                            End of Records
                        </p>
                        <div className="h-px w-24 bg-slate-200" />
                    </div>
                    <p className="text-slate-400 text-[11px]">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                </footer>
            </div>

            {/* Premium Micro-animations */}
            <style jsx global>{`
                @keyframes fadeIn {
                    from { 
                        opacity: 0; 
                        transform: translateY(8px);
                        filter: blur(4px);
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0);
                        filter: blur(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                
                /* Smooth scroll behavior */
                html {
                    scroll-behavior: smooth;
                }
            `}</style>
        </div>
    );
}

export default PreviousOrders;