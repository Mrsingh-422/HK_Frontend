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

// Helper function to resolve dynamic image paths
const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.7:5002";
    // Cleans up 'public/' prefix to prevent duplicated path subsegments
    const cleanPath = imagePath.replace(/^public\//, "");
    
    const base = BASE_URL.replace(/\/+$/, '');
    const target = cleanPath.replace(/^\/+/, '');
    
    return `${base}/${target}`;
};

// --- REDESIGNED SKELETON COMPONENT ---
const PharmacyCardSkeleton = () => (
    <div className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[360px] h-[380px] bg-white rounded-3xl border border-slate-100 p-4 flex flex-col justify-between animate-pulse shadow-sm">
        <div>
            <div className="w-full h-40 bg-slate-200 rounded-2xl mb-4"></div>
            <div className="h-5 bg-slate-200 rounded-lg w-2/3 mb-2"></div>
            <div className="h-4 bg-sl`ate-100 rounded-md w-1/3 mb-4"></div>
            <div className="h-6 bg-slate-100 rounded-xl w-1/4"></div>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <div className="h-4 bg-slate-100 rounded w-1/4"></div>
            <div className="h-8 w-8 bg-slate-200 rounded-xl"></div>
        </div>
    </div>
);

// --- REUSABLE BADGE ---
const Badge = ({ icon, text, color }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        slate: "bg-slate-50 text-slate-600 border-slate-100",
    };
    return (
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[10px] font-bold tracking-wide backdrop-blur-md shadow-sm whitespace-nowrap ${colors[color] || colors.slate}`}>
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
                        <div className="flex gap-6 overflow-x-auto pb-8 pt-2 no-scrollbar mask-edge">
                            {loadingPharmacies ? (
                                Array(4).fill(0).map((_, i) => <PharmacyCardSkeleton key={i} />)
                            ) : (
                                pharmacies.map((pharmacy) => {
                                    // Extract the thumbnail target safely from profileImage or the document array
                                    const rawImgPath = pharmacy.profileImage || (pharmacy.documents?.pharmacyImages?.[0]);
                                    const dynamicImgUrl = getImageUrl(rawImgPath);

                                    return (
                                        <div
                                            key={pharmacy._id}
                                            onClick={() => router.push(`/buymedicine/singlepharmacydetail/${pharmacy._id}`)}
                                            className="group flex-shrink-0 cursor-pointer w-[280px] sm:w-[320px] md:w-[360px] bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 transition-all duration-300 p-4 flex flex-col justify-between h-[380px] relative overflow-hidden"
                                        >
                                            <div>
                                                {/* PREMIUM VISUAL THUMBNAIL */}
                                                <div className="relative w-full h-40 bg-slate-100 rounded-2xl overflow-hidden mb-4 shadow-inner">
                                                    {dynamicImgUrl ? (
                                                        <img
                                                            src={dynamicImgUrl}
                                                            alt={pharmacy.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            onError={(e) => {
                                                                // Fallback if image fails to render
                                                                e.target.onerror = null;
                                                                e.target.style.display = 'none';
                                                                e.target.parentNode.classList.add('flex', 'items-center', 'justify-center');
                                                                e.target.parentNode.innerHTML = `<div class="text-slate-300"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 576 512" height="40" width="40" xmlns="http://www.w3.org/2000/svg"><path d="M528 0H48C21.5 0 0 21.5 0 48v320c0 26.5 21.5 48 48 48h192l-16 48h-48c-8.8 0-16 7.2-16 16s7.2 16 16 16h224c8.8 0 16-7.2 16-16s-7.2-16-16-16h-48l-16-48h192c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48zm-16 352H64V64h448v288z"></path></svg></div>`;
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-300">
                                                            <FaStore size={40} />
                                                        </div>
                                                    )}

                                                    {/* FLOATING RATING BADGE */}
                                                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-amber-600 border border-white/20 shadow-sm">
                                                        <FaStar size={10} className="fill-amber-400" />
                                                        <span className="text-[11px] font-black">{pharmacy.rating || "0.0"}</span>
                                                    </div>
                                                </div>

                                                {/* CARD BODY CONTENT */}
                                                <div className="px-1 pb-3">
                                                    <h3 className="font-black text-lg text-slate-800 group-hover:text-[#08B36A] truncate transition-colors uppercase tracking-tight">
                                                        {pharmacy.name}
                                                    </h3>
                                                    
                                                    <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                                                        <FaLocationArrow size={9} className="text-emerald-500 shrink-0" />
                                                        <span className="text-[11px] font-bold uppercase truncate tracking-tight">
                                                            {pharmacy.city} {pharmacy.distance && pharmacy.distance !== "0" ? `• ${pharmacy.distance} KM` : ""}
                                                        </span>
                                                    </div>

                                                    {/* TAG FLAGS CONTAINER WITH MINIMUM HEIGHT ALIGNMENT */}
                                                    <div className="flex flex-wrap gap-2 mt-4 min-h-[26px]">
                                                        {pharmacy.isHomeDeliveryAvailable && <Badge icon={<FaTruck size={10} />} text="Delivery" color="emerald" />}
                                                        {pharmacy.is24x7 && <Badge icon={<FaHistory size={10} />} text="24/7" color="blue" />}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* FOOTER METRICS */}
                                            <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 px-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`flex h-2 w-2 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] ${pharmacy.openStatus === "Open Now" || pharmacy.is24x7 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                                                        {pharmacy.openStatus || (pharmacy.is24x7 ? "Always Open" : "Open Now")}
                                                    </span>
                                                </div>
                                                <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-[#08B36A] group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm">
                                                    <FaChevronRight size={11} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
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