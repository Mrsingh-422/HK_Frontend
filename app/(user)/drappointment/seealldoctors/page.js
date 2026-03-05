"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    FaArrowLeft, FaSearch, FaUserMd, FaStar,
    FaChevronDown, FaFilter, FaMapMarkerAlt, FaStethoscope
} from "react-icons/fa";

import { DOCTORS_DATA } from "@/app/constants/constants";
import DoctorDetailsModal from "../components/otherComponents/DoctorDetailsModal";

const CATEGORIES = ["All", "Heart", "Neuro", "Skin", "Bones", "Dental", "Child Care"];

export default function AllDoctorsPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("rating-high");
    const [activeCategory, setActiveCategory] = useState("All");

    // MODAL STATES
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeDoctor, setActiveDoctor] = useState(null);

    const handleOpenDoctor = (doctor) => {
        setActiveDoctor(doctor);
        setIsModalOpen(true);
    };

    const filteredDoctors = useMemo(() => {
        let result = DOCTORS_DATA.filter((doc) => {
            const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.specialty.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = activeCategory === "All" || doc.category === activeCategory;
            return matchesSearch && matchesCategory;
        });

        if (sortBy === "online-low") result.sort((a, b) => a.consultFee - b.consultFee);
        else if (sortBy === "rating-high") result.sort((a, b) => b.rating - a.rating);

        return result;
    }, [searchTerm, sortBy, activeCategory]);

    return (
        <div className="min-h-screen font-sans selection:bg-[#08B36A]/10 bg-white">

            <DoctorDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                doctor={activeDoctor}
            />

            {/* NAV BAR */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-7">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-600 font-bold text-xs uppercase tracking-widest cursor-pointer">
                        <FaArrowLeft /> Back
                    </button>
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <FaUserMd className="text-[#08B36A] text-sm" />
                        <span className="text-[9px] font-black uppercase tracking-tighter">Verified Specialists</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto py-6 md:py-10 px-4">

                {/* HEADER & SEARCH */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                            Medical <span className="text-[#08B36A]">Specialists</span>
                        </h1>
                        <p className="text-slate-500 text-[10px] md:text-sm font-medium">Expert healthcare consultants.</p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                            <input
                                type="text"
                                placeholder="Search doctors..."
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
                                <option value="rating-high">Top Rated</option>
                                <option value="online-low">Fee: Low</option>
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
                    {filteredDoctors.map((doc) => (
                        <div
                            key={doc.id}
                            onClick={() => handleOpenDoctor(doc)}
                            className="bg-white rounded-2xl p-2.5 md:p-4 shadow-sm border border-slate-100 flex flex-col group hover:shadow-md transition-all cursor-pointer"
                        >
                            {/* Doctor Image Container */}
                            <div className="h-28 sm:h-36 md:h-48 w-full relative overflow-hidden rounded-xl bg-slate-50 mb-3">
                                <img
                                    src={doc.image}
                                    className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-500"
                                    alt={doc.name}
                                />
                                <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                                    <FaStar className="text-yellow-400 text-[8px]" />
                                    <span className="text-[8px] font-black">{doc.rating}</span>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1 flex flex-col space-y-1">
                                <div className="flex items-center gap-1 text-[7px] md:text-[10px] font-black text-[#08B36A] uppercase tracking-widest">
                                    <FaStethoscope className="text-[8px]" /> {doc.specialty}
                                </div>
                                <h3 className="text-[11px] md:text-base font-black text-slate-800 line-clamp-1">
                                    {doc.name}
                                </h3>
                                <div className="flex items-center gap-1 text-slate-400">
                                    <FaMapMarkerAlt className="text-[8px] md:text-[9px]" />
                                    <span className="text-[8px] md:text-[11px] font-bold truncate tracking-tight">
                                        {doc.address}
                                    </span>
                                </div>
                            </div>

                            {/* Price & Action */}
                            <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-50">
                                <div>
                                    <p className="text-[7px] font-bold text-slate-400 uppercase">Consult Fee</p>
                                    <p className="text-sm md:text-xl font-black text-slate-900">₹{doc.consultFee}</p>
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
                {filteredDoctors.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl mt-10">
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No specialists found in this category</p>
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