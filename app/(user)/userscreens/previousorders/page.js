"use client";
import React, { useState } from 'react';
// Icons
import { MdOutlineMedicalServices, MdOutlineLocalPharmacy, MdOutlineScience } from 'react-icons/md';

// Components
import NursingOrders from './components/NursingOrders';
import PharmacyOrders from './components/PharmacyOrders';
import LabOrders from './components/LabOrders';

function PreviousOrders() {
    const tabs = [
        { id: 'nursing', label: 'Nursing', icon: MdOutlineMedicalServices },
        { id: 'pharmacy', label: 'Pharmacy', icon: MdOutlineLocalPharmacy },
        { id: 'lab', label: 'Lab Tests', icon: MdOutlineScience },
    ];

    const [activeTab, setActiveTab] = useState("nursing");
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-slate-800 font-sans antialiased">
            <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">

                {/* --- PREMIUM MINIMALIST HEADER --- */}
                <header className="mb-14 space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.2em]">
                            Patient Portal
                        </p>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-light text-slate-900 tracking-tight">
                        Order <span className="font-normal text-slate-900">History</span>
                    </h1>
                </header>

                {/* --- PREMIUM UNDERLINE NAVIGATION --- */}
                <div className="mb-12 border-b border-slate-200/80 relative">
                    <div className="flex gap-8 relative" role="tablist">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`group flex items-center gap-2.5 pb-4 text-sm font-medium transition-all duration-300 relative outline-none ${
                                        isActive 
                                            ? 'text-emerald-600' 
                                            : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    <Icon className={`text-lg transition-transform duration-300 ${
                                        isActive ? 'scale-110' : 'group-hover:scale-105'
                                    }`} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Sliding Premium Indicator */}
                    <div 
                        className="absolute bottom-0 h-[2px] bg-emerald-600 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
                        style={{
                            width: `${100 / tabs.length}%`,
                            left: `${(activeIndex * 100) / tabs.length}%`,
                            maxWidth: '120px' /* Keeps indicator elegant on wide screens */
                        }}
                    />
                </div>

                {/* --- CLEAN CONTENT AREA --- */}
                <main className="relative min-h-[400px]">
                    <div className="transition-all duration-300 ease-out">
                        {activeTab === "nursing" && (
                            <div className="animate-fadeIn">
                                <NursingOrders />
                            </div>
                        )}
                        {activeTab === "pharmacy" && (
                            <div className="animate-fadeIn">
                                <PharmacyOrders />
                            </div>
                        )}
                        {activeTab === "lab" && (
                            <div className="animate-fadeIn">
                                <LabOrders />
                            </div>
                        )}
                    </div>
                </main>

                {/* --- MINIMAL FOOTER --- */}
                <footer className="mt-24 pt-8 border-t border-slate-100 flex items-center justify-center">
                    <p className="text-[10px] font-medium text-slate-300 uppercase tracking-[0.25em]">
                        End of Records
                    </p>
                </footer>
            </div>

            {/* Premium Micro-animations */}
            <style jsx global>{`
                @keyframes fadeIn {
                    from { 
                        opacity: 0; 
                        transform: translateY(4px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}

export default PreviousOrders;