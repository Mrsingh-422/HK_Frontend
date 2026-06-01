"use client";

import { useRouter } from "next/navigation";
import React, { useState, useMemo, useEffect } from "react";
import {
    FaStar, FaMapMarkerAlt, FaHospital, FaArrowRight, FaBed, FaUserMd, FaLocationArrow
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function FindHospital() {
    const router = useRouter();

    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

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

    // --- NAVIGATION HANDLERS ---
    const goToDetail = (id) => {
        router.push(`/hospital/hospitaldetail/${id}`);
    };

    const handleSeeAll = () => {
        router.push("/hospital/seeallhospitals");
    };

    // --- PROCESS & FILTER DATA ---
    const processedHospitals = useMemo(() => {
        return hospitals
            .filter((hosp) =>
                hosp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (hosp.address || "").toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((hosp) => ({
                ...hosp,
                displayImage: hosp.hospitalImage && hosp.hospitalImage.length > 0 
                    ? `${BASE_URL}${hosp.hospitalImage[0]}` 
                    : `${BASE_URL}/uploads/hospitals/default.png`,
                displayAddress: hosp.address || `${hosp.city || ''}, ${hosp.state || ''}`,
                rating: hosp.rating || 4.8,
                doctorsCount: hosp.doctors || 15,
                bedsCount: hosp.beds || 50,
                dist: hosp.distance || 0
            }));
    }, [hospitals, searchTerm]);

    // ONLY SHOW TOP 6
    const displayHospitals = processedHospitals.slice(0, 6);

    return (
        <div className="py-8 md:py-16 px-3 sm:px-6 lg:px-8 bg-[#FDFDFD] font-sans">
            <div className="max-w-7xl mx-auto">
                
                {/* --- HEADER --- */}
                <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-[#08B36A] rounded-lg text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                            <FaHospital /> Premium Healthcare
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
                            Nearby <span className="text-[#08B36A]">Hospitals</span>
                        </h2>
                    </div>
                </div>

                {/* --- HOSPITAL GRID --- */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                    {loading ? (
                        [1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="h-64 sm:h-80 bg-slate-50 animate-pulse rounded-[1.2rem] md:rounded-[2.5rem]"></div>
                        ))
                    ) : displayHospitals.length > 0 ? (
                        displayHospitals.map((hospital) => (
                            <div 
                                key={hospital._id} 
                                onClick={() => goToDetail(hospital._id)}
                                className="group bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-3 md:p-5 shadow-sm border border-slate-100 flex flex-col hover:shadow-2xl hover:shadow-emerald-100/50 hover:-translate-y-2 transition-all duration-500 cursor-pointer"
                            >
                                {/* Image Area */}
                                <div className="h-28 sm:h-48 md:h-56 w-full relative overflow-hidden rounded-[1rem] md:rounded-[2rem] bg-slate-100 mb-4 md:mb-6">
                                    <img
                                        src={hospital.displayImage}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        alt={hospital.name}
                                        onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Hospital"; }}
                                    />
                                    
                                    <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4">
                                        <div className="bg-[#08B36A] text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl flex items-center gap-1.5 shadow-lg">
                                            <FaLocationArrow className="text-[7px] sm:text-[9px]" />
                                            <span className="text-[8px] sm:text-[10px] font-black tracking-tighter">
                                                {hospital.dist.toFixed(1)} km
                                            </span>
                                        </div>
                                    </div>

                                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                        <FaStar className="text-yellow-400 text-[8px] sm:text-xs" />
                                        <span className="text-[9px] sm:text-xs font-black text-slate-900">{hospital.rating}</span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 flex flex-col min-w-0">
                                    <h3 className="text-sm sm:text-lg md:text-xl font-black text-slate-800 line-clamp-1 group-hover:text-[#08B36A] transition-colors uppercase tracking-tight">
                                        {hospital.name}
                                    </h3>
                                    <p className="text-[8px] sm:text-xs font-semibold text-slate-400 line-clamp-1 mb-4">
                                        {hospital.displayAddress}
                                    </p>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-2 md:gap-3 mb-5">
                                        <div className="bg-slate-50 rounded-xl md:rounded-2xl p-2 md:p-3 flex items-center gap-2 md:gap-3">
                                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-white flex items-center justify-center text-[#08B36A] shadow-sm">
                                                <FaUserMd className="text-[10px] md:text-sm" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] md:text-xs font-black text-slate-800">{hospital.doctorsCount}+</div>
                                                <div className="text-[7px] md:text-[8px] font-black uppercase text-slate-400">Drs</div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl md:rounded-2xl p-2 md:p-3 flex items-center gap-2 md:gap-3">
                                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-white flex items-center justify-center text-blue-500 shadow-sm">
                                                <FaBed className="text-[10px] md:text-sm" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] md:text-xs font-black text-slate-800">{hospital.bedsCount}</div>
                                                <div className="text-[7px] md:text-[8px] font-black uppercase text-slate-400">Beds</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-1.5 md:gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="text-[8px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest">Open 24/7</span>
                                        </div>
                                        <button className="bg-slate-900 group-hover:bg-[#08B36A] text-white font-black px-4 md:px-8 py-2 md:py-3 rounded-lg md:rounded-2xl text-[8px] md:text-[10px] uppercase tracking-widest transition-all shadow-sm">
                                            View
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 text-center">
                             <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">No Hospitals Found</h3>
                        </div>
                    )}
                </div>

                {/* --- SEE ALL HOSPITALS BUTTON --- */}
                <div className="mt-14 text-center">
                    <button
                        onClick={handleSeeAll}
                        className="group inline-flex items-center gap-4 bg-white text-slate-900 border-2 border-slate-900 font-black px-10 md:px-16 py-4 md:py-5 rounded-2xl md:rounded-[2.5rem] hover:bg-slate-900 hover:text-white transition-all shadow-2xl shadow-slate-200 active:scale-95 text-[10px] md:text-xs uppercase tracking-[0.3em] cursor-pointer"
                    >
                        See All Hospitals <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
                    </button>
                    <p className="mt-5 text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">
                        Verified Medical Network
                    </p>
                </div>
            </div>
        </div>
    );
}

export default FindHospital;