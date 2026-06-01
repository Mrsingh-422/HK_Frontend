"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaShieldAlt, FaMapMarkerAlt } from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?auto=format&fit=crop&q=80&w=800",
    "https://t3.ftcdn.net/jpg/02/88/95/14/360_F_288951431_c5ZNInuEZbN4BlYcHyZiVSuInIAy8zMa.jpg"
];

function AmbulancePartners() {
    const router = useRouter();
    const [ambulances, setAmbulances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPaused, setIsPaused] = useState(false);

    // --- FETCH DATA FROM API ---
    useEffect(() => {
        const fetchAmbulances = async () => {
            try {
                setLoading(true);
                const storedCoords = localStorage.getItem("userCoords");
                // Fallback to Chandigarh coordinates if localstorage is empty
                const coords = storedCoords ? JSON.parse(storedCoords) : { lat: 30.738045, lng: 76.660620 };

                const ambRes = await UserAPI.getNearestAmbulances({
                    lat: coords.lat,
                    lng: coords.lng
                });

                if (ambRes.success) {
                    // STRICTLY LIMIT TO 6 AMBULANCES
                    const limitedData = (ambRes.data || []).slice(0, 6);
                    setAmbulances(limitedData);
                }
            } catch (error) {
                console.error("Error fetching ambulance partners:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAmbulances();
    }, []);

    // --- PREPARE DATA FOR SEAMLESS LOOP ---
    // We double the 6 items to 12 so the animation loop is invisible to the user
    const displayPartners = useMemo(() => {
        if (ambulances.length === 0) return [];
        return [...ambulances, ...ambulances];
    }, [ambulances]);

    if (loading) {
        return (
            <div className="py-24 text-center bg-[#F8FAFC]">
                <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-[#08B36A] border-r-transparent"></div>
                <p className="mt-4 text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Locating Fleet...</p>
            </div>
        );
    }

    if (ambulances.length === 0) return null;

    return (
        <div className="py-20 md:py-32 bg-[#F8FAFC] overflow-hidden font-sans relative">
            {/* Background Texture */}
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: `radial-gradient(#08B36A 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

            <div className="max-w-7xl mx-auto px-4 text-center mb-16 relative z-10">
                {/* Header Badge */}
                <div className="flex items-center justify-center gap-6 mb-4 group">
                    <div className="w-10 h-10 rounded-full border border-[#08B36A]/20 flex items-center justify-center text-[#08B36A] cursor-pointer hover:bg-[#08B36A] hover:text-white transition-all">
                        <FaArrowLeft className="text-xs" />
                    </div>
                    <span className="text-[#08B36A] font-black text-xs md:text-sm tracking-[0.4em] uppercase">
                        Elite Network
                    </span>
                    <div className="w-10 h-10 rounded-full border border-[#08B36A]/20 flex items-center justify-center text-[#08B36A] cursor-pointer hover:bg-[#08B36A] hover:text-white transition-all">
                        <FaArrowRight className="text-xs" />
                    </div>
                </div>

                {/* Main Title */}
                <h2 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-tight">
                    Trusted Fleet <span className="text-[#08B36A]">Partners</span>
                </h2>
                <p className="text-slate-400 text-xs md:text-sm mt-4 max-w-lg mx-auto font-bold uppercase tracking-widest leading-relaxed">
                    Collaborating with {ambulances.length} top-rated rapid response units nearby.
                </p>
            </div>

            {/* Marquee Container */}
            <div
                className="relative w-full cursor-grab active:cursor-grabbing"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {/* Side Fades for Premium Look */}
                <div className="absolute inset-y-0 left-0 w-24 md:w-60 bg-gradient-to-r from-[#F8FAFC] to-transparent z-20 pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-24 md:w-60 bg-gradient-to-l from-[#F8FAFC] to-transparent z-20 pointer-events-none"></div>

                <div
                    className="flex gap-6 md:gap-10 animate-ambulance-marquee"
                    style={{
                        animationPlayState: isPaused ? 'paused' : 'running',
                        width: 'max-content'
                    }}
                >
                    {displayPartners.map((amb, index) => (
                        <div
                            key={`${amb._id}-${index}`}
                            onClick={() => router.push(`/ambulance/medicalambuancebooking/${amb._id}`)}
                            className="w-[280px] md:w-[400px] flex-shrink-0 bg-white rounded-[2.5rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-15px_rgba(8,179,106,0.15)] transition-all duration-500 overflow-hidden flex flex-col group border border-white hover:border-[#08B36A]/20 cursor-pointer"
                        >
                            {/* Image Wrapper */}
                            <div className="relative h-44 md:h-60 overflow-hidden bg-slate-50">
                                <img
                                    src={amb.image || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]}
                                    alt={amb.name}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                                    <FaCheckCircle className="text-[#08B36A] text-xs" />
                                    <span className="text-[10px] font-black uppercase text-slate-800 tracking-widest">Verified</span>
                                </div>
                                <div className="absolute bottom-5 right-5 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-lg flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-emerald-400" />
                                    {amb.distance || "Nearby"}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 md:p-10 text-center flex flex-col items-center relative">
                                {/* floating icon */}
                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 bg-[#08B36A] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#08B36A]/30 border-4 border-white group-hover:rotate-[15deg] transition-transform">
                                    <FaShieldAlt className="text-xl" />
                                </div>

                                <div className="mt-4 w-full">
                                    <h3 className="text-slate-900 font-black text-xl md:text-2xl uppercase tracking-tighter group-hover:text-[#08B36A] transition-colors truncate px-2">
                                        {amb.name}
                                    </h3>
                                    <div className="h-1 w-10 bg-[#08B36A]/10 mx-auto my-4 rounded-full group-hover:w-20 group-hover:bg-[#08B36A]/30 transition-all duration-700"></div>
                                    <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] leading-relaxed line-clamp-1">
                                        {amb.driverInfo?.fullName || amb.ambulanceType || "Emergency Response Partner"}
                                    </p>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-50 w-full flex justify-between items-center">
                                    <div className="text-left">
                                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Standard Fare</p>
                                        <p className="text-xl font-black text-slate-900 leading-none">₹{amb.pricing?.fixedPrice || "0"}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Status</p>
                                        <p className="text-sm font-black text-[#08B36A] uppercase leading-none">Available</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Animation Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes ambulance-marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-ambulance-marquee {
                    animation: ambulance-marquee 45s linear infinite;
                }
                @media (max-width: 768px) {
                    .animate-ambulance-marquee {
                        animation: ambulance-marquee 25s linear infinite;
                    }
                }
            `}} />
        </div>
    );
}

export default AmbulancePartners;