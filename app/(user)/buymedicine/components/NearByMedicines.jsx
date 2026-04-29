"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPills, FaStar, FaMapMarkerAlt, FaPlus, FaFilePrescription } from 'react-icons/fa';
import UserAPI from '@/app/services/UserAPI';

const NearByMedicines = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Static image as requested
    const STATIC_MEDICINE_IMAGE = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQam2-MPWslkoAp2wbGLZBigue9gbmlAab4Mw&s";

    useEffect(() => {
        const fetchNearbyMedicines = async () => {
            try {
                setLoading(true);

                // 1. Retrieve coordinates from localStorage
                const userCoordsRaw = localStorage.getItem("userCoords");

                let payload = {
                    lat: 30.6880, // Default fallback
                    lng: 76.6998
                };

                if (userCoordsRaw) {
                    const parsed = JSON.parse(userCoordsRaw);
                    payload = {
                        lat: parsed.lat,
                        lng: parsed.lng
                    };
                }

                // 2. Call API passing the data object {lat, lng}
                const res = await UserAPI.getTrendingMedicines(payload);

                if (res?.success && res.data) {
                    setMedicines(res.data);
                }
            } catch (error) {
                console.error("Error fetching trending medicines:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNearbyMedicines();
    }, []);

    const handleProductClick = (id) => {
        router.push(`/buymedicine/singleproductdetail/${id}`);
    };

    if (loading) {
        return (
            <div className="bg-[#F8FAFC] py-12 px-4 flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-[#F8FAFC] py-12 px-4 font-['Plus_Jakarta_Sans']">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <span className="text-emerald-600 font-black uppercase tracking-[2px] text-[10px]">Instant Delivery</span>
                        <h2 className="text-3xl font-black text-slate-900 mt-1">Medicines Near You</h2>
                        <p className="text-slate-500 text-sm mt-2">Get your essential medicines delivered from trusted local pharmacies.</p>
                    </div>
                    <button className="text-emerald-600 font-black text-xs uppercase tracking-wider hover:underline">
                        View All
                    </button>
                </div>

                {/* Horizontal Scroll Section */}
                <div className="relative">
                    <div className="flex overflow-x-auto gap-6 pb-8 snap-x no-scrollbar custom-scrollbar">
                        {medicines.slice(0, 10).map((med) => (
                            <div
                                key={med._id}
                                onClick={() => handleProductClick(med._id)}
                                className="min-w-[280px] md:min-w-[300px] bg-white border border-slate-100 rounded-[24px] overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 snap-start cursor-pointer"
                            >
                                {/* Image & Badges */}
                                <div className="relative aspect-square bg-slate-50 flex items-center justify-center p-0 overflow-hidden">
                                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                                        <span className="bg-white/90 backdrop-blur shadow-sm px-2 py-1 rounded-lg text-[9px] font-black text-slate-900 flex items-center gap-1">
                                            <FaStar className="text-amber-400" /> 4.8
                                        </span>
                                    </div>

                                    {med.discount > 0 && (
                                        <div className="absolute top-3 right-3 z-10">
                                            <span className="bg-emerald-500 text-white px-2 py-1 rounded-lg text-[9px] font-black">
                                                {med.discount}% OFF
                                            </span>
                                        </div>
                                    )}

                                    {/* Medicine Image */}
                                    <img
                                        src={STATIC_MEDICINE_IMAGE}
                                        alt={med.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tight mb-1">Trending</p>
                                    <h3 className="font-bold text-slate-900 text-lg leading-tight truncate">{med.name}</h3>
                                    <p className="text-[11px] text-slate-400 font-medium mb-3 truncate">{med.salt || 'N/A'}</p>

                                    <div className="flex items-center gap-2 mb-4">
                                        <FaMapMarkerAlt className="text-slate-300 text-[10px]" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nearby Pharmacy</span>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl font-black text-slate-900">₹{med.bestPrice}</span>
                                                {med.mrp > med.bestPrice && (
                                                    <span className="text-xs text-slate-400 line-through">₹{med.mrp}</span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent navigation when clicking the plus button
                                                // Add to cart logic here if needed
                                            }}
                                            className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-lg shadow-slate-200 hover:shadow-emerald-200"
                                        >
                                            <FaPlus size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {medicines.length === 0 && !loading && (
                    <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-slate-200">
                        <FaPills className="mx-auto text-slate-200 text-5xl mb-4" />
                        <p className="text-slate-500 font-bold">No medicines found in your location.</p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
}

export default NearByMedicines;