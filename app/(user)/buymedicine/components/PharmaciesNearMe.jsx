"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    FaMapMarkerAlt,
    FaTruck,
    FaClock,
    FaChevronRight,
    FaStar,
    FaCheckCircle,
    FaStore
} from 'react-icons/fa';
import UserAPI from '@/app/services/UserAPI';

// 3 Static High-Quality Pharmacy Images
const STATIC_PHARMA_IMAGES = [
    "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1631549916768-4119b295f926?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=800&q=80"
];

const PharmaciesNearMe = () => {
    const [pharmacies, setPharmacies] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchPharmacies = async () => {
            try {
                setLoading(true);
                // Get coordinates from local storage
                const userCoordsRaw = localStorage.getItem("userCoords");
                let payload = { lat: 30.7380, lng: 76.6604 }; // Fallback coords

                if (userCoordsRaw) {
                    const parsed = JSON.parse(userCoordsRaw);
                    payload = {
                        lat: parsed.lat,
                        lng: parsed.lng
                    };
                }

                const res = await UserAPI.getAllPharmacies(payload);
                if (res?.success) {
                    // Show only top 3 pharmacies as requested
                    setPharmacies(res.data.slice(0, 3));
                }
            } catch (error) {
                console.error("Error fetching pharmacies:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPharmacies();
    }, []);

    const handlePharmacyClick = (id) => {
        // Navigate to the specific detail page path
        router.push(`/buymedicine/singlepharmacydetail/${id}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20 bg-[#FDFEFF]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="py-12 md:py-24 bg-[#f8fafc]">
            <div className="max-w-7xl mx-auto px-4 md:px-6">

                {/* --- Header Section --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-16">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-3 md:mb-4">
                            <div className="h-1.5 w-8 md:w-12 bg-emerald-500 rounded-full"></div>
                            <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] text-emerald-600">Local Partners</span>
                        </div>
                        <h2 className="text-3xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight md:leading-none mb-4 md:mb-6">
                            Pharmacies <span className="text-emerald-500">Near You.</span>
                        </h2>
                        <p className="text-slate-500 text-xs md:text-base font-medium leading-relaxed">
                            Find licensed pharmacies in your vicinity for rapid medicine delivery
                            and authentic healthcare products.
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/buymedicine/seeallmed')}
                        className="group cursor-pointer flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-900 hover:text-emerald-600 transition-all"
                    >
                        View All <FaChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* --- Pharmacy Grid (2 columns on mobile, 3 on large screens) --- */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-10">
                    {pharmacies.map((pharma, index) => (
                        <div
                            key={pharma._id}
                            onClick={() => handlePharmacyClick(pharma._id)}
                            className="group cursor-pointer bg-white rounded-3xl md:rounded-[3.5rem] p-2 md:p-5 shadow-lg shadow-slate-200/40 border border-slate-50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                        >
                            {/* Image Container */}
                            <div className="relative h-32 sm:h-44 md:h-60 w-full rounded-2xl md:rounded-[2.8rem] overflow-hidden mb-3 md:mb-6">
                                <img
                                    src={STATIC_PHARMA_IMAGES[index % 3]}
                                    alt={pharma.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                                {/* Status Badges - Hidden or resized on small mobile */}
                                <div className="absolute top-2 left-2 md:top-5 md:left-5 flex flex-col gap-1 md:gap-2">
                                    {pharma.is24x7 && (
                                        <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[7px] md:text-[9px] font-black px-2 py-1 md:px-3 md:py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                                            24/7
                                        </span>
                                    )}
                                    {pharma.isHomeDeliveryAvailable && (
                                        <span className="bg-emerald-500 text-white text-[7px] md:text-[9px] font-black px-2 py-1 md:px-3 md:py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-200">
                                            Delivery
                                        </span>
                                    )}
                                </div>

                                <div className="absolute bottom-2 left-2 md:bottom-5 md:left-5 flex items-center gap-1 md:gap-2 text-white">
                                    <div className="h-5 w-5 md:h-8 md:w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                        <FaMapMarkerAlt size={8} className="md:text-[12px] text-white" />
                                    </div>
                                    <span className="text-[7px] md:text-[10px] font-black uppercase tracking-widest">{pharma.distance} km</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-1 md:px-4 pb-2">
                                <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                                    <FaCheckCircle className="text-emerald-500" size={10} />
                                    <span className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified</span>
                                </div>
                                <h3 className="text-sm md:text-2xl font-black text-slate-900 truncate mb-1 group-hover:text-emerald-600 transition-colors">
                                    {pharma.name}
                                </h3>
                                <p className="text-slate-400 text-[8px] md:text-xs font-bold uppercase mb-3 md:mb-6 flex items-center gap-1">
                                    <FaStore className="text-slate-300" size={10} /> {pharma.city}
                                </p>

                                {/* Inner Info Card - Stacked on small mobile */}
                                <div className="bg-slate-50 rounded-2xl md:rounded-[2rem] p-2 md:p-5 border border-slate-100 flex items-center justify-between">
                                    <div className="flex flex-col gap-0.5 md:gap-1">
                                        <span className="text-[6px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                                        <div className="flex items-center gap-1 md:gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="text-[8px] md:text-xs font-black text-slate-800 uppercase">{pharma.openStatus || "Open"}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="h-6 w-6 md:h-8 md:w-8 bg-slate-900 text-white rounded-full flex items-center justify-center transition-all group-hover:bg-emerald-500 group-hover:scale-110">
                                            <FaChevronRight size={8} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- Empty State --- */}
                {pharmacies.length === 0 && !loading && (
                    <div className="text-center py-16 md:py-20 bg-white rounded-[2rem] md:rounded-[3rem] border border-dashed border-slate-200">
                        <FaStore className="mx-auto text-slate-200 text-4xl md:text-5xl mb-4" />
                        <p className="text-slate-500 text-sm md:text-base font-bold">No pharmacies found near your current location.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PharmaciesNearMe;