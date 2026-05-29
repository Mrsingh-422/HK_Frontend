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
    <div className="flex-shrink-0 w-[260px] sm:w-[300px] md:w-[350px] h-[200px] md:h-[240px] bg-white/80 backdrop-blur-md rounded-2xl md:rounded-[2.5rem] border border-white p-5 md:p-7 flex flex-col justify-between animate-pulse shadow-lg shadow-slate-200/50">
        <div>
            <div className="flex justify-between items-start">
                <div className="w-2/3">
                    <div className="h-4 md:h-5 bg-slate-200 rounded-lg w-full mb-3"></div>
                    <div className="h-3 bg-slate-100 rounded-md w-1/2"></div>
                </div>
                <div className="w-8 h-8 md:w-12 md:h-12 bg-slate-100 rounded-xl"></div>
            </div>
            <div className="flex gap-2 mt-6">
                <div className="h-5 w-16 bg-slate-100 rounded-full"></div>
                <div className="h-5 w-16 bg-slate-100 rounded-full"></div>
            </div>
        </div>
        <div className="h-10 bg-slate-50 rounded-xl w-full"></div>
    </div>
);

// --- REUSABLE BADGE ---
const Badge = ({ icon, text, color }) => {
    const colors = {
        blue: "bg-blue-50/80 text-blue-700 border-blue-200/50",
        emerald: "bg-emerald-50/80 text-[#069669] border-emerald-200/50",
        slate: "bg-slate-50/80 text-slate-600 border-slate-200/50",
    };
    return (
        <div className={`flex items-center gap-1.5 px-2.5 md:px-4 py-1 md:py-2 rounded-lg md:rounded-2xl border text-[8px] md:text-[9px] font-black tracking-wider backdrop-blur-md shadow-sm whitespace-nowrap ${colors[color] || colors.slate}`}>
            <span className="shrink-0">{icon}</span>
            <span className="uppercase">{text}</span>
        </div>
    );
};

export default function AllMedicinesPage() {
    const router = useRouter();

    const [pharmacies, setPharmacies] = useState([]);
    const [loadingPharmacies, setLoadingPharmacies] = useState(true);
    const [pharmacyNameQuery, setPharmacyNameQuery] = useState("");
    const [pharmacySuggestions, setPharmacySuggestions] = useState([]);
    const [showPharmacySuggestions, setShowPharmacySuggestions] = useState(false);
    const [coords, setCoords] = useState({ lat: null, lng: null });

    const isSynced = useRef(false);

    useEffect(() => {
        const storedCoords = localStorage.getItem("userCoords");
        if (storedCoords) {
            try {
                setCoords(JSON.parse(storedCoords));
            } catch (error) {
                console.error("Failed to parse userCoords", error);
            }
        }
        isSynced.current = true;
    }, []);

    const fetchPharmacies = useCallback(async () => {
        if (!isSynced.current && !coords.lat) return;
        setLoadingPharmacies(true);
        try {
            const response = await UserAPI.getAllPharmacies({
                search: pharmacyNameQuery,
                lat: coords.lat,
                lng: coords.lng,
            });
            if (response.success) setPharmacies(response.data || []);
        } catch (error) {
            console.error("Error fetching pharmacies:", error);
        } finally {
            setLoadingPharmacies(false);
        }
    }, [coords, pharmacyNameQuery]);

    useEffect(() => { fetchPharmacies(); }, [fetchPharmacies]);

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

    return (
        <div className="min-h-screen font-sans bg-[#F8FAFC] pb-10 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
            <SecondNavbar />

            {/* Premium Background Elements */}
            <div className="fixed top-0 right-0 -z-10 w-[250px] md:w-[600px] h-[250px] md:h-[600px] bg-gradient-to-br from-emerald-100/30 to-blue-100/30 rounded-full blur-[60px] md:blur-[140px] pointer-events-none"></div>
            <div className="fixed -bottom-20 -left-20 -z-10 w-[250px] md:w-[600px] h-[250px] md:h-[600px] bg-gradient-to-tr from-blue-100/20 to-emerald-50/30 rounded-full blur-[60px] md:blur-[140px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto pt-6 px-4 sm:px-6 lg:px-8">

                {/* 1. PHARMACIES SECTION */}
                <section className="mb-8">
                    {/* HEADER */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-[#08B36A] to-[#047857] flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 ring-4 ring-white">
                                <FaClinicMedical className="text-xl md:text-2xl" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">Local Pharmacies</h2>
                                <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Verified Stores
                                </p>
                            </div>
                        </div>

                        {/* SEARCH BAR */}
                        <div className={`relative w-full lg:w-[400px] ${showPharmacySuggestions ? 'z-[60]' : 'z-10'}`}>
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                <FaSearch className="text-slate-300 size-4" />
                            </div>
                            <input
                                type="text"
                                placeholder="Find a store near you..."
                                value={pharmacyNameQuery}
                                onChange={(e) => handlePharmacyNameChange(e.target.value)}
                                onFocus={() => pharmacySuggestions.length > 0 && setShowPharmacySuggestions(true)}
                                className="w-full pl-12 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-[#08B36A] focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-sm"
                            />

                            {/* SUGGESTIONS */}
                            {showPharmacySuggestions && pharmacySuggestions.length > 0 && (
                                <div className="absolute w-full mt-3 bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-[300px] md:max-h-[400px] overflow-hidden flex flex-col ring-1 ring-black/5">
                                    <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Suggested Stores</span>
                                    </div>
                                    <div className="overflow-y-auto custom-scrollbar">
                                        {pharmacySuggestions.map((s, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => { setPharmacyNameQuery(s.name); setShowPharmacySuggestions(false); }}
                                                className="px-5 py-4 hover:bg-emerald-50/50 cursor-pointer flex items-center gap-4 transition-colors border-b border-slate-50 last:border-0"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                                    <FaStore size={14} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-slate-800 truncate uppercase">{s.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{s.city}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* HORIZONTAL LIST */}
                    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
                        <div className="flex gap-4 md:gap-8 overflow-x-auto pb-8 pt-2 no-scrollbar mask-edge">
                            {loadingPharmacies ? (
                                Array(4).fill(0).map((_, i) => <PharmacyCardSkeleton key={i} />)
                            ) : (
                                pharmacies.map((pharmacy) => (
                                    <div
                                        key={pharmacy._id}
                                        onClick={() => router.push(`/buymedicine/singlepharmacydetail/${pharmacy._id}`)}
                                        className="group flex-shrink-0 cursor-pointer w-[260px] sm:w-[320px] md:w-[380px] bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1.5 transition-all duration-300 p-5 md:p-8 flex flex-col justify-between h-[210px] md:h-[260px] relative overflow-hidden"
                                    >
                                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="min-w-0">
                                                    <h3 className="font-black text-base md:text-xl text-slate-800 group-hover:text-[#08B36A] truncate transition-colors uppercase tracking-tight">
                                                        {pharmacy.name}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                                                        <FaLocationArrow size={8} className="text-emerald-500" />
                                                        <span className="text-[9px] md:text-[11px] font-black uppercase truncate tracking-tighter">
                                                            {pharmacy.city} {pharmacy.distance && pharmacy.distance !== "0" ? `• ${pharmacy.distance} KM` : ""}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg text-amber-600 border border-amber-100 shrink-0">
                                                    <FaStar size={10} className="fill-amber-400" />
                                                    <span className="text-[10px] md:text-xs font-black">{pharmacy.rating || "0.0"}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mt-5 md:mt-8">
                                                {pharmacy.isHomeDeliveryAvailable && <Badge icon={<FaTruck size={10} />} text="Delivery" color="emerald" />}
                                                {pharmacy.is24x7 && <Badge icon={<FaHistory size={10} />} text="24/7" color="blue" />}
                                            </div>
                                        </div>

                                        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-slate-50">
                                            <div className="flex items-center gap-2">
                                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                                <span className="text-[9px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                                    {pharmacy.is24x7 ? "Always Open" : "Open Now"}
                                                </span>
                                            </div>
                                            <div className="w-8 h-8 md:w-11 md:h-11 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-[#08B36A] group-hover:text-white flex items-center justify-center transition-all duration-300">
                                                <FaChevronRight size={10} className="md:size-3" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            {!loadingPharmacies && pharmacies.length === 0 && (
                                <div className="w-full py-12 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center">
                                    <FaStore size={32} className="text-slate-200 mb-4" />
                                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest">No pharmacies found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* DIVIDER */}
                <div className="relative py-4 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200/60"></div></div>
                    <span className="relative bg-[#F8FAFC] px-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap">Marketplace</span>
                </div>

                <div className="mt-4">
                    <AllPharmacyProducts />
                </div>
            </div>

            {showPharmacySuggestions && (
                <div className="fixed inset-0 z-[55] bg-slate-900/10 backdrop-blur-[2px]" onClick={() => setShowPharmacySuggestions(false)} />
            )}

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .mask-edge {
                    mask-image: linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%);
                }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
}