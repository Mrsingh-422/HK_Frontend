"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaStar, FaPlus, FaCheckCircle, FaChevronRight } from 'react-icons/fa';
import UserAPI from "@/app/services/UserAPI";

const FitnessProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // High-end Medical/Fitness Studio Style Images
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
                const response = await UserAPI.getNonPrescriptionProducts("Fitness & Supplements", 1, 8);
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
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest animate-pulse">Loading Diagnostics</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#FAFBFD] py-16 px-4 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans'] overflow-hidden">
            <div className="max-w-7xl mx-auto">

                {/* Clean Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 px-1">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div className="h-[1.5px] w-6 bg-emerald-500 rounded-full"></div>
                            <span className="text-emerald-600 font-bold uppercase text-[11px] tracking-widest">Daily Wellness</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Fitness & Supplements</h2>
                    </div>
                    <button
                        onClick={() => router.push('/buymedicine/seeallmed')}
                        className="group flex items-center gap-2 text-slate-500 font-semibold text-xs uppercase tracking-wider hover:text-emerald-600 transition-colors w-fit"
                    >
                        View Full Catalog
                        <FaChevronRight className="text-[10px] transform group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                </div>

                {/* Horizontal Scroll Area */}
                <div className="relative">
                    <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:rounded-full">
                        {products.map((item, index) => (
                            <div
                                key={item._id || index}
                                onClick={() => handleProductClick(item._id)}
                                className="min-w-[260px] md:min-w-[290px] max-w-[290px] bg-white border border-slate-100 rounded-3xl overflow-hidden group hover:border-transparent hover:shadow-[0_22px_50px_rgba(148,163,184,0.12)] transition-all duration-500 snap-start cursor-pointer flex flex-col"
                            >
                                {/* Studio-Style Image Container */}
                                <div className="relative aspect-square bg-slate-50 overflow-hidden flex items-center justify-center">
                                    {/* Glassmorphism Badges */}
                                    <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-md border border-white/40 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                        <FaStar className="text-amber-400 text-[11px]" />
                                        <span className="text-[11px] font-bold text-slate-800">4.9</span>
                                    </div>

                                    {item.discont_percent && item.discont_percent !== "0%" && (
                                        <div className="absolute top-4 right-4 z-10 bg-emerald-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide shadow-sm">
                                            {item.discont_percent} OFF
                                        </div>
                                    )}

                                    <img
                                        src={dummyImages[index % dummyImages.length]}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>

                                {/* Content Details */}
                                <div className="p-5 flex flex-col flex-1 bg-white">
                                    <div className="mb-3 space-y-1">
                                        <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider truncate">
                                            {item.manufacturers || 'Precision Pharmaceutics'}
                                        </p>
                                        <h3 className="font-bold text-slate-800 text-[15px] leading-snug tracking-tight h-11 line-clamp-2 group-hover:text-emerald-700 transition-colors duration-300">
                                            {item.name}
                                        </h3>
                                        <p className="text-xs text-slate-400 font-medium truncate">
                                            {item.packaging || 'Standard Unit'}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1.5 mb-5 bg-slate-50/80 w-fit px-2.5 py-1 rounded-full border border-slate-100/50">
                                        <FaCheckCircle className="text-emerald-500 text-[11px]" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                            ISO Certified
                                        </span>
                                    </div>

                                    {/* Pricing & Interaction */}
                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Best Price</p>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-lg font-extrabold text-slate-900 tracking-tight">₹{item.best_price}</span>
                                                {item.mrp && (
                                                    <span className="text-xs text-slate-300 line-through font-medium">₹{item.mrp}</span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-all duration-300 shadow-md hover:shadow-emerald-100 active:scale-95 shrink-0"
                                        >
                                            <FaPlus size={12} />
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

export default FitnessProducts;