"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo } from "react";
import {
    FaFilter, FaStar, FaMapMarkerAlt,
    FaAmbulance, FaArrowRight, FaChevronDown, FaClock
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?auto=format&fit=crop&q=80&w=800"
];

function FindEmergencyAmbulance() {
    const router = useRouter();
    const [ambulances, setAmbulances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("distance");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const storedCoords = localStorage.getItem("userCoords");
                const coords = storedCoords ? JSON.parse(storedCoords) : { lat: 30.738045, lng: 76.660620 };

                const ambRes = await UserAPI.getNearestAmbulances({
                    lat: coords.lat,
                    lng: coords.lng
                });

                if (ambRes.success) {
                    const dataWithImages = ambRes.data.map((amb, index) => ({
                        ...amb,
                        displayImage: amb.image || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
                    }));
                    setAmbulances(dataWithImages);
                }
            } catch (error) {
                console.error("Error fetching ambulance data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredAmbulances = useMemo(() => {
        let result = [...ambulances];

        if (sortBy === "price-low") {
            result.sort((a, b) => a.pricing.fixedPrice - b.pricing.fixedPrice);
        } else if (sortBy === "distance") {
            result.sort((a, b) => a.rawDistance - b.rawDistance);
        }

        return result;
    }, [sortBy, ambulances]);

    const visibleAmbulances = filteredAmbulances.slice(0, 6);
    const hasMore = filteredAmbulances.length > 6;

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading units...</div>;
    }

    return (
        <div className="min-h-screen bg-[#FDFEFF] font-sans text-slate-900">
            <section className="max-w-7xl mx-auto px-6 pb-32">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-black tracking-tight">Nearby Available Units</h2>
                        <p className="text-slate-500 text-sm font-medium">Showing top verified ambulances in your area</p>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                        <div className="pl-4"><FaFilter className="text-[#08B36A] text-sm" /></div>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none bg-transparent text-[10px] font-black uppercase py-2 pl-2 pr-8 outline-none cursor-pointer"
                            >
                                <option value="distance">Nearest First</option>
                                <option value="price-low">Lowest Fare</option>
                            </select>
                            <FaChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none text-slate-400" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {visibleAmbulances.map((amb) => (
                        <div key={amb._id} className="group bg-white rounded-[2.5rem] p-4 border border-slate-100 hover:border-[#08B36A]/30 hover:shadow-xl transition-all duration-300">
                            <div className="relative mb-5 aspect-[16/10] rounded-[2rem] overflow-hidden bg-slate-100">
                                <img src={amb.displayImage} alt={amb.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-sm">
                                    <FaStar className="text-amber-400 text-xs" />
                                    <span className="font-black text-xs">4.8</span>
                                </div>
                            </div>

                            <div className="px-2 space-y-4">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-[#08B36A] transition-colors">{amb.name}</h3>
                                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">{amb.driverInfo?.fullName || "Verified Driver"}</p>
                                </div>

                                <div className="flex items-center justify-between py-3 border-y border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <FaMapMarkerAlt className="text-[#08B36A] text-xs" />
                                        <span className="text-xs font-bold text-slate-600">{amb.distance}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
                                        <FaClock /> {amb.eta || "Fast"}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Fixed Fare</p>
                                        <p className="text-2xl font-black text-slate-900">₹{amb.pricing.fixedPrice}</p>
                                    </div>
                                    <button 
                                        onClick={() => router.push(`/ambulance/medicalambuancebooking/${amb._id}`)}
                                        className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#08B36A] transition-all duration-300"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {hasMore && (
                    <div className="mt-20 text-center">
                        <button
                            onClick={() => router.push("/ambulance/seeallambulances")}
                            className="group inline-flex items-center gap-4 bg-white border-2 border-slate-900 text-slate-900 px-12 py-5 rounded-full font-black hover:bg-slate-900 hover:text-white transition-all duration-300 shadow-xl"
                        >
                            Explore All Units
                            <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}

export default FindEmergencyAmbulance;