"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaMapMarkerAlt, FaStar, FaClock, FaArrowRight, FaHospital, FaSpinner, FaLocationArrow } from 'react-icons/fa';
import UserAPI from "@/app/services/UserAPI";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function HospitalsMainPage() {
    const router = useRouter();
    const scrollRef = useRef(null);
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);

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

    // Navigation Handlers
    const goToDetail = (id) => {
        router.push(`/hospital/hospitaldetail/${id}`);
    };

    const handleSeeAll = () => {
        router.push("/hospital/seeallhospitals");
    };

    // Show only 6 hospitals
    const displayHospitals = hospitals.slice(0, 6);

    return (
        <section className="py-12 bg-[#F8FAFC]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="h-1 w-8 bg-emerald-600 rounded-full"></span>
                            <span className="text-emerald-600 font-black tracking-[0.2em] uppercase text-xs">Top Rated Facilities</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Find Hospitals Nearby</h2>
                    </div>
                    <button
                        onClick={handleSeeAll}
                        className="flex items-center gap-2 text-emerald-600 font-black uppercase text-xs tracking-widest hover:gap-4 transition-all group cursor-pointer"
                    >
                        View All Hospitals <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Single Row Horizontal Scroll Container */}
                <div className="flex overflow-x-auto gap-6 pb-10 snap-x snap-mandatory no-scrollbar scroll-smooth">
                    {loading ? (
                        // Loading State
                        [1, 2, 3].map((n) => (
                            <div key={n} className="min-w-[320px] md:min-w-[380px] h-[400px] bg-white rounded-[2.5rem] animate-pulse border border-slate-100" />
                        ))
                    ) : displayHospitals.length > 0 ? (
                        displayHospitals.map((hospital) => (
                            <div
                                key={hospital._id}
                                onClick={() => goToDetail(hospital._id)}
                                className="min-w-[310px] md:min-w-[380px] snap-start bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 border border-slate-100 group cursor-pointer hover:-translate-y-2"
                            >
                                {/* Image Wrapper */}
                                <div className="relative h-56 overflow-hidden bg-slate-100">
                                    <img
                                        src={hospital.hospitalImage && hospital.hospitalImage[0]
                                            ? `${BASE_URL}${hospital.hospitalImage[0]}`
                                            : "https://placehold.co/600x400?text=Hospital"}
                                        alt={hospital.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Hospital"; }}
                                    />
                                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm border border-white/50">
                                        <FaStar className="text-yellow-400 text-xs" />
                                        <span className="text-[11px] font-black text-slate-800">{hospital.rating || "4.8"}</span>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-emerald-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-lg flex items-center gap-2">
                                        <FaLocationArrow size={10} />
                                        {hospital.distance?.toFixed(1) || 0} KM
                                    </div>
                                    <div className="absolute bottom-4 left-4">
                                        <span className="bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border border-white/10">
                                            {hospital.type || "Multi-Specialty"}
                                        </span>
                                    </div>
                                </div>

                                {/* Details Wrapper */}
                                <div className="p-7">
                                    <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors truncate uppercase tracking-tight">
                                        {hospital.name}
                                    </h3>

                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-start gap-3 text-slate-500 text-[13px] font-bold">
                                            <FaMapMarkerAlt className="text-emerald-500 mt-1 shrink-0" />
                                            <span className="line-clamp-1">{hospital.address || `${hospital.city}, ${hospital.state}`}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-500 text-[13px] font-bold uppercase tracking-widest">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span>Open 24/7</span>
                                        </div>
                                    </div>

                                    <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 active:scale-95">
                                        Book Appointment
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="w-full py-20 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                            <FaHospital size={40} className="text-slate-200 mb-4" />
                            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No Hospitals Found Nearby</p>
                        </div>
                    )}
                </div>

                {/* Promotional Banner */}
                <div className="mt-8 bg-emerald-600 rounded-[2.5rem] p-8 md:p-14 flex flex-col lg:flex-row items-center justify-between gap-10 text-white relative overflow-hidden group shadow-2xl shadow-emerald-500/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="max-w-xl text-center lg:text-left relative z-10">
                        <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight leading-none">Are you a Hospital Owner?</h2>
                        <p className="text-emerald-50 opacity-90 font-bold text-sm md:text-base leading-relaxed">
                            Join India's fastest growing healthcare network. Register your facility with Health Kangaroo to manage appointments, digitize records, and reach patients efficiently.
                        </p>
                    </div>
                    <button className="relative z-10 bg-white text-emerald-600 px-10 py-5 rounded-2xl font-black text-sm md:text-base uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-2xl whitespace-nowrap active:scale-95">
                        Partner With Us
                    </button>
                </div>
            </div>

            {/* Custom CSS to hide scrollbar */}
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
}

export default HospitalsMainPage;