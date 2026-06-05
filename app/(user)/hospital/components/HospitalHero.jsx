"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from "next/navigation";
import {
    Search,
    Phone,
    Calendar,
    FlaskConical,
    Truck,
    X,
    ChevronRight,
    Building2,
    Stethoscope
} from 'lucide-react';
import UserAPI from "@/app/services/UserAPI";

const HospitalHero = () => {
    const router = useRouter();
    const searchRef = useRef(null);

    // --- SEARCH STATES ---
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // --- SEARCH LOGIC (Debounced) ---
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.length >= 2) {
                fetchHospitalSuggestions();
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const fetchHospitalSuggestions = async () => {
        setIsSearching(true);
        try {
            const res = await UserAPI.getGlobalSearchSuggestions(searchTerm, "hospital");
            if (res.success) {
                setSuggestions(res.data);
                setShowSuggestions(true);
            }
        } catch (err) {
            console.error("Hospital search error:", err);
        } finally {
            setIsSearching(false);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSuggestionClick = (item) => {
        setSearchTerm(item.title);
        setShowSuggestions(false);
        router.push(`/hospital/hospitaldetail/${item.id}`);
    };

    const handleManualSearch = () => {
        if (searchTerm.trim() !== "") {
            router.push(`/userscreens/hospitalappointment?query=${encodeURIComponent(searchTerm)}`);
        }
    };

    return (
        <div className="w-full bg-white flex flex-col items-center">
            
            {/* --- 1. HERO CONTENT & BACKGROUND SECTION --- */}
            <section className="relative w-full pt-12 pb-24 md:pt-16 md:pb-32 px-6 overflow-hidden font-sans flex items-center min-h-[55vh]">
                
                {/* Visual Background layers */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop"
                        alt="Modern Hospital Building"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent backdrop-blur-[1px]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

                        {/* Left Side Branding Copy */}
                        <div className="lg:col-span-7 space-y-5 text-left">
                            {/* Status Tag */}
                            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#08B36A]"></span>
                                </span>
                                <span className="text-[#08B36A] text-[10px] md:text-xs font-black uppercase tracking-[0.15em]">
                                    24/7 Verified Healthcare Network
                                </span>
                            </div>

                            {/* Impact Heading */}
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tighter">
                                Find the Best <br />
                                <span className="text-[#08B36A] bg-gradient-to-r from-[#08B36A] to-emerald-600 bg-clip-text text-transparent">Care</span> for <br />
                                Your Family.
                            </h1>

                            <p className="text-slate-500 text-base md:text-lg max-w-md font-medium leading-relaxed">
                                Search and book appointments with 10,000+ top-rated doctors and verified hospitals near you.
                            </p>

                            {/* Trust Statistics */}
                            <div className="flex flex-wrap items-center gap-6 pt-2">
                                <div className="space-y-0.5">
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">500+</h3>
                                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Partner Hospitals</p>
                                </div>
                                <div className="w-px h-8 bg-slate-200 hidden sm:block" />
                                <div className="space-y-0.5">
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">1.2M+</h3>
                                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Happy Patients</p>
                                </div>
                                <div className="w-px h-8 bg-slate-200 hidden sm:block" />
                                <div className="space-y-0.5">
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">4.9/5</h3>
                                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">User Rating</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Content: Quick Actions Grid */}
                        <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4 mt-4 lg:mt-0">
                            <QuickActionCard
                                icon={<Calendar className="w-5 h-5 md:w-6 md:h-6" />}
                                title="Book Appointment"
                                color="bg-emerald-500"
                                onClick={() => router.push('/userscreens/hospitalappointment')}
                            />
                            <QuickActionCard
                                icon={<Stethoscope className="w-5 h-5 md:w-6 md:h-6" />}
                                title="Find Specialist"
                                color="bg-blue-500"
                                onClick={() => router.push('/userscreens/doctorappointment')}
                            />
                            <QuickActionCard
                                icon={<FlaskConical className="w-5 h-5 md:w-6 md:h-6" />}
                                title="Lab Tests"
                                color="bg-amber-500"
                                onClick={() => router.push('/booklabtest')}
                            />
                            <QuickActionCard
                                icon={<Truck className="w-5 h-5 md:w-6 md:h-6" />}
                                title="Buy Medicine"
                                color="bg-slate-900"
                                onClick={() => router.push('/buymedicine')}
                            />
                        </div>

                    </div>
                </div>
            </section>

            {/* --- 2. FLOATING SEARCH CONTAINER --- */}
            <section className="w-full max-w-7xl px-6 relative z-20 -mt-10 sm:-mt-12 mb-16">
                <div className="max-w-3xl mx-auto relative" ref={searchRef}>
                    
                    {/* Input Field Card */}
                    <div className="bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.12)] border border-slate-100 flex flex-col md:flex-row items-center gap-2.5 transition-all duration-300 hover:shadow-[0_30px_60px_-10px_rgba(0,0,0,0.18)]">
                        <div className="flex-1 flex items-center px-4 gap-3 w-full group">
                            <Search className={`w-5 h-5 transition-colors duration-200 ${isSearching ? 'text-emerald-500 animate-pulse' : 'text-slate-400 group-focus-within:text-emerald-500'}`} />
                            <input
                                type="text"
                                placeholder="Search Hospital Name or Specialization..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                                className="bg-transparent border-none outline-none text-sm sm:text-base font-bold text-slate-700 w-full h-12 placeholder-slate-400"
                            />
                            {searchTerm && (
                                <button 
                                    onClick={() => {setSearchTerm(""); setSuggestions([]);}}
                                    className="p-1 rounded-full text-slate-300 hover:text-red-500 hover:bg-slate-50 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <button 
                            onClick={handleManualSearch}
                            className="w-full md:w-auto bg-slate-900 text-white px-8 py-3.5 rounded-xl sm:rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:bg-[#08B36A] transition-all shadow-md active:scale-[0.98] whitespace-nowrap"
                        >
                            Search
                        </button>
                    </div>

                    {/* SUGGESTIONS DROPDOWN */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-2xl shadow-[0_25px_55px_-10px_rgba(0,0,0,0.25)] border border-slate-100 overflow-hidden z-[100] transform transition-all duration-200 origin-top">
                            <div className="p-2 max-h-[360px] overflow-y-auto">
                                <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                    Verified Hospitals Found
                                </p>
                                <div className="mt-1 space-y-0.5">
                                    {suggestions.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => handleSuggestionClick(item)}
                                            className="flex items-center gap-4 px-4 py-3 cursor-pointer rounded-xl transition-all hover:bg-emerald-50/70 group"
                                        >
                                            <div className="h-11 w-11 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100/40 group-hover:bg-white transition-colors">
                                                <Building2 className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                                                    {item.title}
                                                </h4>
                                                <p className="text-xs text-slate-400 font-medium line-clamp-1">{item.subtitle}</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-all group-hover:translate-x-0.5" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div 
                                className="bg-slate-50/80 p-3.5 text-center cursor-pointer hover:bg-emerald-50 border-t border-slate-100 transition-colors"
                                onClick={handleManualSearch}
                            >
                                <span className="text-xs font-black text-emerald-700 uppercase tracking-widest flex items-center justify-center gap-1.5">
                                    View All Results For "{searchTerm}" <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* --- 3. EMERGENCY FLOATING BAR --- */}
            <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-40">
                <a href="tel:108" className="bg-white p-3.5 rounded-2xl shadow-2xl border border-slate-100 flex items-center gap-3.5 hover:scale-105 transition-transform no-underline">
                    <div className="w-11 h-11 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-100 animate-pulse">
                        <Phone size={18} />
                    </div>
                    <div className="text-left">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Emergency Help</p>
                        <p className="text-base font-black text-slate-900 leading-none">102 / 108</p>
                    </div>
                </a>
            </div>

        </div>
    );
};

// --- SUB-COMPONENT FOR ACTION CARDS ---
const QuickActionCard = ({ icon, title, color, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-white p-5 rounded-2xl sm:rounded-[2rem] shadow-md shadow-slate-100 border border-slate-50 flex flex-col items-center justify-center text-center group cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 active:scale-[0.97]"
    >
        <div className={`w-11 h-11 sm:w-13 sm:h-13 ${color} text-white rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
            {icon}
        </div>
        <h4 className="text-[10px] sm:text-xs font-black text-slate-900 uppercase tracking-wider px-1 leading-tight min-h-[2rem] flex items-center justify-center">
            {title}
        </h4>
        <div className="mt-3 w-4 h-0.5 bg-slate-100 rounded-full group-hover:bg-[#08B36A] group-hover:w-8 transition-all" />
    </div>
);

export default HospitalHero;