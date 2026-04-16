"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    FaArrowLeft, FaSearch, FaMapMarkerAlt,
    FaStar, FaClock, FaChevronRight, FaStore, FaHistory,
    FaTruck
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";
import AllPharmacyProducts from "./components/AllPharmacyProducts";

// --- SKELETON COMPONENT ---
const PharmacyCardSkeleton = () => (
    <div className="flex-shrink-0 w-[300px] h-[180px] bg-white rounded-3xl border border-slate-100 p-5 flex flex-col justify-between animate-pulse shadow-sm">
        <div>
            <div className="flex justify-between items-start">
                <div className="w-2/3">
                    <div className="h-4 bg-slate-200 rounded-md w-full mb-2"></div>
                    <div className="h-3 bg-slate-100 rounded-md w-1/2"></div>
                </div>
                <div className="w-12 h-6 bg-slate-100 rounded-lg"></div>
            </div>
            <div className="flex gap-2 mt-4">
                <div className="h-5 w-16 bg-slate-100 rounded-md"></div>
                <div className="h-5 w-16 bg-slate-100 rounded-md"></div>
            </div>
        </div>
        <div className="h-8 bg-slate-50 rounded-xl w-full"></div>
    </div>
);

// --- REUSABLE BADGE ---
const Badge = ({ icon, text, color }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        emerald: "bg-emerald-50 text-[#08B36A] border-emerald-100",
        slate: "bg-slate-50 text-slate-600 border-slate-100",
    };
    return (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-md border ${colors[color] || colors.slate}`}>
            {icon}
            <span className="text-[9px] font-black uppercase tracking-tighter">{text}</span>
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
                // Location metadata removed as we rely on lat/lng from storage
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

    // Re-fetch when coordinates or search query change
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
        <div className="min-h-screen font-sans bg-[#f8fafc] pb-20">
            {/* STICKY NAV */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-[#08B36A] transition-colors">
                        <FaArrowLeft /> Back
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#08B36A] rounded-lg text-white"><FaStore size={14} /></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Pharmacy Hub</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto pt-4 px-4">

                {/* SIMPLIFIED SEARCH BAR */}
                <div className="mb-10">
                    <div className="max-w-2xl mx-auto relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <FaSearch className="text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search Pharmacy by Name..."
                            value={pharmacyNameQuery}
                            onChange={(e) => handlePharmacyNameChange(e.target.value)}
                            onFocus={() => pharmacySuggestions.length > 0 && setShowPharmacySuggestions(true)}
                            className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#08B36A] transition-all shadow-sm"
                        />
                        {showPharmacySuggestions && pharmacySuggestions.length > 0 && (
                            <div className="absolute z-[60] w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto">
                                {pharmacySuggestions.map((s, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => selectPharmacySuggestion(s.name)}
                                        className="px-4 py-3 hover:bg-emerald-50 cursor-pointer flex items-center gap-3 border-b border-slate-50 last:border-0"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-[#08B36A]">
                                            <FaStore size={10} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-800 uppercase">{s.name}</p>
                                            <p className="text-[9px] text-slate-400 font-bold tracking-tighter uppercase">{s.city}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 1. PHARMACIES HORIZONTAL LIST */}
                <section className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                        <FaMapMarkerAlt className="text-[#08B36A]" />
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                            Stores Near Your Location
                        </h2>
                    </div>

                    <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar">
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
                                    className="group flex-shrink-0 cursor-pointer w-[320px] bg-white rounded-3xl border-2 border-transparent shadow-sm hover:border-[#08B36A] hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between h-[190px]"
                                >
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <div className="max-w-[70%]">
                                                <h3 className="font-black text-sm text-slate-800 group-hover:text-[#08B36A] transition-colors truncate">
                                                    {pharmacy.name}
                                                </h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                                                    {pharmacy.city} {pharmacy.distance && pharmacy.distance !== "0" ? `• ${pharmacy.distance} KM` : ""}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg text-amber-600 border border-amber-100">
                                                <FaStar size={10} />
                                                <span className="text-[10px] font-black">{pharmacy.rating || "0.0"}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {pharmacy.isHomeDeliveryAvailable && (
                                                <Badge icon={<FaTruck size={8} />} text="Home Delivery" color="emerald" />
                                            )}
                                            {pharmacy.is24x7 && (
                                                <Badge icon={<FaHistory size={8} />} text="24/7" color="blue" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <FaClock size={10} className="text-[#08B36A]" />
                                            <span className="text-[10px] font-black uppercase">
                                                {pharmacy.is24x7 ? "Open 24/7" : "Open Now"}
                                            </span>
                                        </div>
                                        <FaChevronRight size={12} className="text-slate-300 group-hover:text-[#08B36A] transform group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            ))
                        )}
                        {!loadingPharmacies && pharmacies.length === 0 && (
                            <div className="w-full py-10 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No pharmacies found near you</p>
                            </div>
                        )}
                    </div>
                </section>

                <hr className="border-slate-200 mb-6" />
                <AllPharmacyProducts />

            </div>

            {/* Click Outside Listener to close suggestion overlays */}
            {showPharmacySuggestions && (
                <div
                    className="fixed inset-0 z-[55]"
                    onClick={() => setShowPharmacySuggestions(false)}
                />
            )}
        </div>
    );
}