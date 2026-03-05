"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    FaArrowLeft, FaSearch, FaAmbulance, FaStar,
    FaChevronDown, FaFilter, FaMapMarkerAlt, FaLocationArrow, FaClock
} from "react-icons/fa";
import { AMBULANCE_DATA } from '../../../constants/constants'

const CATEGORIES = ["All", "ICU", "ALS", "BLS", "PTV", "NNA"];

export default function AllAmbulancesPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("distance");
    const [activeCategory, setActiveCategory] = useState("All");

    const filteredAmbulances = useMemo(() => {
        let result = AMBULANCE_DATA.filter((amb) => {
            const matchesSearch =
                amb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                amb.vendor.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = activeCategory === "All" || amb.type === activeCategory;
            return matchesSearch && matchesCategory;
        });

        if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
        else if (sortBy === "distance") result.sort((a, b) => a.distance - b.distance);
        else if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);

        return result;
    }, [searchTerm, sortBy, activeCategory]);

    const handleBookClick = (amb) => {
        // You can open a modal here similar to DoctorDetailsModal
        alert(`Booking ${amb.name}`);
    };

    return (
        <div className="min-h-screen font-sans selection:bg-[#08B36A]/10 bg-white">

            {/* NAV BAR */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-7">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-600 font-bold text-xs uppercase tracking-widest cursor-pointer">
                        <FaArrowLeft /> Back
                    </button>
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <FaAmbulance className="text-[#08B36A] text-sm" />
                        <span className="text-[9px] font-black uppercase tracking-tighter">Emergency Response</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto py-6 md:py-10 px-4">

                {/* HEADER & SEARCH */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                            Emergency <span className="text-[#08B36A]">Ambulances</span>
                        </h1>
                        <p className="text-slate-500 text-[10px] md:text-sm font-medium">Fastest medical transport in your area.</p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                            <input
                                type="text"
                                placeholder="Search ambulance or city..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#08B36A] outline-none text-xs"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-[9px] font-black uppercase tracking-widest outline-none cursor-pointer"
                            >
                                <option value="distance">Nearest First</option>
                                <option value="price-low">Price: Low</option>
                                <option value="rating">Top Rated</option>
                            </select>
                            <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* CATEGORY FILTER BAR */}
                <div className="flex items-center gap-2 overflow-x-auto pb-6 no-scrollbar">
                    <div className="flex items-center gap-2 pr-4 border-r border-slate-100">
                        <FaFilter className="text-slate-400 text-xs" />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Type</span>
                    </div>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`whitespace-nowrap px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat
                                ? "bg-[#08B36A] text-white shadow-lg shadow-emerald-100"
                                : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* GRID */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                    {filteredAmbulances.map((amb) => (
                        <div
                            key={amb.id}
                            className="bg-white rounded-2xl p-2.5 md:p-4 shadow-sm border border-slate-100 flex flex-col group hover:shadow-md transition-all cursor-pointer"
                        >
                            {/* Image Container */}
                            <div className="h-28 sm:h-36 md:h-48 w-full relative overflow-hidden rounded-xl bg-slate-50 mb-3">
                                <img
                                    src={amb.image}
                                    className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-500"
                                    alt={amb.name}
                                />
                                {amb.available24x7 && (
                                    <div className="absolute top-2 left-2">
                                        <span className="bg-red-500 text-white text-[7px] font-black px-2 py-0.5 rounded uppercase tracking-widest animate-pulse">
                                            24/7 Live
                                        </span>
                                    </div>
                                )}
                                <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                                    <FaStar className="text-yellow-400 text-[8px]" />
                                    <span className="text-[8px] font-black">{amb.rating}.0</span>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1 flex flex-col space-y-1">
                                <div className="flex items-center gap-1 text-[7px] md:text-[10px] font-black text-[#08B36A] uppercase tracking-widest">
                                    <FaLocationArrow className="text-[7px]" /> {amb.distance} km away
                                </div>
                                <h3 className="text-[11px] md:text-base font-black text-slate-800 line-clamp-1">
                                    {amb.name}
                                </h3>
                                <div className="flex items-center gap-1 text-slate-400">
                                    <FaMapMarkerAlt className="text-[8px] md:text-[9px]" />
                                    <span className="text-[8px] md:text-[11px] font-bold truncate tracking-tight">
                                        {amb.vendor} • {amb.type}
                                    </span>
                                </div>
                            </div>

                            {/* Price & Action */}
                            <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-50">
                                <div>
                                    <p className="text-[7px] font-bold text-slate-400 uppercase">Est. Fare</p>
                                    <p className="text-sm md:text-xl font-black text-slate-900">₹{amb.price}</p>
                                </div>
                                <button
                                    onClick={() => handleBookClick(amb)}
                                    className="bg-[#08B36A] hover:bg-slate-900 text-white font-bold px-4 md:px-6 py-1.5 md:py-2 rounded-lg text-[9px] md:text-[11px] uppercase tracking-widest transition-all active:scale-90"
                                >
                                    Book
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* EMPTY STATE */}
                {filteredAmbulances.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl mt-10">
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No ambulances found</p>
                        <button
                            onClick={() => { setSearchTerm(""); setActiveCategory("All"); }}
                            className="text-[#08B36A] text-[10px] font-bold uppercase mt-2 underline"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}