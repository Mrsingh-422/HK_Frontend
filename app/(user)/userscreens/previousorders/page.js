"use client";
import React, { useState } from 'react';
// Icons for tabs
import { FiPlusSquare, FiActivity, FiSearch } from 'react-icons/fi';
import { MdOutlineMedicalServices, MdOutlineLocalPharmacy, MdOutlineScience } from 'react-icons/md';

import NursingOrders from './components/NursingOrders';
import PharmacyOrders from './components/PharmacyOrders';
import LabOrders from './components/LabOrders';

function PreviousOrders() {
    const [activeTab, setActiveTab] = useState("nursing");

    // --- ENHANCED TAB STYLING ---
    const getTabClass = (tab) => {
        const base = "flex-1 flex items-center justify-center gap-2 py-3 px-2 md:px-6 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer rounded-xl md:rounded-2xl ";

        return activeTab === tab
            ? `${base} bg-white text-[#08b36a] shadow-[0_8px_20px_-6px_rgba(0,0,0,0.15)] scale-[1.02] z-10`
            : `${base} text-white/80 hover:text-white hover:bg-white/10`;
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] py-8 md:py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* --- PAGE HEADER --- */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                            Order History
                        </h1>
                        <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-wide">
                            Healthcare & Pharmacy Records
                        </p>
                    </div>
                    {/* Optional: Simple search bar or filter info could go here */}
                </div>

                {/* --- FIXED TAB NAVIGATION --- */}
                <div className="relative mb-12">
                    {/* The Background Track */}
                    <div className="bg-[#08b36a] p-1.5  md:p-2 rounded-[22px] md:rounded-[30px] flex gap-1 shadow-2xl shadow-green-200/50 max-w-7xl mx-auto md:mx-0 md:px-10">

                        <button onClick={() => setActiveTab("nursing")} className={getTabClass("nursing")}>
                            <MdOutlineMedicalServices className="text-lg md:text-xl" />
                            <span>Nursing</span>
                        </button>

                        <button onClick={() => setActiveTab("pharmacy")} className={getTabClass("pharmacy")}>
                            <MdOutlineLocalPharmacy className="text-lg md:text-xl" />
                            <span>Pharmacy</span>
                        </button>

                        <button onClick={() => setActiveTab("lab")} className={getTabClass("lab")}>
                            <MdOutlineScience className="text-lg md:text-xl" />
                            <span>Lab Tests</span>
                        </button>

                    </div>
                </div>

                {/* --- CONTENT AREA --- */}
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                    {activeTab === "nursing" && <NursingOrders />}
                    {activeTab === "pharmacy" && <PharmacyOrders />}
                    {activeTab === "lab" && <LabOrders />}
                </div>

                {/* --- EMPTY STATE HELPER (Optional) --- */}
                {/* Add a logic check here if you want to show a global "no orders" state */}
            </div>
        </div>
    );
}

export default PreviousOrders;