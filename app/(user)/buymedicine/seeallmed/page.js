"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { INITIAL_MEDICINES } from "../../../constants/constants";
import { FaArrowLeft, FaSearch, FaShoppingCart, FaBolt, FaCapsules, FaChevronDown, FaFilter } from "react-icons/fa";
import MedicineDetailsModal from "../components/otherComponents/MedicineDetailsModal";

export default function AllMedicinesPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("low-to-high");
    const [activeCategory, setActiveCategory] = useState("All");

    // MODAL STATES
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mock Categories - You can add these to your constants later
    const categories = ["All", "Tablets", "Syrups", "Care", "Personal", "First Aid"];

    const filteredMedicines = useMemo(() => {
        let result = INITIAL_MEDICINES.filter((med) => {
            const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                med.vendor.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = activeCategory === "All" || med.category === activeCategory;
            return matchesSearch && matchesCategory;
        });

        if (sortBy === "low-to-high") result.sort((a, b) => a.discountPrice - b.discountPrice);
        else if (sortBy === "high-to-low") result.sort((a, b) => b.discountPrice - a.discountPrice);

        return result;
    }, [searchTerm, sortBy, activeCategory]);

    const handleBuyClick = (med) => {
        setSelectedMedicine(med);
        setIsModalOpen(true);
    };

    const handleAddToCart = (med) => {
        // Here you would typically dispatch to Redux or update a Context
        alert(`${med.name} added to cart!`);
    };

    return (
        <div className="min-h-screen font-sans selection:bg-[#08B36A]/10 bg-[#f8fafc]">

            <MedicineDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                medicine={selectedMedicine}
                onAddToCart={handleAddToCart}
            />

            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-7">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-600 font-bold text-xs uppercase tracking-widest cursor-pointer">
                        <FaArrowLeft /> Back
                    </button>
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <FaCapsules className="text-[#08B36A] text-sm" />
                        <span className="text-[9px] font-black uppercase tracking-tighter">Verified Pharmacy</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto py-6 md:py-10 px-4">

                {/* HEADER & SEARCH */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                            Essential <span className="text-[#08B36A]">Medicines</span>
                        </h1>
                        <p className="text-slate-500 text-[10px] md:text-sm font-medium">Available healthcare products.</p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#08B36A] outline-none text-xs"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-[9px] font-black uppercase tracking-widest outline-none cursor-pointer"
                            >
                                <option value="low-to-high">Price: Low</option>
                                <option value="high-to-low">Price: High</option>
                            </select>
                            <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* CATEGORY FILTER BAR (New) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-6 no-scrollbar">
                    <div className="flex items-center gap-2 pr-4 border-r border-slate-100">
                        <FaFilter className="text-slate-400 text-xs" />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Filters</span>
                    </div>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`whitespace-nowrap px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat
                                ? "bg-[#08B36A] text-white shadow-lg shadow-emerald-100"
                                : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* GRID */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                    {filteredMedicines.map((med) => (
                        <div key={med.id} className="bg-white rounded-2xl p-2.5 md:p-4 shadow-sm border border-slate-100 flex flex-col group hover:shadow-md transition-all">
                            <div className="h-28 sm:h-36 md:h-48 w-full relative overflow-hidden rounded-xl bg-slate-50 mb-3 flex items-center justify-center">
                                <img src={med.image} className="h-full w-full object-center transition-transform group-hover:scale-110 duration-500" alt={med.name} />
                            </div>

                            <div className="flex-1 flex flex-col space-y-1">
                                <span className="text-[7px] md:text-[10px] font-black text-[#08B36A] uppercase tracking-widest">{med.vendor}</span>
                                <h3 className="text-[11px] md:text-base font-black text-slate-800 line-clamp-2 min-h-[30px] md:min-h-[44px]">
                                    {med.name}
                                </h3>
                            </div>

                            <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-50">
                                <p className="text-sm md:text-xl font-black text-slate-900">₹{med.discountPrice}</p>
                                <button
                                    onClick={() => handleBuyClick(med)}
                                    className="bg-[#08B36A] hover:bg-slate-900 text-white font-bold px-4 md:px-6 py-1.5 md:py-2 rounded-lg text-[9px] md:text-[11px] uppercase tracking-widest transition-all active:scale-90"
                                >
                                    Buy
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* EMPTY STATE */}
                {filteredMedicines.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl mt-10">
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No products found in this category</p>
                        <button onClick={() => { setSearchTerm(""); setActiveCategory("All"); }} className="text-[#08B36A] text-[10px] font-bold uppercase mt-2 underline">Reset Filters</button>
                    </div>
                )}
            </div>
        </div>
    );
}