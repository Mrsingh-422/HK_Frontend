"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaStar, FaChevronRight, FaPercentage, FaTag } from 'react-icons/fa';
import UserAPI from "@/app/services/UserAPI";

function SuperSaving() {
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
                // Dynamically requesting your super saving products API endpoint
                const response = await UserAPI.superSavingProducts(1, 8);
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
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-rose-500/20 border-t-rose-600"></div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest animate-pulse">Scanning Flash Discounts</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#FAFBFD] py-16 px-4 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans'] overflow-hidden">
            <div className="max-w-7xl mx-auto">
                
                {/* Section Header with High-Saving Emphasis */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 border-b border-slate-100 pb-6 px-1">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                            </span>
                            <span className="text-[10px] text-rose-600 font-extrabold uppercase tracking-widest block">Limited Time Price Drops</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Super Saving Deals</h2>
                    </div>
                    <button 
                        onClick={() => router.push('/buymedicine/offers')}
                        className="group flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all shadow-sm w-fit"
                    >
                        View All Offers 
                        <FaChevronRight className="text-[9px] text-slate-400 group-hover:text-rose-600 transform group-hover:translate-x-0.5 transition-all" />
                    </button>
                </div>

                {/* Horizontal Scroll Track */}
                <div className="relative">
                    <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-rose-200 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:rounded-full">
                        {products.map((item, index) => {
                            // Determine display percentage text dynamically if field format changes
                            const discountValue = item.discont_percent && item.discont_percent !== "0%" 
                                ? item.discountPercentage 
                                : "MAX";

                            return (
                                <div
                                    key={item._id || index}
                                    onClick={() => handleProductClick(item._id)}
                                    className="min-w-[260px] md:min-w-[290px] max-w-[290px] bg-white border border-slate-100 rounded-3xl p-3 hover:shadow-[0_20px_40px_rgba(244,63,94,0.04)] hover:border-rose-100 transition-all duration-300 snap-start cursor-pointer flex flex-col justify-between group"
                                >
                                    {/* Visual Asset Container */}
                                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50/50 flex items-center justify-center">
                                        {/* High Visibility Dynamic Super Saving Badge */}
                                        <div className="absolute top-2.5 left-2.5 mountaineer z-10 bg-rose-600 text-white px-3 py-1 rounded-xl text-[10px] font-black tracking-wider shadow-md shadow-rose-600/20 flex items-center gap-1">
                                            <FaPercentage className="text-[9px]" />
                                            <span>{discountValue} OFF</span>
                                        </div>

                                        <div className="absolute top-2.5 right-2.5 z-10 bg-white/80 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center gap-1 border border-white/40 shadow-sm">
                                            <FaStar className="text-amber-400 text-[10px]" />
                                            <span className="text-[10px] font-bold text-slate-800">4.9</span>
                                        </div>

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
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide truncate max-w-[110px]">
                                                    {item.manufacturers || 'Premium Care'}
                                                </span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                <span className="text-[9px] font-medium text-slate-400 uppercase truncate">
                                                    {item.packaging || 'Standard Unit'}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-slate-800 text-[14px] leading-snug line-clamp-2 h-10 tracking-tight group-hover:text-rose-600 transition-colors duration-200">
                                                {item.name}
                                            </h3>
                                        </div>

                                        <div className="flex items-center gap-1 bg-rose-50 text-rose-700 w-fit px-2 py-0.5 rounded-md mb-4 border border-rose-100">
                                            <FaTag className="text-[9px]" />
                                            <span className="text-[9px] font-extrabold uppercase tracking-wide">Guaranteed Lowest Price</span>
                                        </div>

                                        {/* Pricing & View Details Action Area */}
                                        <div className="mt-auto pt-3 border-t border-slate-100 space-y-3">
                                            <div className="flex items-baseline justify-between">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Flash Price</span>
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="text-base font-black text-rose-600">₹{item.minimumPrice}</span>
                                                    {item.mrp && (
                                                        <span className="text-[11px] text-slate-300 line-through font-medium">₹{item.mrp}</span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Action Trigger button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleProductClick(item._id);
                                                }}
                                                className="w-full bg-slate-900 hover:bg-rose-600 text-white rounded-xl py-2.5 flex items-center justify-center gap-1 transition-all duration-200 text-xs font-bold shadow-sm hover:shadow-lg hover:shadow-rose-600/10 active:scale-[0.98]"
                                            >
                                                <span>View Details</span>
                                                <FaChevronRight size={8} className="text-slate-400 group-hover:text-white transition-colors" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default SuperSaving;