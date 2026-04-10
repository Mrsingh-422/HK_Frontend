"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
    FaArrowLeft, FaSearch, FaCapsules, FaChevronDown, 
    FaFilter, FaShoppingBasket, FaMedkit, FaMapMarkerAlt, 
    FaStar, FaClock, FaChevronRight, FaStore, FaHistory, 
    FaTruck, FaShieldAlt, FaCheckCircle 
} from "react-icons/fa";

// Constants & Components
import { INITIAL_MEDICINES } from "../../../constants/constants";
import MedicineDetailsModal from "../components/otherComponents/MedicineDetailsModal";
import AllMed from "./components/AllMed";
import AllProducts from "./components/AllProducts";
import UserAPI from "@/app/services/UserAPI"; // Assuming path based on your snippet

// --- SKELETON COMPONENT ---
const PharmacyCardSkeleton = () => (
    <div className="flex-shrink-0 w-[300px] h-[180px] bg-white rounded-3xl border border-slate-100 p-5 flex flex-col justify-between animate-pulse">
        <div>
            <div className="flex justify-between items-start">
                <div className="w-2/3">
                    <div className="h-4 bg-slate-200 rounded-md w-full mb-2"></div>
                    <div className="h-3 bg-slate-100 rounded-md w-1/2"></div>
                </div>
                <div className="w-12 h-6 bg-slate-100 rounded-lg"></div>
            </div>
            <div className="flex gap-2 mt-4">
                <div className="h-5 w-16 bg-slate-100 rounded-md"></div>
                <div className="h-5 w-16 bg-slate-100 rounded-md"></div>
            </div>
        </div>
        <div className="h-8 bg-slate-50 rounded-xl w-full"></div>
    </div>
);

// --- REUSABLE BADGE ---
const Badge = ({ icon, text, color }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        emerald: "bg-emerald-50 text-[#08B36A] border-emerald-100",
        slate: "bg-slate-50 text-slate-600 border-slate-100",
    };
    return (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-md border ${colors[color] || colors.slate}`}>
            {icon}
            <span className="text-[9px] font-black uppercase tracking-tighter">{text}</span>
        </div>
    );
};

export default function AllMedicinesPage() {
    const router = useRouter();

    // Pharmacy States
    const [pharmacies, setPharmacies] = useState([]);
    const [loadingPharmacies, setLoadingPharmacies] = useState(true);
    const [pharmacySearchTerm, setPharmacySearchTerm] = useState("");
    
    // Catalog States
    const [activeTab, setActiveTab] = useState("medicines"); // "medicines" or "products"
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("low-to-high");
    const [activeCategory, setActiveCategory] = useState("All");

    // Modal States
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch Pharmacies Logic
    const fetchPharmacies = useCallback(async (search = "") => {
        setLoadingPharmacies(true);
        const storedCoords = localStorage.getItem("userCoords");

        try {
            let payload = { search };
            if (storedCoords) {
                const { lat, lng } = JSON.parse(storedCoords);
                payload = { ...payload, lat, lng };
            }

            // Adjust this call to your actual API method (e.g., getPharmaciesList)
            const response = await UserAPI.getPharmaciesList?.(payload) || { success: false };
            if (response.success) {
                setPharmacies(response.data || []);
            }
        } catch (error) {
            console.error("Error fetching pharmacies:", error);
        } finally {
            setLoadingPharmacies(false);
        }
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => fetchPharmacies(pharmacySearchTerm), 400);
        return () => clearTimeout(delayDebounce);
    }, [pharmacySearchTerm, fetchPharmacies]);

    // Categories Logic
    const categories = activeTab === "medicines" 
        ? ["All", "Tablets", "Syrups", "Injections"] 
        : ["All", "Wellness", "Personal Care", "Baby Care", "First Aid"];

    // Filtering logic for the items below
    const filteredItems = useMemo(() => {
        let source = INITIAL_MEDICINES; 
        let result = source.filter((item) => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                item.vendor.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = activeCategory === "All" || item.category === activeCategory;
            return matchesSearch && matchesCategory;
        });

        if (sortBy === "low-to-high") result.sort((a, b) => a.discountPrice - b.discountPrice);
        else if (sortBy === "high-to-low") result.sort((a, b) => b.discountPrice - a.discountPrice);

        return result;
    }, [searchTerm, sortBy, activeCategory]);

    const handleOpenModal = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen font-sans bg-[#f8fafc] pb-20">
            <MedicineDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                medicine={selectedItem}
                onAddToCart={(item) => alert(`${item.name} added to cart!`)}
            />

            {/* STICKY NAV */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-[#08B36A] transition-colors">
                        <FaArrowLeft /> Back
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#08B36A] rounded-lg text-white"><FaStore size={14} /></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Pharmacy Hub</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto pt-8 px-4">
                
                {/* 1. PHARMACIES SECTION */}
                <section className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-[#08B36A]" />
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Stores Near You</h2>
                        </div>
                        <div className="relative w-full md:w-72">
                            <input
                                type="text"
                                placeholder="Search pharmacy name..."
                                value={pharmacySearchTerm}
                                onChange={(e) => setPharmacySearchTerm(e.target.value)}
                                className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#08B36A] outline-none text-xs font-bold transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar">
                        {loadingPharmacies ? (
                            <>
                                <PharmacyCardSkeleton />
                                <PharmacyCardSkeleton />
                                <PharmacyCardSkeleton />
                            </>
                        ) : (
                            pharmacies.map((pharmacy) => (
                                <div
                                    key={pharmacy._id}
                                    onClick={() => router.push(`/pharmacy/${pharmacy._id}`)}
                                    className="group flex-shrink-0 cursor-pointer w-[320px] bg-white rounded-3xl border-2 border-transparent shadow-sm hover:border-[#08B36A] hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between h-[190px]"
                                >
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <div className="max-w-[70%]">
                                                <h3 className="font-black text-sm text-slate-800 group-hover:text-[#08B36A] transition-colors truncate">
                                                    {pharmacy.name}
                                                </h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                                                    {pharmacy.area || pharmacy.city} {pharmacy.distance ? `• ${pharmacy.distance.toFixed(1)} KM` : ""}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg text-amber-600 border border-amber-100">
                                                <FaStar size={10} />
                                                <span className="text-[10px] font-black">{pharmacy.rating || "4.5"}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            <Badge icon={<FaTruck size={8} />} text="Home Delivery" color="emerald" />
                                            {pharmacy.is24x7 && <Badge icon={<FaHistory size={8} />} text="24/7" color="blue" />}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <FaClock size={10} className="text-[#08B36A]" />
                                            <span className="text-[10px] font-black uppercase">Open Now</span>
                                        </div>
                                        <FaChevronRight size={12} className="text-slate-300 group-hover:text-[#08B36A] transform group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            ))
                        )}
                        {!loadingPharmacies && pharmacies.length === 0 && (
                            <div className="w-full py-10 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No pharmacies found in your area</p>
                            </div>
                        )}
                    </div>
                </section>

                <hr className="border-slate-200 mb-12" />

                {/* 2. CATALOG HEADER (Search & Tabs) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                            Browse <span className="text-[#08B36A] capitalize">{activeTab}</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">Authentic & Licensed Healthcare solutions.</p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#08B36A] outline-none text-sm transition-all shadow-sm"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none bg-white border border-slate-200 rounded-2xl px-5 py-3.5 pr-10 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer shadow-sm"
                            >
                                <option value="low-to-high">Price: Low</option>
                                <option value="high-to-low">Price: High</option>
                            </select>
                            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none text-slate-400" />
                        </div>
                    </div>
                </div>

                {/* TABS SWITCHER */}
                <div className="flex p-1.5 bg-slate-200/50 rounded-2xl mb-8 w-fit">
                    <button
                        onClick={() => { setActiveTab("medicines"); setActiveCategory("All"); }}
                        className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "medicines" ? "bg-white text-[#08B36A] shadow-md" : "text-slate-500"}`}
                    >
                        <FaCapsules size={14} /> Medicines
                    </button>
                    <button
                        onClick={() => { setActiveTab("products"); setActiveCategory("All"); }}
                        className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "products" ? "bg-white text-[#08B36A] shadow-md" : "text-slate-500"}`}
                    >
                        <FaShoppingBasket size={14} /> Products
                    </button>
                </div>

                {/* CATEGORY FILTER BAR */}
                <div className="flex items-center gap-2 overflow-x-auto pb-8 no-scrollbar">
                    <div className="flex items-center gap-2 pr-4 border-r border-slate-200">
                        <FaFilter className="text-slate-400 text-xs" />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Filters</span>
                    </div>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat
                                ? "bg-[#08B36A] text-white shadow-lg shadow-emerald-200"
                                : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* MAIN GRID AREA */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === "medicines" ? (
                        <AllMed items={filteredItems} onBuy={handleOpenModal} />
                    ) : (
                        <AllProducts items={filteredItems} onBuy={handleOpenModal} />
                    )}
                </motion.div>

                {/* EMPTY STATE */}
                {filteredItems.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-100 shadow-sm mt-10">
                        <FaMedkit className="mx-auto text-5xl text-slate-100 mb-4" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No items matching your selection</p>
                        <button onClick={() => { setSearchTerm(""); setActiveCategory("All"); }} className="text-[#08B36A] text-[10px] font-bold uppercase mt-4 underline">Clear all filters</button>
                    </div>
                )}
            </div>
        </div>
    );
}