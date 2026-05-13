"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation"; // Correct hook for App Router
import {
    FaArrowLeft, FaSearch, FaHospital, FaStar,
    FaChevronDown, FaFilter, FaMapMarkerAlt, FaLocationArrow,
    FaBed, FaUserMd, FaClock, FaRegHeart
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

const CATEGORIES = ["All", "Private", "Govt", "Cardiology", "Emergency"];
// const BASE_URL = "http://192.168.1.26:5002";
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function AllHospitalsPage() {
    const router = useRouter();
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("distance");
    const [activeCategory, setActiveCategory] = useState("All");

    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                setLoading(true);
                const storedCoords = localStorage.getItem("userCoords");
                let payload = { lat: 0, lng: 0 };

                if (storedCoords) {
                    try { payload = JSON.parse(storedCoords); } catch (e) {}
                }

                const response = await UserAPI.getHospitalsList(payload);
                if (response.success) {
                    setHospitals(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch hospitals:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHospitals();
    }, []);

    // NAVIGATION HANDLER
    const handleHospitalClick = (id) => {
        // Navigates to /hospital/hospitaldetail/[id]
        router.push(`/hospital/hospitaldetail/${id}`);
    };

    const filteredHospitals = useMemo(() => {
        return hospitals
            .map((hosp) => ({
                ...hosp,
                id: hosp._id,
                image: hosp.hospitalImage && hosp.hospitalImage.length > 0 
                    ? `${BASE_URL}${hosp.hospitalImage[0]}` 
                    : `${BASE_URL}/uploads/hospitals/hospital-1778483195575.png`,
                fullAddress: hosp.address || `${hosp.city || ''}, ${hosp.state || ''}`,
                rating: hosp.rating || 4.8,
                doctors: hosp.doctors || 24,
                beds: hosp.beds || 120,
                timing: "Open 24/7"
            }))
            .filter((hosp) => {
                const matchesSearch = hosp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    hosp.fullAddress.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesCategory = activeCategory === "All" || hosp.type === activeCategory;
                return matchesSearch && matchesCategory;
            })
            .sort((a, b) => {
                if (sortBy === "distance") return a.distance - b.distance;
                if (sortBy === "rating") return b.rating - a.rating;
                return 0;
            });
    }, [hospitals, searchTerm, sortBy, activeCategory]);

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-[#08B36A]/20 pb-20">
            
            {/* NAV BAR */}
            <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100 px-6 py-5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <button 
                        onClick={() => router.back()} 
                        className="group flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-widest transition-all hover:text-[#08B36A]"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back
                    </button>
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                        <FaHospital className="text-[#08B36A] text-sm" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Verified Healthcare</span>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-8 px-4 md:px-8">
                
                {/* HEADER */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                    <div className="space-y-2">
                        <div className="inline-block px-3 py-1 bg-emerald-50 text-[#08B36A] rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                            Medical Directory
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                            Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#08B36A] to-emerald-400">Hospitals</span>
                        </h1>
                    </div>

                    {/* SEARCH & SORT */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative group flex-1 md:w-80">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-[#08B36A]" />
                            <input
                                type="text"
                                placeholder="Search hospital..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-[#08B36A] outline-none text-sm shadow-sm"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none bg-white border border-slate-200 rounded-2xl px-6 py-3.5 pr-12 text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer hover:border-[#08B36A] shadow-sm"
                            >
                                <option value="distance">Nearest First</option>
                                <option value="rating">Top Rated</option>
                            </select>
                            <FaChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none text-slate-400" />
                        </div>
                    </div>
                </div>

                {/* FILTERS */}
                <div className="flex items-center gap-3 overflow-x-auto pb-8 no-scrollbar">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`whitespace-nowrap px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                activeCategory === cat
                                ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                                : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* LISTING */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="h-80 bg-slate-100 animate-pulse rounded-[2rem]"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredHospitals.map((hosp) => (
                            <div
                                key={hosp.id}
                                onClick={() => handleHospitalClick(hosp.id)}
                                className="group bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 flex flex-col hover:shadow-2xl hover:shadow-emerald-100/50 hover:-translate-y-2 transition-all duration-500 cursor-pointer"
                            >
                                {/* Image */}
                                <div className="h-52 w-full relative overflow-hidden rounded-[1.5rem] bg-slate-100 mb-5">
                                    <img
                                        src={hosp.image}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        alt={hosp.name}
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className={`backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest ${hosp.type === 'Govt' ? 'bg-blue-600/80' : 'bg-emerald-600/80'}`}>
                                            {hosp.type}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                        <div className="bg-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
                                            <FaStar className="text-yellow-400 text-[10px]" />
                                            <span className="text-[11px] font-black text-slate-900">{hosp.rating}</span>
                                        </div>
                                        <div className="bg-[#08B36A] text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
                                            <FaLocationArrow className="text-[9px]" />
                                            <span className="text-[10px] font-bold">{hosp.distance.toFixed(1)} km</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="px-1 flex-1 flex flex-col">
                                    <h3 className="text-xl font-black text-slate-800 line-clamp-1 mb-1 group-hover:text-[#08B36A] transition-colors uppercase">
                                        {hosp.name}
                                    </h3>
                                    <div className="flex items-start gap-1.5 text-slate-400 mb-4">
                                        <FaMapMarkerAlt className="text-xs mt-0.5 shrink-0" />
                                        <span className="text-xs font-semibold line-clamp-1">{hosp.fullAddress}</span>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-slate-50 rounded-2xl p-3 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#08B36A] shadow-sm"><FaUserMd /></div>
                                            <div>
                                                <div className="text-xs font-black text-slate-800">{hosp.doctors}+</div>
                                                <div className="text-[8px] font-bold uppercase text-slate-400">Doctors</div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 rounded-2xl p-3 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm"><FaBed /></div>
                                            <div>
                                                <div className="text-xs font-black text-slate-800">{hosp.beds}</div>
                                                <div className="text-[8px] font-bold uppercase text-slate-400">Beds</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{hosp.timing}</span>
                                        </div>
                                        <button className="bg-slate-900 group-hover:bg-[#08B36A] text-white font-black px-8 py-3 rounded-2xl text-[10px] uppercase tracking-widest transition-all">
                                            View
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}