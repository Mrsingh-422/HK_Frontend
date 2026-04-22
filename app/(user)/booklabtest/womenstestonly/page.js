"use client";

import React, { useState } from "react";
import { FaVenus, FaMicroscope, FaCheckCircle, FaLeaf, FaShieldAlt, FaHome } from "react-icons/fa";
import WomenPackages from "./components/WomenPackages";
import WomenTests from "./components/WomenTests";

export default function WomenHealthPage() {
    const [activeTab, setActiveTab] = useState("packages");

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFF5F7] via-white to-[#F8F7FF] py-16 overflow-hidden relative">
            
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-100/30 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/20 rounded-full blur-[100px] -z-10" />

            <div className="max-w-7xl mx-auto px-6">

                {/* --- HEADER SECTION --- */}
                <div className="text-center mb-16 relative">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white shadow-sm border border-rose-100 mb-6 animate-fade-in">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">
                            Women's Wellness Center
                        </span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-6 leading-[1.1]">
                        Prioritize <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-indigo-500">Your</span> <br />
                        Health, Gracefully.
                    </h1>
                    
                    <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
                        Precision diagnostics tailored for every stage of your journey. 
                        Because your biological needs deserve specialized attention.
                    </p>
                </div>

                {/* --- NAV TABS (Glassmorphism Design) --- */}
                <div className="flex justify-center mb-16">
                    <div className="inline-flex p-2 bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white shadow-xl shadow-rose-100/50">
                        <button
                            onClick={() => setActiveTab("packages")}
                            className={`flex items-center gap-3 px-10 py-4 rounded-[2rem] text-xs font-black tracking-widest transition-all duration-500 ${
                                activeTab === "packages"
                                    ? "bg-slate-900 text-white shadow-2xl shadow-slate-400 translate-y-[-2px]"
                                    : "text-slate-400 hover:text-rose-500"
                            }`}
                        >
                            <FaVenus size={14} className={activeTab === "packages" ? "text-rose-400" : ""} /> 
                            HEALTH PACKAGES
                        </button>
                        <button
                            onClick={() => setActiveTab("tests")}
                            className={`flex items-center gap-3 px-10 py-4 rounded-[2rem] text-xs font-black tracking-widest transition-all duration-500 ${
                                activeTab === "tests"
                                    ? "bg-slate-900 text-white shadow-2xl shadow-slate-400 translate-y-[-2px]"
                                    : "text-slate-400 hover:text-rose-500"
                            }`}
                        >
                            <FaMicroscope size={14} className={activeTab === "tests" ? "text-indigo-400" : ""} /> 
                            INDIVIDUAL TESTS
                        </button>
                    </div>
                </div>

                {/* --- COMPONENT VIEW --- */}
                <div className="relative min-h-[400px]">
                    <div className={`transition-all duration-700 transform ${
                        activeTab === "packages" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 hidden"
                    }`}>
                        <WomenPackages />
                    </div>
                    <div className={`transition-all duration-700 transform ${
                        activeTab === "tests" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 hidden"
                    }`}>
                        <WomenTests />
                    </div>
                </div>

                {/* --- TRUST FOOTER --- */}
                <div className="mt-24 pt-12 border-t border-slate-100">
                    <div className="flex flex-wrap justify-center gap-6 md:gap-12">
                        <PremiumTrustBadge icon={<FaShieldAlt className="text-rose-400" />} label="100% Confidential" />
                        <PremiumTrustBadge icon={<FaVenus className="text-rose-400" />} label="Female Phlebotomists" />
                        <PremiumTrustBadge icon={<FaHome className="text-rose-400" />} label="Home Sample Pickup" />
                        <PremiumTrustBadge icon={<FaLeaf className="text-rose-400" />} label="Wellness-Focused Care" />
                    </div>
                    <p className="text-center text-[10px] text-slate-300 mt-10 font-bold uppercase tracking-[0.4em]">
                        Trusted by 50,000+ Women Nationwide
                    </p>
                </div>
            </div>
        </div>
    );
}

const PremiumTrustBadge = ({ icon, label }) => (
    <div className="group flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-sm border border-slate-50 hover:border-rose-100 hover:shadow-md transition-all duration-300">
        <div className="p-2 bg-rose-50 rounded-lg group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{label}</span>
    </div>
);