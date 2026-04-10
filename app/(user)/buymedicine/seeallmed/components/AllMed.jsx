"use client";

import React from "react";
import { FaPlus, FaStar } from "react-icons/fa";

const AllMed = ({ items, onBuy }) => {
    return (
        /* Grid: 2 columns on mobile, 3 on desktop. Standardized gaps. */
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {items.map((med) => (
                <div 
                    key={med.id} 
                    className="bg-white border border-slate-200 rounded-xl md:rounded-2xl flex flex-col hover:border-[#08B36A] hover:shadow-md transition-all duration-300 group"
                >
                    {/* 1. IMAGE CONTAINER */}
                    <div className="relative p-2 md:p-3">
                        {/* Clean Discount Badge */}
                        {med.actualPrice > med.discountPrice && (
                            <div className="absolute top-4 left-4 z-10 bg-[#08B36A] text-white text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                {Math.round(((med.actualPrice - med.discountPrice) / med.actualPrice) * 100)}% OFF
                            </div>
                        )}
                        
                        <div className="aspect-square w-full bg-[#f8f9fa] rounded-lg overflow-hidden flex items-center justify-center p-4 md:p-8">
                            <img 
                                src={med.image} 
                                className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500" 
                                alt={med.name} 
                            />
                        </div>
                    </div>

                    {/* 2. CONTENT SECTION */}
                    <div className="px-3 md:px-5 flex-1 flex flex-col">
                        {/* Vendor Name */}
                        <p className="text-[10px] md:text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
                            {med.vendor}
                        </p>
                        
                        {/* Product Name - Line Clamped for uniformity */}
                        <h3 className="text-sm md:text-lg font-bold text-slate-800 line-clamp-2 h-10 md:h-14 mb-2 leading-tight">
                            {med.name}
                        </h3>

                        {/* Rating (Simple) */}
                        <div className="flex items-center gap-1 mb-4">
                            <div className="flex text-amber-400 text-[10px]">
                                <FaStar /><FaStar /><FaStar /><FaStar />
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold">(4.0)</span>
                        </div>
                    </div>

                    {/* 3. PRICE & CTA SECTION */}
                    <div className="px-3 md:px-5 pb-4 md:pb-6 mt-auto">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-col">
                                {med.actualPrice > med.discountPrice && (
                                    <span className="text-[10px] md:text-xs text-slate-400 line-through">
                                        ₹{med.actualPrice}
                                    </span>
                                )}
                                <span className="text-lg md:text-2xl font-extrabold text-slate-900">
                                    ₹{med.discountPrice}
                                </span>
                            </div>

                            {/* Simple Professional Add Button */}
                            <button
                                onClick={() => onBuy(med)}
                                className="flex items-center gap-2 bg-white border-2 border-[#08B36A] text-[#08B36A] hover:bg-[#08B36A] hover:text-white px-3 md:px-5 py-1.5 md:py-2 rounded-lg font-bold text-xs md:text-sm transition-all active:scale-95"
                            >
                                <FaPlus size={10} />
                                <span>ADD</span>
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AllMed;