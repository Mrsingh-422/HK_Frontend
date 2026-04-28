"use client";

import React from 'react';
import { FaShieldAlt, FaChevronRight } from 'react-icons/fa';

const BrandLogos = () => {
    // Dummy Data for Pharmaceutical Brands 
    const brands = [
        { id: 1, name: "Cipla", image: "/logos/cipla.png", color: "hover:border-blue-500" },
        { id: 2, name: "Glenmark", image: "/logos/Glenmark.png", color: "hover:border-red-500" },
        { id: 3, name: "Abbott", image: "/logos/Abbott.png", color: "hover:border-light-blue-400" },
        { id: 4, name: "Dr. Reddy's", image: "/logos/dr_reddys.png", color: "hover:border-purple-500" },
        { id: 5, name: "Sun Pharma", image: "/logos/sun_pharma.png", color: "hover:border-orange-500" },
        { id: 6, name: "Mankind", image: "/logos/mankind.png", color: "hover:border-pink-600" },
        { id: 7, name: "Alkem", image: "/logos/alkem.png", color: "hover:border-blue-900" },
        { id: 8, name: "GSK", image: "/logos/gsk.png", color: "hover:border-orange-600" },
    ];

    return (
        <div className="bg-white py-16 px-4 font-['Plus_Jakarta_Sans']">
            <div className="max-w-7xl mx-auto">

                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-[2px] bg-emerald-500"></div>
                            <span className="text-emerald-600 font-black uppercase tracking-[2px] text-[10px]">Trusted Partners</span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900">Shop by Manufacturers</h2>
                        <p className="text-slate-500 text-sm mt-2 flex items-center gap-2">
                            <FaShieldAlt className="text-emerald-500" />
                            Genuine medicines sourced directly from authorized brand distributors.
                        </p>
                    </div>

                    <button className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-900 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                        All Brands <FaChevronRight size={10} />
                    </button>
                </div>

                {/* Logos Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {brands.map((brand) => (
                        <div
                            key={brand.id}
                            className={`group relative bg-white border border-slate-100 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[120px] transition-all duration-300 hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1 cursor-pointer ${brand.color}`}
                        >
                            {/* Brand Image with Grayscale Filter */}
                            <div className="w-full h-12 flex items-center justify-center filter grayscale group-hover:grayscale-0 transition-all duration-500">
                                <img
                                    src={brand.image}
                                    alt={brand.name}
                                    className="max-w-full max-h-full object-contain opacity-60 group-hover:opacity-100 transition-opacity"
                                />
                            </div>

                            {/* Hover Name Badge */}
                            <span className="absolute bottom-2 opacity-0 group-hover:opacity-100 transition-all duration-300 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                {brand.name}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Bottom Trust Note */}
                <div className="mt-12 bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col md:flex-row items-center justify-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-emerald-500 font-black text-xs">100%</span>
                        </div>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-tight">Authentic Products</p>
                    </div>
                    <div className="w-px h-4 bg-slate-200 hidden md:block"></div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-emerald-500 font-black text-xs">FREE</span>
                        </div>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-tight">Quality Checks</p>
                    </div>
                    <div className="w-px h-4 bg-slate-200 hidden md:block"></div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-emerald-500 font-black text-xs">FAST</span>
                        </div>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-tight">Brand Direct Delivery</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BrandLogos;