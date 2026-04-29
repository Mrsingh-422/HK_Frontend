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
        <div className="py-24 bg-[#f8fafc]">
            <div className="max-w-7xl mx-auto px-6">

                {/* --- Header Section --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-1.5 w-12 bg-emerald-500 rounded-full"></div>
                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-600">Local Partners</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-6">
                            Pharmacies <span className="text-emerald-500">Near You.</span>
                        </h2>
                        <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed">
                            Find licensed pharmacies in your vicinity for rapid medicine delivery
                            and authentic healthcare products.
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/buymedicine/seeallmed')}
                        className="group cursor-pointer flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-900 hover:text-emerald-600 transition-all"
                    >
                        View All Pharmacies <FaChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* --- Pharmacy Grid (Max 3) --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {pharmacies.map((pharma, index) => (
                        <div
                            key={pharma._id}
                            onClick={() => handlePharmacyClick(pharma._id)}
                            className="group cursor-pointer bg-white rounded-[3.5rem] p-5 shadow-xl shadow-slate-200/40 border border-slate-50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                        >
                            {/* Image Container */}
                            <div className="relative h-60 w-full rounded-[2.8rem] overflow-hidden mb-6">
                                <img
                                    src={STATIC_PHARMA_IMAGES[index % 3]}
                                    alt={pharma.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

                                {/* Status Badges */}
                                <div className="absolute top-5 left-5 flex flex-col gap-2">
                                    {pharma.is24x7 && (
                                        <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                                            Open 24/7
                                        </span>
                                    )}
                                    {pharma.isHomeDeliveryAvailable && (
                                        <span className="bg-emerald-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-200">
                                            Home Delivery
                                        </span>
                                    )}
                                </div>

                                <div className="absolute bottom-5 left-5 flex items-center gap-2 text-white">
                                    <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                        <FaMapMarkerAlt size={12} className="text-white" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">{pharma.distance} km away</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-4 pb-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <FaCheckCircle className="text-emerald-500" size={12} />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Licensed Pharmacy</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 truncate mb-1 group-hover:text-emerald-600 transition-colors">
                                    {pharma.name}
                                </h3>
                                <p className="text-slate-400 text-xs font-bold uppercase mb-6 flex items-center gap-2">
                                    <FaStore className="text-slate-300" /> {pharma.city}
                                </p>

                                {/* Inner Info Card */}
                                <div className="bg-slate-50 rounded-[2rem] p-5 border border-slate-100 flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Store Status</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="text-xs font-black text-slate-800 uppercase">{pharma.openStatus || "Open Now"}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Quick View</span>
                                        <div className="h-8 w-8 bg-slate-900 text-white rounded-full flex items-center justify-center transition-all group-hover:bg-emerald-500 group-hover:scale-110">
                                            <FaChevronRight size={10} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- Empty State --- */}
                {pharmacies.length === 0 && !loading && (
                    <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                        <FaStore className="mx-auto text-slate-200 text-5xl mb-4" />
                        <p className="text-slate-500 font-bold">No pharmacies found near your current location.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PharmaciesNearMe;