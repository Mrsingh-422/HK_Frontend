"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FaStar, FaMapMarkerAlt, FaBed, FaUserMd, FaHospital, FaArrowRight } from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function OurHospitalPartners() {
    const router = useRouter();
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPaused, setIsPaused] = useState(false);

    // --- FETCH DATA FROM API ---
    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                setLoading(true);
                const storedCoords = localStorage.getItem("userCoords");
                let payload = { lat: 0, lng: 0 };

                if (storedCoords) {
                    try {
                        const parsed = JSON.parse(storedCoords);
                        payload = { lat: parsed.lat, lng: parsed.lng };
                    } catch (e) {
                        console.error("Coordinate parse error", e);
                    }
                }

                const response = await UserAPI.getHospitalsList(payload);
                if (response.success) {
                    // Limiting to top 6 as requested
                    setHospitals(response.data.slice(0, 6));
                }
            } catch (error) {
                console.error("Failed to fetch hospitals:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHospitals();
    }, []);

    // --- SEAMLESS MARQUEE DATA ---
    const displayHospitals = useMemo(() => [...hospitals, ...hospitals], [hospitals]);

    const goToDetail = (id) => {
        router.push(`/hospital/hospitaldetail/${id}`);
    };

    if (loading) return (
        <div className="h-96 flex flex-col items-center justify-center space-y-4 bg-white">
            <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Medical Network</span>
        </div>
    );

    return (
        <div className="py-16 md:py-28 bg-[#FDFDFD] overflow-hidden font-sans relative">
            
            {/* --- Section Header --- */}
            <div className="max-w-7xl mx-auto px-6 mb-16 md:mb-24">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="space-y-4 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Premium Healthcare Network</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
                            Our Strategic <br className="hidden md:block" />
                            <span className="text-emerald-500">Global Partners.</span>
                        </h2>
                    </div>
                    <p className="text-slate-400 max-w-sm text-sm font-medium leading-relaxed text-center lg:text-left">
                        We collaborate with the world's most advanced hospitals to ensure your care is in expert hands.
                    </p>
                </div>
            </div>

            {/* --- Seamless Marquee --- */}
            {hospitals.length > 0 && (
                <div
                    className="relative w-full cursor-pointer marquee-container"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <div
                        className="flex gap-8 md:gap-12 animate-hospital-flow"
                        style={{
                            animationPlayState: isPaused ? 'paused' : 'running',
                            width: 'max-content'
                        }}
                    >
                        {displayHospitals.map((hospital, index) => (
                            <div
                                key={`${hospital._id}-${index}`}
                                onClick={() => goToDetail(hospital._id)}
                                className="w-[300px] md:w-[420px] flex-shrink-0 group"
                            >
                                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(8,179,106,0.15)] transition-all duration-500 flex flex-col overflow-hidden relative group">
                                    
                                    {/* Image Section */}
                                    <div className="relative w-full h-52 md:h-64 overflow-hidden bg-slate-100">
                                        <img
                                            src={hospital.hospitalImage?.[0] ? `${BASE_URL}${hospital.hospitalImage[0]}` : "https://placehold.co/600x400?text=Hospital"}
                                            alt={hospital.name}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                            onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Hospital"; }}
                                        />
                                        
                                        {/* Badges */}
                                        <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
                                            <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg border border-white/50">
                                                <FaStar className="text-yellow-400 text-xs" />
                                                <span className="text-[11px] font-black text-slate-800">{hospital.rating || "4.8"}</span>
                                            </div>
                                            <div className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                                                Partner
                                            </div>
                                        </div>

                                        <div className="absolute bottom-5 left-5 flex items-center gap-2 bg-slate-900/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                                            <FaMapMarkerAlt className="text-emerald-400 text-[10px]" />
                                            <span className="text-white text-[10px] font-black uppercase tracking-wider">
                                                {hospital.distance?.toFixed(1) || 0} KM Away
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-6 md:p-8 space-y-6">
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight group-hover:text-emerald-600 transition-colors truncate">
                                                {hospital.name}
                                            </h3>
                                            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.1em] mt-1 line-clamp-1">
                                                {hospital.address || `${hospital.city}, ${hospital.state}`}
                                            </p>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center justify-between border-y border-slate-50 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                    <FaUserMd size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-800">{hospital.doctors || '30'}+</p>
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase">Specialists</p>
                                                </div>
                                            </div>
                                            <div className="w-px h-8 bg-slate-100"></div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                                    <FaBed size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-800">{hospital.beds || '100'}</p>
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase">Bed Units</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Premium CTA Button */}
                                        <button className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 hover:bg-emerald-600 shadow-xl shadow-slate-200 active:scale-95">
                                            View Details <FaArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- Optimized Marquee CSS --- */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes hospital-flow {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-hospital-flow {
                    animation: hospital-flow 50s linear infinite;
                }
                .marquee-container {
                    mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                }
                @media (max-width: 768px) {
                    .animate-hospital-flow {
                        animation: hospital-flow 25s linear infinite;
                    }
                    .marquee-container {
                        mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
                    }
                }
            `}} />
        </div>
    );
}

export default OurHospitalPartners;