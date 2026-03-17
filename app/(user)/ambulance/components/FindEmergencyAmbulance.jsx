"use client";

import { useRouter } from "next/navigation";
import React, { useState, useMemo, useEffect } from "react";
import {
    FaSearch, FaFilter, FaStar, FaAmbulance,
    FaTimes, FaArrowRight, FaMapMarkerAlt, FaChevronRight
} from "react-icons/fa";
import { AMBULANCE_DATA } from "../../../constants/constants";
import ShowAmbulanceModal from "../components/otherComponents/ShowAmbulancsModel";
import { useGlobalContext } from "@/app/context/GlobalContext";

// --- Hardcoded Categories ---
const AMBULANCE_CATEGORIES = [
    { 
        label: "ALS", 
        img: "https://cdn-icons-png.flaticon.com/512/1032/1032989.png", 
        fullForm: "Advanced Life Support" 
    },
    { 
        label: "BLS", 
        img: "https://cdn-icons-png.flaticon.com/512/883/883356.png", 
        fullForm: "Basic Life Support" 
    },
    { 
        label: "PTV", 
        img: "https://cdn-icons-png.flaticon.com/512/2864/2864275.png", 
        fullForm: "Patient Transport" 
    },
    { 
        label: "Mortuary", 
        img: "https://cdn-icons-png.flaticon.com/512/4320/4320355.png", 
        fullForm: "Mortuary Van" 
    },
];

function FindEmergencyAmbulance() {
    const router = useRouter();
    const { getAmbulancePageData } = useGlobalContext();

    // --- Dynamic Content State (Excluding Categories) ---
    const [pageData, setPageData] = useState({
        headerTag: "Loading...",
        mainTitle: "Find Emergency\nAmbulance!",
        subTitle: "24*7 Service Available",
        description: "Reliable emergency response at your fingertips.",
        searchLabel: "Find Ambulance In Your City..",
        searchPlaceholder: "Search Emergency Ambulance",
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("recommended");
    const [selectedAmbulance, setSelectedAmbulance] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await getAmbulancePageData();
                if (res?.success && res?.data) {
                    setPageData(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch ambulance page data:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchContent();
    }, [getAmbulancePageData]);

    const handleSelectAmbulance = (ambulance) => {
        setSelectedAmbulance(ambulance);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedAmbulance(null);
    };

    const processedAmbulances = useMemo(() => {
        let filtered = AMBULANCE_DATA.filter((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.vendor.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortBy === "price-low") return [...filtered].sort((a, b) => a.price - b.price);
        if (sortBy === "distance") return [...filtered].sort((a, b) => a.distance - b.distance);
        if (sortBy === "rating") return [...filtered].sort((a, b) => b.rating - a.rating);

        return filtered;
    }, [searchTerm, sortBy]);

    const hasMore = processedAmbulances.length > 6;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#08B36A]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 md:py-16 px-4 sm:px-6 lg:px-8 font-sans bg-gray-50/30">
            <ShowAmbulanceModal
                isOpen={isModalOpen}
                ambulance={selectedAmbulance}
                onClose={closeModal}
            />

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* LEFT SECTION */}
                <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24 h-fit">
                    <div className="border-l-4 border-[#08B36A] pl-6 space-y-4">
                        <h4 className="text-[#08B36A] font-black uppercase tracking-widest text-xs">
                            {pageData.headerTag}
                        </h4>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight whitespace-pre-line">
                            {pageData.mainTitle}
                        </h1>
                        <p className="text-xl font-bold text-slate-700 uppercase tracking-tighter">
                            {pageData.subTitle}
                        </p>
                    </div>

                    <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-xl">
                        {pageData.description}
                    </p>

                    {/* Hardcoded Category Icons Rendering */}
                    <div className="grid grid-cols-4 gap-4 max-w-sm">
                        {AMBULANCE_CATEGORIES.map((cat, index) => (
                            <div key={index} className="flex flex-col items-center gap-2 group cursor-pointer" title={cat.fullForm}>
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:border-[#08B36A] group-hover:shadow-md transition-all">
                                    <img
                                        src={cat.img}
                                        alt={cat.label}
                                        className="w-8 h-8 object-contain"
                                    />
                                </div>
                                <span className="text-xs font-black text-slate-800">{cat.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Search Box */}
                    <div className="space-y-4 max-w-md">
                        <label className="text-[#08B36A] font-black text-xs uppercase tracking-widest">
                            {pageData.searchLabel}
                        </label>
                        <div className="relative group">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#08B36A] transition-colors" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={pageData.searchPlaceholder}
                                className="w-full pl-12 pr-12 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#08B36A] focus:border-transparent outline-none transition-all shadow-sm text-lg"
                            />
                            {searchTerm && (
                                <FaTimes
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 cursor-pointer"
                                    onClick={() => setSearchTerm("")}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT SECTION: RESULTS */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm gap-4">
                        <p className="text-slate-700 font-bold">
                            <span className="text-blue-600">{processedAmbulances.length} Emergency Ambulance</span> Found(s)
                        </p>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <FaFilter className="text-[#08B36A]" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full sm:w-auto bg-slate-50 border-none text-sm font-bold text-slate-700 py-2 pl-3 pr-8 rounded-xl focus:ring-2 focus:ring-[#08B36A] cursor-pointer"
                            >
                                <option value="recommended">Sort: Recommended</option>
                                <option value="distance">Sort: Nearest First</option>
                                <option value="price-low">Sort: Price Low to High</option>
                                <option value="rating">Sort: Top Rated</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {processedAmbulances.length > 0 ? (
                            <>
                                {processedAmbulances.slice(0, 6).map((item) => (
                                    <div key={item.id} className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                        <div className="flex flex-col sm:flex-row gap-6">
                                            <div className="w-full sm:w-40 md:w-48 h-48 sm:h-40 md:h-48 flex-shrink-0 relative overflow-hidden rounded-2xl md:rounded-3xl bg-slate-50">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-lg text-[9px] font-black shadow-lg animate-pulse">EMERGENCY</div>
                                            </div>

                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="text-xl md:text-2xl font-black text-slate-800 group-hover:text-[#08B36A] transition-colors">{item.name}</h3>
                                                            <p className="text-[#08B36A] font-bold text-xs uppercase tracking-widest">{item.vendor}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                                                            <FaStar className="text-yellow-400 text-xs" />
                                                            <span className="text-xs font-black text-yellow-700">{item.rating}.0</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-3 mt-4">
                                                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                            <FaAmbulance className="text-[#08B36A]" /> Type: {item.type}
                                                        </span>
                                                        <span className="bg-emerald-50 text-[#08B36A] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                            <FaMapMarkerAlt /> {item.distance}km away
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-6 mt-4 border-t border-slate-50">
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Estimated Fare</p>
                                                        <p className="text-2xl font-black text-slate-900">₹{item.price}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleSelectAmbulance(item)}
                                                        className="bg-[#08B36A] hover:bg-slate-900 text-white font-black px-8 py-3 rounded-xl transition-all shadow-lg shadow-[#08B36A]/20 active:scale-95 flex items-center gap-2 text-sm">
                                                        BOOK NOW <FaChevronRight className="text-[10px]" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {hasMore && (
                                    <div className="pt-6 text-center">
                                        <button
                                            onClick={() => router.push("/ambulance/seeallambulances")}
                                            className="inline-flex items-center gap-2 bg-white text-[#08B36A] border-2 border-[#08B36A] font-black px-10 py-4 rounded-2xl hover:bg-[#08B36A] hover:text-white transition-all shadow-lg active:scale-95 group"
                                        >
                                            See All Ambulances
                                            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
                                <FaAmbulance className="mx-auto text-6xl text-slate-200 mb-4" />
                                <h3 className="text-xl font-bold text-slate-800">No Ambulances Found</h3>
                                <button
                                    onClick={() => { setSearchTerm(""); setSortBy("recommended"); }}
                                    className="mt-4 text-[#08B36A] font-bold underline"
                                >
                                    Reset all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FindEmergencyAmbulance;