"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    FaArrowLeft, FaSearch, FaHospital, FaStar,
    FaChevronDown, FaFilter, FaMapMarkerAlt, FaLocationArrow,
    FaBed, FaUserMd, FaClock, FaCheckCircle
} from "react-icons/fa";

// Import your data from constants
import { HOSPITAL_DATA } from "@/app/constants/constants";
import HospitalDetailsModal from "../components/otherComponents/HospitalDetailsModal";

const CATEGORIES = ["All", "Cardiology", "Orthopedics", "Neurology", "Pediatrics", "Emergency"];

export default function AllHospitalsPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("distance");
    const [activeCategory, setActiveCategory] = useState("All");

    // MODAL STATES
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSelectHospital = (hospital) => {
        setSelectedHospital(hospital);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedHospital(null), 300);
    };

    const filteredHospitals = useMemo(() => {
        let result = HOSPITAL_DATA.filter((hosp) => {
            const matchesSearch =
                hosp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                hosp.address.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = activeCategory === "All" ||
                hosp.specialties.some(spec => spec === activeCategory);

            return matchesSearch && matchesCategory;
        });

        if (sortBy === "beds-high") result.sort((a, b) => b.beds - a.beds);
        else if (sortBy === "distance") result.sort((a, b) => a.distance - b.distance);
        else if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);

        return result;
    }, [searchTerm, sortBy, activeCategory]);

    return (
        <div className="min-h-screen font-sans selection:bg-[#08B36A]/10 bg-white">

            <HospitalDetailsModal
                isOpen={isModalOpen}
                hospital={selectedHospital}
                onClose={closeModal}
            />

            {/* NAV BAR */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-7">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-600 font-bold text-xs uppercase tracking-widest cursor-pointer">
                        <FaArrowLeft /> Back
                    </button>
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <FaHospital className="text-[#08B36A] text-sm" />
                        <span className="text-[9px] font-black uppercase tracking-tighter">Verified Healthcare</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto py-6 md:py-10 px-4">

                {/* HEADER & SEARCH */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                            Find <span className="text-[#08B36A]">Hospitals</span>
                        </h1>
                        <p className="text-slate-500 text-[10px] md:text-sm font-medium">Advanced healthcare centers near you.</p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                            <input
                                type="text"
                                placeholder="Search hospital or specialty..."
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
                                <option value="rating">Top Rated</option>
                                <option value="beds-high">Most Beds</option>
                            </select>
                            <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* CATEGORY FILTER BAR */}
                <div className="flex items-center gap-2 overflow-x-auto pb-6 no-scrollbar">
                    <div className="flex items-center gap-2 pr-4 border-r border-slate-100">
                        <FaFilter className="text-slate-400 text-xs" />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Filters</span>
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
                    {filteredHospitals.map((hosp) => (
                        <div
                            key={hosp.id}
                            onClick={() => handleSelectHospital(hosp)}
                            className="bg-white rounded-2xl p-2.5 md:p-4 shadow-sm border border-slate-100 flex flex-col group hover:shadow-md transition-all cursor-pointer"
                        >
                            {/* Image Container */}
                            <div className="h-28 sm:h-36 md:h-48 w-full relative overflow-hidden rounded-xl bg-slate-50 mb-3">
                                <img
                                    src={hosp.image}
                                    className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-500"
                                    alt={hosp.name}
                                />
                                {hosp.emergency && (
                                    <div className="absolute top-2 left-2">
                                        <span className="bg-red-500 text-white text-[7px] font-black px-2 py-0.5 rounded uppercase tracking-widest animate-pulse">
                                            Emergency 24/7
                                        </span>
                                    </div>
                                )}
                                <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                                    <FaStar className="text-yellow-400 text-[8px]" />
                                    <span className="text-[8px] font-black">{hosp.rating}.0</span>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1 flex flex-col space-y-1">
                                <div className="flex items-center gap-1 text-[7px] md:text-[10px] font-black text-[#08B36A] uppercase tracking-widest">
                                    <FaLocationArrow className="text-[7px]" /> {hosp.distance} m away
                                </div>
                                <h3 className="text-[11px] md:text-base font-black text-slate-800 line-clamp-1">
                                    {hosp.name}
                                </h3>
                                <div className="flex items-center gap-1 text-slate-400">
                                    <FaMapMarkerAlt className="text-[8px] md:text-[9px]" />
                                    <span className="text-[8px] md:text-[11px] font-bold truncate tracking-tight">
                                        {hosp.address}
                                    </span>
                                </div>

                                {/* Hospital Specific Stats */}
                                <div className="flex items-center gap-3 mt-1 pt-1">
                                    <div className="flex items-center gap-1 text-slate-500">
                                        <FaUserMd className="text-[9px]" />
                                        <span className="text-[9px] font-black">{hosp.doctors}+ Dr.</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-500">
                                        <FaBed className="text-[9px]" />
                                        <span className="text-[9px] font-black">{hosp.beds} Beds</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-50">
                                <div className="flex items-center gap-1">
                                    <FaClock className="text-slate-400 text-[9px]" />
                                    <span className="text-[9px] font-black text-slate-900 uppercase">{hosp.timing}</span>
                                </div>
                                <button
                                    className="bg-[#08B36A] hover:bg-slate-900 text-white font-bold px-4 md:px-6 py-1.5 md:py-2 rounded-lg text-[9px] md:text-[11px] uppercase tracking-widest transition-all active:scale-90"
                                >
                                    View
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* EMPTY STATE */}
                {filteredHospitals.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl mt-10">
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No hospitals found in this category</p>
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