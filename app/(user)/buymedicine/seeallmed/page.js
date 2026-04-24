"use client";

import React, { useState, useEffect, useCallback } from "react";
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
    <div className="flex-shrink-0 w-[320px] h-[220px] bg-white rounded-[2rem] border border-slate-100 p-6 flex flex-col justify-between animate-pulse shadow-sm">
        <div>
            <div className="flex justify-between items-start">
                <div className="w-2/3">
                    <div className="h-5 bg-slate-200 rounded-lg w-full mb-3"></div>
                    <div className="h-3 bg-slate-100 rounded-md w-1/2"></div>
                </div>
                <div className="w-10 h-10 bg-slate-100 rounded-2xl"></div>
            </div>
            <div className="flex gap-2 mt-6">
                <div className="h-7 w-20 bg-slate-100 rounded-full"></div>
                <div className="h-7 w-20 bg-slate-100 rounded-full"></div>
            </div>
        </div>
        <div className="h-12 bg-slate-50 rounded-2xl w-full"></div>
    </div>
);

// --- REUSABLE BADGE ---
const Badge = ({ icon, text, color }) => {
    const colors = {
        blue: "bg-blue-50/50 text-blue-600 border-blue-100/50",
        emerald: "bg-emerald-50/50 text-[#08B36A] border-emerald-100/50",
        slate: "bg-slate-50 text-slate-500 border-slate-100",
    };
    return (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-extrabold tracking-wide backdrop-blur-md ${colors[color] || colors.slate}`}>
            <span className="opacity-80">{icon}</span>
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
    }, []);

    // 2. Fetch Pharmacies Logic
    const fetchPharmacies = useCallback(async () => {
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
        <div className="min-h-screen font-sans bg-[#FAFBFF] pb-20 selection:bg-emerald-100 selection:text-emerald-900">
            <SecondNavbar />

            {/* Subtle background blob for modern aesthetic */}
            <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-emerald-50/40 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-blue-50/40 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto pt-6 px-6">

                {/* 1. PHARMACIES SECTION */}
                <section className="mb-0">
                    {/* HEADER WITH INTEGRATED SEARCH */}
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                        {/* Left Side: Title */}
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-[#08B36A] to-[#059669] flex items-center justify-center text-white shadow-[0_10px_25px_-5px_rgba(8,179,106,0.4)]">
                                <FaClinicMedical size={24} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-1">
                                    Local Pharmacies
                                </h2>
                                <p className="flex items-center gap-2 text-[12px] font-bold text-slate-500 uppercase tracking-[0.15em]">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Verified Stores Nearby
                                </p>
                            </div>
                        </div>

                        {/* Right Side: Search Bar - Elevated Z-index when suggestions shown to prevent blur */}
                        <div className={`relative group w-full lg:w-[420px] ${showPharmacySuggestions ? 'z-[60]' : 'z-10'}`}>
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                <FaSearch className="text-slate-400 group-focus-within:text-[#08B36A] transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search stores by name..."
                                value={pharmacyNameQuery}
                                onChange={(e) => handlePharmacyNameChange(e.target.value)}
                                onFocus={() => pharmacySuggestions.length > 0 && setShowPharmacySuggestions(true)}
                                className="w-full pl-12 pr-6 py-4.5 bg-white border border-slate-200 rounded-[1.25rem] text-sm font-bold focus:ring-[6px] focus:ring-emerald-500/5 focus:border-[#08B36A] transition-all shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] placeholder:text-slate-400"
                            />

                            {/* Suggestions Dropdown */}
                            {showPharmacySuggestions && pharmacySuggestions.length > 0 && (
                                <div className="absolute z-[61] w-full mt-3 bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100 max-h-80 overflow-hidden overflow-y-auto">
                                    {pharmacySuggestions.map((s, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => selectPharmacySuggestion(s.name)}
                                            className="px-6 py-4 hover:bg-emerald-50/80 cursor-pointer flex items-center gap-4 border-b border-slate-50 last:border-0 transition-colors"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-emerald-100/50 flex items-center justify-center text-[#08B36A]">
                                                <FaStore size={14} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{s.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{s.city}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* HORIZONTAL SCROLL LIST */}
                    <div className="flex gap-8 overflow-x-auto pb-10 no-scrollbar -mx-6 px-6 mask-edge">
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
                                    className="group flex-shrink-0 cursor-pointer w-[350px] bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_60px_-15px_rgba(8,179,106,0.15)] hover:-translate-y-2 transition-all duration-500 p-7 flex flex-col justify-between h-[230px] relative overflow-hidden"
                                >
                                    {/* Glass Decor Circle */}
                                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start">
                                            <div className="max-w-[70%]">
                                                <h3 className="font-extrabold text-lg text-slate-800 group-hover:text-[#08B36A] transition-colors truncate mb-1">
                                                    {pharmacy.name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <FaLocationArrow size={10} className="text-[#08B36A]" />
                                                    <span className="text-[11px] font-extrabold uppercase tracking-widest">
                                                        {pharmacy.city} {pharmacy.distance && pharmacy.distance !== "0" ? `• ${pharmacy.distance} KM` : ""}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-amber-50/50 px-3 py-2 rounded-2xl text-amber-500 border border-amber-100/50 backdrop-blur-sm">
                                                <FaStar size={12} />
                                                <span className="text-xs font-black">{pharmacy.rating || "0.0"}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-6">
                                            {pharmacy.isHomeDeliveryAvailable && (
                                                <Badge icon={<FaTruck size={10} />} text="Fast Delivery" color="emerald" />
                                            )}
                                            {pharmacy.is24x7 && (
                                                <Badge icon={<FaHistory size={10} />} text="24/7 Service" color="blue" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="relative z-10 flex items-center justify-between pt-5 border-t border-slate-50">
                                        <div className="flex items-center gap-2.5">
                                            <div className="relative flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#08B36A]"></span>
                                            </div>
                                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                                {pharmacy.is24x7 ? "Open 24/7" : "Operating Now"}
                                            </span>
                                        </div>
                                        <div className="w-10 h-10 rounded-2xl bg-slate-50 group-hover:bg-[#08B36A] group-hover:text-white group-hover:rotate-[-10deg] flex items-center justify-center transition-all duration-300">
                                            <FaChevronRight size={12} />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        {!loadingPharmacies && pharmacies.length === 0 && (
                            <div className="w-full py-20 bg-white/50 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6">
                                    <FaStore size={32} />
                                </div>
                                <p className="text-slate-500 text-sm font-black uppercase tracking-[0.2em]">No local stores found</p>
                                <p className="text-slate-400 text-xs mt-2">Try adjusting your search query or location</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* SECTION DIVIDER */}
                <div className="relative mb-0">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-slate-200/60"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-[#FAFBFF] px-8 py-2 rounded-full border border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] shadow-sm">
                            Product Marketplace
                        </span>
                    </div>
                </div>

                <AllPharmacyProducts />

            </div>

            {/* Overlay for Click Outside - Reduced blur and staged below search */}
            {showPharmacySuggestions && (
                <div
                    className="fixed inset-0 z-[55] bg-slate-900/5 backdrop-blur-[2px] transition-all duration-500"
                    onClick={() => setShowPharmacySuggestions(false)}
                />
            )}

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .mask-edge {
                    mask-image: linear-gradient(to right, black 80%, transparent 100%);
                }
            `}</style>
        </div>
    );
}