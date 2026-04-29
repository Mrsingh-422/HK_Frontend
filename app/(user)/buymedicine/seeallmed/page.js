"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    FaArrowLeft, FaSearch, FaMapMarkerAlt,
    FaStar, FaClock, FaChevronRight, FaStore, FaHistory,
    FaTruck, FaLocationArrow, FaClinicMedical
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";
import AllPharmacyProducts from "./components/AllPharmacyProducts";
import SecondNavbar from "../../components/SecondNavbar";

// --- SKELETON COMPONENT ---
const PharmacyCardSkeleton = () => (
    <div className="flex-shrink-0 w-[280px] md:w-[320px] h-[200px] md:h-[220px] bg-white/80 backdrop-blur-md rounded-2xl md:rounded-[2.5rem] border border-white p-5 md:p-6 flex flex-col justify-between animate-pulse shadow-xl shadow-slate-200/50">
        <div>
            <div className="flex justify-between items-start">
                <div className="w-2/3">
                    <div className="h-5 bg-slate-200 rounded-lg w-full mb-3"></div>
                    <div className="h-3 bg-slate-100 rounded-md w-1/2"></div>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-100 rounded-xl md:rounded-2xl"></div>
            </div>
            <div className="flex gap-2 mt-4 md:mt-6">
                <div className="h-6 w-16 bg-slate-100 rounded-full"></div>
                <div className="h-6 w-16 bg-slate-100 rounded-full"></div>
            </div>
        </div>
        <div className="h-10 md:h-12 bg-slate-50 rounded-xl md:rounded-2xl w-full"></div>
    </div>
);

// --- REUSABLE BADGE ---
const Badge = ({ icon, text, color }) => {
    const colors = {
        blue: "bg-blue-50/80 text-blue-700 border-blue-200/50 shadow-blue-100/20",
        emerald: "bg-emerald-50/80 text-[#069669] border-emerald-200/50 shadow-emerald-100/20",
        slate: "bg-slate-50/80 text-slate-600 border-slate-200/50 shadow-slate-100/20",
    };
    return (
        <div className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl border text-[8px] md:text-[9px] font-black tracking-[0.1em] backdrop-blur-md shadow-sm transition-transform hover:scale-105 ${colors[color] || colors.slate}`}>
            <span className="opacity-90">{icon}</span>
            <span className="uppercase">{text}</span>
        </div>
    );
};

export default function AllMedicinesPage() {
    const router = useRouter();

    // --- STATES ---
    const [pharmacies, setPharmacies] = useState([]);
    const [loadingPharmacies, setLoadingPharmacies] = useState(true);
    const [pharmacyNameQuery, setPharmacyNameQuery] = useState("");
    const [pharmacySuggestions, setPharmacySuggestions] = useState([]);
    const [showPharmacySuggestions, setShowPharmacySuggestions] = useState(false);
    const [coords, setCoords] = useState({ lat: null, lng: null });

    const isSynced = useRef(false);

    // 1. Initial Load: Sync coordinates from localStorage
    useEffect(() => {
        const storedCoords = localStorage.getItem("userCoords");
        if (storedCoords) {
            try {
                const parsed = JSON.parse(storedCoords);
                setCoords(parsed);
            } catch (error) {
                console.error("Failed to parse userCoords", error);
            }
        }
        isSynced.current = true;
    }, []);

    // 2. Fetch Pharmacies Logic
    const fetchPharmacies = useCallback(async () => {
        if (!isSynced.current && !coords.lat) return;

        setLoadingPharmacies(true);
        try {
            const payload = {
                search: pharmacyNameQuery,
                lat: coords.lat,
                lng: coords.lng,
            };

            const response = await UserAPI.getAllPharmacies(payload);
            if (response.success) {
                setPharmacies(response.data || []);
            }
        } catch (error) {
            console.error("Error fetching pharmacies:", error);
        } finally {
            setLoadingPharmacies(false);
        }
    }, [coords, pharmacyNameQuery]);

    useEffect(() => {
        fetchPharmacies();
    }, [fetchPharmacies]);


    // --- SEARCH SUGGESTION LOGIC ---
    const handlePharmacyNameChange = async (val) => {
        setPharmacyNameQuery(val);
        if (val.length > 1) {
            const res = await UserAPI.getPharmacyNameSuggestions(val);
            if (res.success) {
                setPharmacySuggestions(res.data);
                setShowPharmacySuggestions(true);
            }
        } else {
            setPharmacySuggestions([]);
        }
    };

    const selectPharmacySuggestion = (name) => {
        setPharmacyNameQuery(name);
        setShowPharmacySuggestions(false);
    };

    return (
        <div className="min-h-screen font-sans bg-[#F8FAFC] pb-10 selection:bg-emerald-100 selection:text-emerald-900">
            <SecondNavbar />

            {/* Premium Background Elements */}
            <div className="fixed top-0 right-0 -z-10 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-gradient-to-br from-emerald-100/30 to-blue-100/30 rounded-full blur-[80px] md:blur-[140px] pointer-events-none"></div>
            <div className="fixed -bottom-20 -left-20 -z-10 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-gradient-to-tr from-blue-100/20 to-emerald-50/30 rounded-full blur-[80px] md:blur-[140px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto pt-4 px-4 sm:px-6 lg:px-10">

                {/* 1. PHARMACIES SECTION */}
                <section className="mb-4">
                    {/* HEADER WITH INTEGRATED SEARCH */}
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 md:gap-10 mb-6">
                        {/* Left Side: Title */}
                        <div className="flex items-center gap-4 md:gap-7">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[2rem] bg-gradient-to-br from-[#08B36A] via-[#059669] to-[#047857] flex items-center justify-center text-white shadow-[0_15px_30px_-10px_rgba(8,179,106,0.45)] ring-4 ring-white">
                                <FaClinicMedical size={20} className="md:w-7 md:h-7" />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-1 md:mb-2">
                                    Local Pharmacies
                                </h2>
                                <p className="flex items-center gap-2 text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.25em]">
                                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                                    Verified Partners
                                </p>
                            </div>
                        </div>

                        {/* Right Side: Search Bar */}
                        <div className={`relative group w-full lg:w-[450px] ${showPharmacySuggestions ? 'z-[60]' : 'z-10'}`}>
                            <div className="absolute inset-y-0 left-5 md:left-6 flex items-center pointer-events-none">
                                <FaSearch className="text-slate-300 group-focus-within:text-[#08B36A] transition-colors size-4 md:size-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="Find a store near you..."
                                value={pharmacyNameQuery}
                                onChange={(e) => handlePharmacyNameChange(e.target.value)}
                                onFocus={() => pharmacySuggestions.length > 0 && setShowPharmacySuggestions(true)}
                                className="w-full pl-12 md:pl-14 pr-6 md:pr-8 py-4 md:py-5 bg-white border-2 border-slate-100 rounded-2xl md:rounded-[1.75rem] text-[14px] md:text-[15px] font-bold text-slate-700 focus:ring-[8px] md:focus:ring-[10px] focus:ring-emerald-500/5 focus:border-[#08B36A] transition-all shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] placeholder:text-slate-300"
                            />

                            {/* Suggestions Dropdown */}
                            {showPharmacySuggestions && pharmacySuggestions.length > 0 && (
                                <div className="absolute z-[61] w-full mt-2 md:mt-4 bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-200/50 max-h-[350px] md:max-h-[450px] overflow-hidden flex flex-col ring-1 ring-black/[0.02]">

                                    <div className="px-6 md:px-8 py-3 md:py-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                                        <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Suggested Stores</span>
                                        <span className="text-[9px] md:text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{pharmacySuggestions.length} Results</span>
                                    </div>

                                    <div className="overflow-y-auto custom-scrollbar">
                                        {pharmacySuggestions.map((s, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => selectPharmacySuggestion(s.name)}
                                                className="group relative px-6 md:px-8 py-4 md:py-5 hover:bg-emerald-50/40 cursor-pointer flex items-center justify-between transition-all duration-300 border-b border-slate-50 last:border-0"
                                            >
                                                <div className="absolute left-0 top-0 bottom-0 w-0 group-hover:w-1 md:group-hover:w-1.5 bg-[#08B36A] transition-all duration-300" />

                                                <div className="flex items-center gap-4 md:gap-5 group-hover:translate-x-1 md:group-hover:translate-x-2 transition-transform duration-300">
                                                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 group-hover:from-white group-hover:to-white group-hover:shadow-md flex items-center justify-center text-slate-400 group-hover:text-[#08B36A] transition-all duration-300 ring-1 ring-slate-200/50 group-hover:ring-emerald-100">
                                                        <FaStore size={16} className="md:size-5 group-hover:scale-110 transition-transform" />
                                                    </div>

                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-[#08B36A] transition-colors">
                                                            {s.name}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-slate-200 group-hover:bg-emerald-300 transition-colors" />
                                                            <p className="text-[9px] md:text-[10px] text-slate-400 font-black tracking-widest uppercase">
                                                                {s.city}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 text-[#08B36A] transition-all duration-300">
                                                    <span className="hidden sm:inline text-[9px] font-black uppercase tracking-tighter">View Store</span>
                                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
                                                        <FaChevronRight size={8} className="md:size-3" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* HORIZONTAL SCROLL LIST */}
                    <div className="flex gap-4 md:gap-10 overflow-x-auto pb-10 md:pb-14 pt-2 no-scrollbar -mx-4 md:-mx-6 px-4 md:px-10 mask-edge">
                        {loadingPharmacies ? (
                            <>
                                <PharmacyCardSkeleton />
                                <PharmacyCardSkeleton />
                                <PharmacyCardSkeleton />
                            </>
                        ) : (
                            pharmacies.map((pharmacy) => (
                                <div
                                    key={pharmacy._id}
                                    onClick={() => router.push(`/buymedicine/singlepharmacydetail/${pharmacy._id}`)}
                                    className="group flex-shrink-0 cursor-pointer w-[300px] md:w-[380px] bg-white rounded-2xl md:rounded-[3rem] border border-slate-100 shadow-[0_15px_35px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-15px_rgba(8,179,106,0.2)] hover:-translate-y-2 md:hover:-translate-y-3 transition-all duration-500 p-5 md:p-8 flex flex-col justify-between h-[210px] md:h-[260px] relative overflow-hidden ring-1 ring-slate-100/50"
                                >
                                    {/* Glass Decor Circle */}
                                    <div className="absolute -top-12 md:-top-16 -right-12 md:-right-16 w-32 md:w-44 h-32 md:h-44 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full group-hover:scale-125 transition-transform duration-1000"></div>

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start">
                                            <div className="max-w-[70%]">
                                                <h3 className="font-black text-lg md:text-xl text-slate-800 group-hover:text-[#08B36A] transition-colors truncate mb-1 md:mb-1.5 tracking-tight">
                                                    {pharmacy.name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <div className="bg-emerald-100/50 p-1 md:p-1.5 rounded-lg">
                                                        <FaLocationArrow size={8} className="text-[#08B36A] md:size-2.5" />
                                                    </div>
                                                    <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest truncate">
                                                        {pharmacy.city} {pharmacy.distance && pharmacy.distance !== "0" ? `• ${pharmacy.distance} KM` : ""}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 md:gap-1.5 bg-white px-3 md:px-4 py-2 md:py-2.5 rounded-xl md:rounded-[1.25rem] text-amber-500 border border-slate-100 shadow-sm backdrop-blur-sm group-hover:border-amber-200 transition-all">
                                                <FaStar size={10} className="fill-amber-400 md:size-3" />
                                                <span className="text-[11px] md:text-[13px] font-black">{pharmacy.rating || "0.0"}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-5 md:mt-8">
                                            {pharmacy.isHomeDeliveryAvailable && (
                                                <Badge icon={<FaTruck size={10} />} text="Fast Delivery" color="emerald" />
                                            )}
                                            {pharmacy.is24x7 && (
                                                <Badge icon={<FaHistory size={10} />} text="24/7 Support" color="blue" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="relative z-10 flex items-center justify-between pt-4 md:pt-6 border-t border-slate-50/80">
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <div className="relative flex h-2.5 w-2.5 md:h-3 md:w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 md:h-3 md:w-3 bg-[#08B36A] border-2 border-white shadow-sm"></span>
                                            </div>
                                            <span className="text-[9px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] md:tracking-[0.15em]">
                                                {pharmacy.is24x7 ? "Open 24/7" : "Operating Now"}
                                            </span>
                                        </div>
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-[#08B36A] group-hover:text-white group-hover:rotate-[-8deg] group-hover:shadow-[0_10px_20px_-5px_rgba(8,179,106,0.4)] flex items-center justify-center transition-all duration-500">
                                            <FaChevronRight size={12} className="md:size-3.5" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        {!loadingPharmacies && pharmacies.length === 0 && (
                            <div className="w-full py-16 md:py-24 bg-white/40 backdrop-blur-md rounded-3xl md:rounded-[4rem] border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center">
                                <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center text-slate-200 mb-6 md:mb-8 shadow-inner ring-1 ring-slate-100">
                                    <FaStore size={30} className="md:size-10" />
                                </div>
                                <p className="text-slate-600 text-[11px] md:text-[13px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">No pharmacies nearby</p>
                                <p className="text-slate-400 text-[10px] md:text-xs mt-2 md:mt-3 font-medium">Try checking a different area or store name</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* SECTION DIVIDER */}
                <div className="relative my-4 md:my-6">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-slate-200/50"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-[#F8FAFC] px-6 md:px-10 py-2 md:py-3 rounded-full border border-slate-200/60 text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] md:tracking-[0.5em] shadow-sm backdrop-blur-sm ring-4 ring-[#F8FAFC]">
                            Marketplace
                        </span>
                    </div>
                </div>

                <div className="pt-0">
                    <AllPharmacyProducts />
                </div>

            </div>

            {/* Overlay for Click Outside */}
            {showPharmacySuggestions && (
                <div
                    className="fixed inset-0 z-[55] bg-slate-900/5 backdrop-blur-[2px] transition-all duration-700"
                    onClick={() => setShowPharmacySuggestions(false)}
                />
            )}

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .mask-edge {
                    mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
                }
                @media (min-width: 768px) {
                    .mask-edge {
                        mask-image: linear-gradient(to right, transparent 0%, black 5%, black 90%, transparent 100%);
                    }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
}