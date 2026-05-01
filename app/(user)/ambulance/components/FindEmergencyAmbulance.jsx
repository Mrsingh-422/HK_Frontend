"use client";

import { useRouter } from "next/navigation";
import React, { useState, useMemo, useEffect } from "react";
import { 
    FaFilter, FaStar, FaMapMarkerAlt, 
    FaAmbulance, FaArrowRight, FaChevronDown 
} from "react-icons/fa";
import { AMBULANCE_DATA } from "../../../constants/constants";
import { useGlobalContext } from "@/app/context/GlobalContext";
import AmbulanceHero from "./AmbulanceHero";

function FindEmergencyAmbulance() {
    const router = useRouter();
    const { getAmbulancePageData } = useGlobalContext();

    const [pageData, setPageData] = useState({
        headerTag: "Emergency Response Network",
        mainTitle: "Every Second Counts. \nBook an Ambulance.",
        description: "India's fastest emergency response network. Real-time tracking and immediate dispatch.",
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
                if (res?.success && res?.data) setPageData(res.data);
            } catch (err) {
                console.error("Failed to fetch ambulance data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchContent();
    }, [getAmbulancePageData]);

    // Filtering and Sorting Logic
    const filteredAmbulances = useMemo(() => {
        let filtered = AMBULANCE_DATA.filter((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.vendor.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortBy === "price-low") filtered.sort((a, b) => a.price - b.price);
        if (sortBy === "distance") filtered.sort((a, b) => a.distance - b.distance);
        if (sortBy === "rating") filtered.sort((a, b) => b.rating - a.rating);
        
        return filtered;
    }, [searchTerm, sortBy]);

    const visibleAmbulances = filteredAmbulances.slice(0, 6);
    const hasMore = filteredAmbulances.length > 6;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-red-600 border-solid border-gray-200"></div>
                    <p className="text-slate-500 font-bold animate-pulse text-sm uppercase tracking-widest">Locating Units...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFEFF] font-sans text-slate-900">
            {/* Component 1: Hero Section */}
            <AmbulanceHero 
                pageData={pageData} 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
            />

            {/* Component 2: Results Section */}
            <section className="max-w-7xl mx-auto px-6 pb-32">
                
                {/* Header & Filter Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-black tracking-tight">Nearby Available Units</h2>
                        <p className="text-slate-500 text-sm font-medium">Showing top verified ambulances in your area</p>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                        <div className="pl-4">
                            <FaFilter className="text-red-600 text-sm" />
                        </div>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none bg-transparent text-sm font-black py-2 pl-2 pr-8 outline-none cursor-pointer"
                            >
                                <option value="recommended">Recommended</option>
                                <option value="distance">Nearest First</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="rating">Top Rated</option>
                            </select>
                            <FaChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none text-slate-400" />
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {visibleAmbulances.length > 0 ? (
                        visibleAmbulances.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => {
                                    setSelectedAmbulance(item);
                                    setIsModalOpen(true);
                                }}
                                className="group bg-white rounded-[2.5rem] p-4 border border-slate-100 hover:border-red-200 hover:shadow-[0_20px_50px_rgba(220,38,38,0.08)] transition-all duration-300 cursor-pointer"
                            >
                                {/* Image Container */}
                                <div className="relative mb-5 aspect-[16/10] rounded-[2rem] overflow-hidden bg-slate-100">
                                    <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-sm">
                                        <FaStar className="text-amber-400 text-xs" />
                                        <span className="font-black text-xs">{item.rating}</span>
                                    </div>
                                    <div className="absolute bottom-4 right-4 bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
                                        {item.type || "Emergency"}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="px-2 space-y-4">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 group-hover:text-red-600 transition-colors duration-300">
                                            {item.name}
                                        </h3>
                                        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">
                                            Provided by {item.vendor}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between py-3 border-y border-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                                                <FaMapMarkerAlt className="text-red-500 text-xs" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-600">{item.distance} km away</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                            <span className="text-[10px] font-black text-emerald-600 uppercase">Available</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Est. Fare</p>
                                            <p className="text-2xl font-black text-slate-900">₹{item.price}</p>
                                        </div>
                                        <button className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest group-hover:bg-red-600 transition-all duration-300 active:scale-95 shadow-lg shadow-slate-200 group-hover:shadow-red-100">
                                            Book Unit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-32 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <FaAmbulance className="text-4xl text-slate-200" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800">No Ambulances Found</h3>
                            <p className="text-slate-500 mt-2">Try adjusting your filters or search term.</p>
                            <button 
                                onClick={() => setSearchTerm("")}
                                className="mt-6 text-red-600 font-black text-sm underline hover:text-red-700"
                            >
                                Reset Search
                            </button>
                        </div>
                    )}
                </div>

                {/* View All Button */}
                {hasMore && (
                    <div className="mt-20 text-center">
                        <button
                            onClick={() => router.push("/ambulance/seeallambulances")}
                            className="group inline-flex items-center gap-4 bg-white border-2 border-slate-900 text-slate-900 px-12 py-5 rounded-full font-black hover:bg-slate-900 hover:text-white transition-all duration-300 shadow-xl"
                        >
                            Explore All Units 
                            <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}

export default FindEmergencyAmbulance;