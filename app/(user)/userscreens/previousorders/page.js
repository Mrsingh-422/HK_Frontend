"use client";
import React, { useState } from 'react';
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-20">

                {/* --- PREMIUM MINIMALIST HEADER --- */}
                <header className="mb-8 md:mb-12 relative">
                    <div className="flex items-center gap-3 mb-2 md:mb-3">
                        <div className="h-5 w-1 bg-emerald-500 rounded-full" />
                        <p className="text-[10px] md:text-[12px] font-bold text-emerald-600 uppercase tracking-[0.25em]">
                            Health Records
                        </p>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extralight text-slate-900 tracking-tight">
                        Order <span className="font-semibold text-slate-900">History</span>
                    </h1>
                    <p className="mt-2 md:mt-3 text-slate-500 text-xs md:text-sm max-w-md leading-relaxed">
                        Access and manage your medical history, prescriptions, and laboratory results in one secure place.
                    </p>
                </header>

                {/* --- PREMIUM NAVIGATION --- */}
                <div className="mb-6 md:mb-10 w-full overflow-hidden">
                    <div
                        className="flex items-center p-1 bg-slate-200/50 rounded-xl md:rounded-2xl w-full md:w-fit backdrop-blur-sm overflow-x-auto no-scrollbar scroll-smooth relative"
                        role="tablist"
                    >
                        {/* Sliding Background Indicator - Hidden on Mobile, Enabled from MD upwards */}
                        <div
                            className="hidden md:block absolute h-[calc(100%-8px)] top-1 bg-white rounded-xl shadow-sm transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border border-slate-200/50"
                            style={{
                                width: `calc(${100 / tabs.length}% - 4px)`,
                                left: `calc(${(activeIndex * 100) / tabs.length}% + 0px)`,
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
                                    className={`relative z-10 flex flex-1 md:flex-initial items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 text-xs md:text-sm font-medium transition-all duration-300 outline-none whitespace-nowrap rounded-lg md:rounded-none
                                        ${isActive
                                            ? 'text-emerald-700 bg-white md:bg-transparent shadow-sm md:shadow-none'
                                            : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                >
                                    <Icon className={`text-base md:text-lg transition-transform duration-500 ${isActive ? 'scale-110' : 'opacity-70'}`} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* --- CLEAN CONTENT AREA --- */}
                <main className="relative min-h-[400px] md:min-h-[500px]">
                    <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 p-4 md:p-8 transition-all duration-500">
                        <div key={activeTab} className="animate-fadeIn">
                            {activeTab === "nursing" && <NursingOrders />}
                            {activeTab === "pharmacy" && <PharmacyOrders />}
                            {activeTab === "lab" && <LabOrders />}
                            {activeTab === "prescription" && <PrescriptionOrders />}
                        </div>
                    </div>
                </main>

                {/* --- MINIMAL FOOTER --- */}
                <footer className="mt-12 md:mt-20 flex flex-col items-center justify-center gap-3 md:gap-4">
                    <div className="flex items-center gap-2 text-slate-300 w-full justify-center px-4">
                        <MdHistory className="text-lg md:text-xl flex-shrink-0" />
                        <div className="h-px flex-1 max-w-[60px] md:max-w-[96px] bg-slate-200" />
                        <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] whitespace-nowrap">
                            End of Records
                        </p>
                        <div className="h-px flex-1 max-w-[60px] md:max-w-[96px] bg-slate-200" />
                    </div>
                    <p className="text-slate-400 text-[10px] md:text-[11px]">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                </footer>
            </div>

            {/* Premium Micro-animations & Responsiveness Utilities */}
            <style jsx global>{`
                @keyframes fadeIn {
                    from { 
                        opacity: 0; 
                        transform: translateY(6px);
                        filter: blur(2px);
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0);
                        filter: blur(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                
                /* Hide scrollbar for Chrome, Safari and Opera */
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                /* Hide scrollbar for IE, Edge and Firefox */
                .no-scrollbar {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }

                html {
                    scroll-behavior: smooth;
                }
            `}</style>
        </div>
    );
}

export default PreviousOrders;