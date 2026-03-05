"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    FaArrowLeft, FaSearch, FaUserMd, FaStar,
    FaChevronDown, FaFilter, FaMapMarkerAlt, FaVideo, FaHospital, FaTimes
} from "react-icons/fa";

import { DOCTORS_DATA } from "@/app/constants/constants";
import DoctorDetailsModal from "../components/otherComponents/DoctorDetailsModal";

const CATEGORIES = ["All", "Heart", "Neuro", "Skin", "Bones", "Dental", "Child Care"];

export default function AllDoctorsPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("rating-high");
    const [activeCategory, setActiveCategory] = useState("All");

    // 2. State management
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
        if (sortBy === "clinic-low") result.sort((a, b) => a.clinicFee - b.clinicFee);
        if (sortBy === "rating-high") result.sort((a, b) => b.rating - a.rating);

        return result;
    }, [searchTerm, sortBy, activeCategory]);

    return (
        <div className="min-h-screen font-sans bg-white selection:bg-[#08B36A]/10">
            {/* 3. Add the component once at the bottom of the JSX */}
            <DoctorDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                doctor={activeDoctor}
            />
            {/* STICKY NAVIGATION */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100 px-4 py-4 md:py-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-600 font-bold text-[10px] md:text-xs uppercase tracking-widest cursor-pointer">
                        <FaArrowLeft /> Back
                    </button>
                    <div className="flex items-center gap-1 text-slate-400">
                        <FaUserMd className="text-[#08B36A] text-xs" />
                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-tighter">Verified Doctors</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto py-4 md:py-10 px-3 md:px-6">

                {/* HEADER SECTION */}
                <div className="flex flex-col gap-4 mb-6 md:mb-10">
                    <div>
                        <h1 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tight">
                            Find Your <span className="text-[#08B36A]">Specialist</span>
                        </h1>
                        <p className="text-slate-500 text-[10px] md:text-sm font-medium mt-1 uppercase tracking-widest">Available Medical Consultants</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                            <input
                                type="text"
                                placeholder="Doctor name or disease..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-9 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#08B36A] outline-none text-xs font-bold"
                            />
                            {searchTerm && <FaTimes className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 cursor-pointer" onClick={() => setSearchTerm("")} />}
                        </div>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full appearance-none bg-slate-900 text-white rounded-xl px-4 py-3 pr-10 text-[9px] font-black uppercase tracking-widest outline-none cursor-pointer"
                            >
                                <option value="rating-high">Top Rated</option>
                                <option value="online-low">Online: Low Fee</option>
                                <option value="clinic-low">Clinic: Low Fee</option>
                            </select>
                            <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* CATEGORY FILTER BAR */}
                <div className="flex items-center gap-2 overflow-x-auto pb-6 no-scrollbar">
                    <div className="flex items-center gap-2 pr-3 border-r border-slate-100">
                        <FaFilter className="text-slate-400 text-[10px]" />
                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Filters</span>
                    </div>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`cursor-pointer whitespace-nowrap px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeCategory === cat
                                ? "bg-[#08B36A] text-white shadow-lg shadow-emerald-100"
                                : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* GRID - 2 COLUMNS ON MOBILE */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                    {filteredDoctors.map((doc) => (
                        <div key={doc.id} className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-2.5 md:p-5 shadow-sm border border-slate-100 flex flex-col group hover:shadow-xl transition-all duration-300 relative">

                            {/* Rating Badge */}
                            <div className="absolute top-4 right-4 z-10 hidden md:flex items-center gap-1 bg-yellow-400 text-white px-2 py-1 rounded-lg">
                                <FaStar className="text-[10px]" />
                                <span className="text-[10px] font-black">{doc.rating}</span>
                            </div>

                            {/* Doctor Image */}
                            <div className="h-28 sm:h-36 md:h-44 w-full relative overflow-hidden rounded-xl md:rounded-3xl bg-slate-50 mb-3">
                                <img src={doc.image} className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-500" alt={doc.name} />
                                <div className="absolute bottom-2 left-2 flex items-center gap-1 md:hidden bg-yellow-400 text-white px-1.5 py-0.5 rounded-md">
                                    <FaStar className="text-[8px]" />
                                    <span className="text-[8px] font-black">{doc.rating}</span>
                                </div>
                            </div>

                            {/* Doctor Details */}
                            <div className="flex-1 space-y-0.5 md:space-y-1">
                                <span className="text-[7px] md:text-[10px] font-black text-[#08B36A] uppercase tracking-widest">{doc.specialty}</span>
                                <h3 className="text-[11px] md:text-lg font-black text-slate-800 line-clamp-1 truncate">{doc.name}</h3>
                                <div className="flex items-center gap-1 text-slate-400">
                                    <FaMapMarkerAlt className="text-[8px] md:text-[10px]" />
                                    <span className="text-[8px] md:text-[11px] font-bold truncate tracking-tight">{doc.address}</span>
                                </div>
                            </div>

                            {/* FEE DISPLAY */}
                            <div className="mt-3 md:mt-4 grid grid-cols-1 gap-1.5">
                                {/* ONLINE BUTTON */}
                                <button
                                    onClick={() => handleOpenDoctor(doc)}
                                    className="group/btn bg-[#08B36A] hover:bg-slate-900 text-white p-1.5 md:p-2.5 rounded-lg md:rounded-xl transition-all flex flex-col items-center justify-center relative overflow-hidden cursor-pointer"
                                >
                                    <span className="text-[9px] md:text-[13px] font-black leading-none">₹{doc.consultFee}</span>
                                    <span className="text-[6px] md:text-[9px] font-bold uppercase tracking-widest mt-0.5 opacity-90 flex items-center gap-1">
                                        <FaVideo className="text-[7px] md:text-[10px]" /> Online
                                    </span>
                                </button>

                                {/* CLINIC BUTTON */}
                                <button
                                    onClick={() => handleOpenDoctor(doc)}
                                    className="bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 p-1.5 md:p-2.5 rounded-lg md:rounded-xl transition-all flex flex-col items-center justify-center cursor-pointer"
                                >
                                    <span className="text-[9px] md:text-[13px] font-black leading-none">₹{doc.clinicFee}</span>
                                    <span className="text-[6px] md:text-[9px] font-bold uppercase tracking-widest mt-0.5 opacity-70 flex items-center gap-1">
                                        <FaHospital className="text-[7px] md:text-[10px]" /> Clinic
                                    </span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* EMPTY STATE */}
                {filteredDoctors.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl mt-6">
                        <FaUserMd className="mx-auto text-4xl text-slate-200 mb-2" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No specialists found</p>
                        <button onClick={() => { setSearchTerm(""); setActiveCategory("All"); }} className="text-[#08B36A] text-[10px] font-bold uppercase mt-2 underline">Reset Filters</button>
                    </div>
                )}
            </div>
        </div>
    );
}