"use client";

import React, { useState } from 'react';
import { FaMicroscope, FaPills, FaUserNurse, FaHospital, FaAmbulance } from 'react-icons/fa';

// Importing vendor components from your components folder
import LabVendor from "./components/LabVendor";
import PharmacyVendor from "./components/PharmacyVendor";
import NurseVendor from "./components/NurseVendor";
import HospitalVendor from "./components/HospitalVendor";
import AmbulanceVendor from './components/AmbulanceVendor';

function Page() {
    const [activeTab, setActiveTab] = useState('Lab');

    // Navigation Tab Configuration Array with enriched styling rules
    const navigationTabs = [
        { id: 'Lab', label: 'Lab Diagnostics', icon: FaMicroscope, accent: 'from-emerald-500 to-teal-500', textAccent: 'text-emerald-600', bgAccent: 'bg-emerald-50', lineAccent: 'bg-emerald-500' },
        { id: 'Pharmacy', label: 'Pharmacy', icon: FaPills, accent: 'from-blue-500 to-indigo-500', textAccent: 'text-blue-600', bgAccent: 'bg-blue-50', lineAccent: 'bg-blue-500' },
        { id: 'Nurse', label: 'Nurse Care', icon: FaUserNurse, accent: 'from-purple-500 to-indigo-500', textAccent: 'text-purple-600', bgAccent: 'bg-purple-50', lineAccent: 'bg-purple-500' },
        { id: 'Hospital', label: 'Hospitals', icon: FaHospital, accent: 'from-rose-500 to-pink-500', textAccent: 'text-rose-600', bgAccent: 'bg-rose-50', lineAccent: 'bg-rose-500' },
        { id: 'Ambulance', label: 'Ambulance Services', icon: FaAmbulance, accent: 'from-red-500 to-orange-500', textAccent: 'text-red-600', bgAccent: 'bg-red-50', lineAccent: 'bg-red-500' },
    ];

    // Dynamic component rendering engine
    const renderVendorComponent = () => {
        switch (activeTab) {
            case 'Lab': return <LabVendor />;
            case 'Pharmacy': return <PharmacyVendor />;
            case 'Nurse': return <NurseVendor />;
            case 'Hospital': return <HospitalVendor />;
            case 'Ambulance': return <AmbulanceVendor />;
            default: return <LabVendor />;
        }
    };

    return (
        <div className="bg-[#FAFBFD] min-h-screen font-['Plus_Jakarta_Sans',_sans-serif] text-slate-600 antialiased selection:bg-slate-900 selection:text-white py-8">

            {/* Tailwind styles injection for custom sleek premium animations and layout utilities */}
            <style jsx global>{`
                @keyframes smoothFadeInUp {
                    from { 
                        opacity: 0; 
                        transform: translateY(16px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                }
                .animate-smoothFadeIn {
                    animation: smoothFadeInUp 0.5s cubic-bezier(0.215, 0.610, 0.355, 1) forwards;
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* Premium Enhanced Secondary Navigation Section */}
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-slate-200/50 backdrop-blur-md p-1.5 rounded-2xl border border-slate-300/40 flex items-center overflow-x-auto no-scrollbar shadow-[0_2px_8px_rgba(15,23,42,0.02)]">
                    <nav className="flex space-x-1 w-full">
                        {navigationTabs.map((tab) => {
                            const IconComponent = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative flex items-center gap-3 px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ease-out whitespace-nowrap cursor-pointer select-none active:scale-[0.98] w-full md:w-auto justify-center md:justify-start overflow-hidden group ${isActive
                                        ? 'bg-white text-slate-900 shadow-[0_12px_20px_-8px_rgba(15,23,42,0.08)] border border-slate-200/60'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
                                        }`}
                                >
                                    {/* Icon container with subtle spring scale */}
                                    <div className={`p-1.5 rounded-lg transition-all duration-300 transform group-hover:scale-105 ${isActive
                                        ? `${tab.bgAccent} ${tab.textAccent}`
                                        : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200/60 group-hover:text-slate-600'
                                        }`}>
                                        <IconComponent className="text-sm transition-transform duration-300" />
                                    </div>

                                    {/* Text weight and color optimization */}
                                    <span className={`transition-colors duration-300 ${isActive ? "text-slate-900 font-extrabold" : "font-semibold text-slate-500"}`}>
                                        {tab.label}
                                    </span>

                                    {/* Sleek bottom active indicator pill line */}
                                    {isActive && (
                                        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] w-8 rounded-t-full ${tab.lineAccent} animate-fade-in`} />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Content Display Workspace Area with Upgraded Fluid Entry Animation Physics */}
            <main className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Changing the key forces React to re-mount the animation container cleanly when the tab swaps */}
                <div key={activeTab} className="animate-smoothFadeIn">
                    {renderVendorComponent()}
                </div>
            </main>
        </div>
    );
}

export default Page;