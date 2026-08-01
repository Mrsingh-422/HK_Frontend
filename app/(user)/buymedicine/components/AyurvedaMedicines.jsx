"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaStar, FaChevronRight, FaCheckCircle } from 'react-icons/fa';
import UserAPI from "@/app/services/UserAPI";

function AyurvedaMedicines() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const dummyImages = [
        "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?q=80&w=500&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1559599141-381d7c016b2e?q=80&w=500&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1471864190281-ad5f9f33d6c6?q=80&w=500&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=500&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1626225453262-216b39ee9142?q=80&w=500&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1550573105-05867a0da7bd?q=80&w=500&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1616671285410-0909062323cc?q=80&w=500&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1547489432-cf93fa6c71ee?q=80&w=500&auto=format&fit=crop"
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await UserAPI.getNonPrescriptionProducts("Ayurveda", 1, 8);
                if (response.success && response.data) {
                    const dataArray = Array.isArray(response.data) ? response.data :
                        response.data.medicineDetails ? [response.data.medicineDetails] : [];
                    setProducts(dataArray.slice(0, 8));
                }
            } catch (error) {
                console.error("Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleProductClick = (id) => {
        router.push(`/buymedicine/singleproductdetail/${id}`);
    };

    if (loading) {
        return (
            <div className="bg-[#FAFBFD] py-24 flex justify-center items-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500/20 border-t-emerald-600"></div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest animate-pulse">Loading Wellness Catalog</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#FAFBFD] py-16 px-4 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans'] overflow-hidden">
            <div className="max-w-7xl mx-auto">

                {/* Modern Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 border-b border-slate-100 pb-6 px-1">
                    <div>
                        <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest mb-1 block">Ancient Methods / Modern Standards</span>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Ayurvedic Remedies</h2>
                    </div>
                    <button
                        onClick={() => router.push('/buymedicine/seeallmed')}
                        className="group flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all shadow-sm w-fit"
                    >
                        View Full Collection
                        <FaChevronRight className="text-[9px] text-slate-400 group-hover:text-emerald-600 transform group-hover:translate-x-0.5 transition-all" />
                    </button>
                </div>

                {/* Horizontal Scroll Track */}
                <div className="relative">
                    <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:rounded-full">
                        {products.map((item, index) => (
                            <div
                                key={item._id || index}
                                onClick={() => handleProductClick(item._id)}
                                className="min-w-[260px] md:min-w-[290px] max-w-[290px] bg-white border border-slate-100 rounded-3xl p-3 hover:shadow-[0_20px_40px_rgba(15,23,42,0.06)] hover:border-slate-200/60 transition-all duration-300 snap-start cursor-pointer flex flex-col justify-between group"
                            >
                                {/* Visual Asset Container */}
                                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50/50 flex items-center justify-center">
                                    {/* Glassmorphism Rating Pin */}
                                    <div className="absolute top-2.5 left-2.5 z-10 bg-white/70 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center gap-1 border border-white/40 shadow-sm">
                                        <FaStar className="text-amber-400 text-[10px]" />
                                        <span className="text-[10px] font-bold text-slate-800">4.8</span>
                                    </div>

                                    {item.discont_percent && item.discont_percent !== "0%" && (
                                        <div className="absolute top-2.5 right-2.5 z-10 bg-rose-500 text-white px-2 py-0.5 rounded-lg text-[9px] font-extrabold tracking-wider shadow-sm">
                                            {item.discont_percent} SAVE
                                        </div>
                                    )}

                                    <img
                                        src={dummyImages[index % dummyImages.length]}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                                    />
                                </div>

                                {/* Informational Details */}
                                <div className="pt-4 px-1 flex flex-col flex-1">
                                    <div className="space-y-1 mb-4">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide truncate max-w-[110px]">
                                                {item.manufacturers || 'Organic Formulations'}
                                            </span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <span className="text-[9px] font-medium text-slate-400 uppercase truncate">
                                                {item.packaging || 'Bottled Unit'}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-[14px] leading-snug line-clamp-2 h-10 tracking-tight group-hover:text-emerald-600 transition-colors duration-200">
                                            {item.name}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 w-fit px-2 py-0.5 rounded-md mb-4 border border-emerald-100">
                                        <FaCheckCircle className="text-[9px]" />
                                        <span className="text-[9px] font-extrabold uppercase tracking-wide">100% Organic Verified</span>
                                    </div>

                                    {/* Pricing & View Details Action Area */}
                                    <div className="mt-auto pt-3 border-t border-slate-100 space-y-3">
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Best Price</span>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-base font-black text-slate-900">₹{item.best_price}</span>
                                                {item.mrp && (
                                                    <span className="text-[11px] text-slate-300 line-through font-medium">₹{item.mrp}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Full Width View Details Action Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleProductClick(item._id);
                                            }}
                                            className="w-full bg-slate-900 hover:bg-emerald-600 text-white rounded-xl py-2.5 flex items-center justify-center gap-1 transition-all duration-200 text-xs font-bold shadow-sm hover:shadow-md active:scale-[0.98]"
                                        >
                                            <span>View Details</span>
                                            <FaChevronRight size={8} className="text-slate-400 group-hover:text-white transition-colors" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default AyurvedaMedicines;