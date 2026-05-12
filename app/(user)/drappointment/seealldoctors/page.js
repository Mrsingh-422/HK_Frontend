"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    FaArrowLeft, FaSearch, FaUserMd, FaStar,
    FaChevronDown, FaFilter, FaMapMarkerAlt, FaStethoscope, FaCheckCircle
} from "react-icons/fa";

import UserAPI from "@/app/services/UserAPI"; 

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function AllDoctorsPage() {
    const router = useRouter();
    const [doctors, setDoctors] = useState([]);
    const [specializations, setSpecializations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("rating-high");
    const [activeCategory, setActiveCategory] = useState("All");

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);

                // Retrieve coordinates from localStorage
                let coordsPayload = {};
                const storedCoords = localStorage.getItem('userCoords');
                
                if (storedCoords) {
                    try {
                        const parsedCoords = JSON.parse(storedCoords);
                        coordsPayload = {
                            userLat: parsedCoords.lat?.toString(),
                            userLng: parsedCoords.lng?.toString()
                        };
                    } catch (e) {
                        console.error("Error parsing userCoords from localStorage", e);
                    }
                }

                // Call APIs - Passing coords to getDoctorsList
                const [specRes, docRes] = await Promise.all([
                    UserAPI.getDoctorSpecializations(),
                    UserAPI.getDoctorsList(coordsPayload)
                ]);

                if (specRes.success) setSpecializations(specRes.data);
                if (docRes.success) setDoctors(docRes.data);
            } catch (error) {
                console.error("Initialization Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const getImageUrl = (path) => {
        if (!path) return "https://images.unsplash.com/photo-1559839734-2b71f1536783?q=80&w=2070";
        if (path.startsWith('http')) return path;
        const cleanPath = path.replace(/^public\//, '');
        return `${BASE_URL}/${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
    };

    const filteredDoctors = useMemo(() => {
        let result = doctors.map(doc => {
            let specialtyName = "Generalist";
            if (doc.speciality && typeof doc.speciality === 'object') {
                specialtyName = doc.speciality.name;
            } else if (doc.speciality) {
                const found = specializations.find(s => s._id === doc.speciality);
                specialtyName = found ? found.name : doc.speciality; 
            }
            const feeValue = doc.fees?.clinic || doc.fees?.home || doc.fees?.online || 0;
            return {
                ...doc,
                id: doc._id,
                ui_image: getImageUrl(doc.profileImage),
                ui_specialty: specialtyName,
                ui_price: feeValue,
                ui_rating: doc.averageRating || 0,
                ui_location: doc.city && doc.state ? `${doc.city}, ${doc.state}` : (doc.city || doc.state || "India")
            };
        });

        result = result.filter((doc) => {
            const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.ui_specialty.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = activeCategory === "All" || doc.ui_specialty === activeCategory;
            return matchesSearch && matchesCategory;
        });

        if (sortBy === "online-low") result.sort((a, b) => a.ui_price - b.ui_price);
        else if (sortBy === "rating-high") result.sort((a, b) => b.ui_rating - a.ui_rating);
        return result;
    }, [searchTerm, sortBy, activeCategory, doctors, specializations]);

    // HANDLER FOR NAVIGATION
    const handleDoctorClick = (id) => {
        router.push(`/drappointment/doctordetail/${id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFEFF]">
                <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Curating Specialists</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFEFF] selection:bg-emerald-500/10">
            {/* PRE-HEADER NAV */}
            <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
                    <button onClick={() => router.back()} className="group flex items-center gap-2 text-slate-900 font-black text-[10px] uppercase tracking-widest">
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Availability</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* HERO SECTION */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-4">
                            Premium <span className="text-emerald-500">Care.</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-sm md:text-base max-w-md">
                            Connect with board-certified specialists using our advanced matching system.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <div className="relative group">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full lg:w-80 pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-inner"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none bg-slate-900 text-white border-none rounded-2xl pl-6 pr-12 py-4 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer w-full"
                            >
                                <option value="rating-high">Top Rated</option>
                                <option value="online-low">Lowest Fee</option>
                            </select>
                            <FaChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-white/50 text-[10px] pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* FILTERS */}
                <div className="flex items-center gap-3 overflow-x-auto pb-8 no-scrollbar">
                    <button
                        onClick={() => setActiveCategory("All")}
                        className={`whitespace-nowrap px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                            activeCategory === "All" ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20" : "bg-white text-slate-400 border border-slate-100 hover:border-emerald-200"
                        }`}
                    >
                        All Experts
                    </button>
                    {specializations.map((spec) => (
                        <button
                            key={spec._id}
                            onClick={() => setActiveCategory(spec.name)}
                            className={`whitespace-nowrap px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                                activeCategory === spec.name ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20" : "bg-white text-slate-400 border border-slate-100 hover:border-emerald-200"
                            }`}
                        >
                            {spec.name}
                        </button>
                    ))}
                </div>

                {/* PREMIUM DOCTOR GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredDoctors.map((doc) => (
                        <div
                            key={doc.id}
                            onClick={() => handleDoctorClick(doc.id)}
                            className="group relative bg-white rounded-[3rem] p-5 shadow-2xl shadow-slate-200/50 border border-slate-50 transition-all duration-500 hover:shadow-emerald-500/10 hover:-translate-y-3 cursor-pointer"
                        >
                            {/* Image Wrapper */}
                            <div className="relative h-72 w-full rounded-[2.5rem] overflow-hidden mb-6">
                                <img
                                    src={doc.ui_image}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    alt={doc.name}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                
                                <div className="absolute top-4 left-4">
                                    <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                                        <FaCheckCircle className="text-blue-500" size={10} />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">Verified</span>
                                    </div>
                                </div>

                                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                    <div className="bg-emerald-500 text-white h-8 w-8 rounded-xl flex items-center justify-center shadow-lg">
                                        <FaStar size={10} />
                                    </div>
                                    <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm">
                                        <span className="text-[11px] font-black text-slate-900">{doc.ui_rating} <span className="text-slate-400 font-bold ml-1">Rating</span></span>
                                    </div>
                                </div>
                            </div>

                            {/* Info Container */}
                            <div className="px-3 pb-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <FaStethoscope className="text-emerald-500 text-xs" />
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">{doc.ui_specialty}</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-4 group-hover:text-emerald-600 transition-colors">
                                    {doc.name}
                                </h3>

                                <div className="bg-slate-50 rounded-[2rem] p-5 flex flex-col gap-4 border border-slate-100 group-hover:bg-emerald-50/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FaMapMarkerAlt className="text-slate-400" size={12} />
                                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight truncate max-w-[120px]">{doc.ui_location}</span>
                                        </div>
                                        <span className="text-[9px] font-black bg-white px-2 py-1 rounded-lg border border-slate-100 text-slate-400 uppercase tracking-widest">
                                            {doc.experienceYears || '0'} YRS EXP
                                        </span>
                                    </div>

                                    <div className="h-px bg-slate-200/50 w-full"></div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Consultation</p>
                                            <p className="text-2xl font-black text-slate-900">₹{doc.ui_price}</p>
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevents card click from firing
                                                handleDoctorClick(doc.id);
                                            }}
                                            className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all active:scale-95 shadow-lg"
                                        >
                                            Book Appt
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* EMPTY STATE */}
                {filteredDoctors.length === 0 && (
                    <div className="text-center py-32">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaSearch className="text-slate-200 text-2xl" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">No Specialists Found</h2>
                        <button onClick={() => { setSearchTerm(""); setActiveCategory("All"); }} className="mt-4 text-emerald-500 font-black text-[10px] uppercase tracking-widest hover:underline">Clear Search Filter</button>
                    </div>
                )}
            </div>
        </div>
    );
}