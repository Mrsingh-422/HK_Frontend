"use client";

import { useRouter } from "next/navigation";
import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaSearch, FaFilter, FaStar, FaAmbulance,
    FaTimes, FaArrowRight, FaMapMarkerAlt, FaChevronRight,
    FaPhoneAlt, FaShieldAlt, FaClock, FaCheckCircle
} from "react-icons/fa";
import { AMBULANCE_DATA } from "../../../constants/constants";
import ShowAmbulanceModal from "../components/otherComponents/ShowAmbulancsModel";
import { useGlobalContext } from "@/app/context/GlobalContext";

// --- Animation Variants ---
const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
};

// --- Categories ---
const AMBULANCE_CATEGORIES = [
    {
        label: "ALS",
        img: "https://cdn-icons-png.flaticon.com/512/1032/1032989.png",
        fullForm: "Advanced Life Support",
        color: "text-red-600 bg-red-50"
    },
    {
        label: "BLS",
        img: "https://cdn-icons-png.flaticon.com/512/883/883356.png",
        fullForm: "Basic Life Support",
        color: "text-blue-600 bg-blue-50"
    },
    {
        label: "PTV",
        img: "https://cdn-icons-png.flaticon.com/512/2864/2864275.png",
        fullForm: "Patient Transport",
        color: "text-emerald-600 bg-emerald-50"
    },
    {
        label: "Mortuary",
        img: "https://cdn-icons-png.flaticon.com/512/4320/4320355.png",
        fullForm: "Mortuary Van",
        color: "text-slate-600 bg-slate-100"
    },
];

function FindEmergencyAmbulance() {
    const router = useRouter();
    const { getAmbulancePageData } = useGlobalContext();

    const [pageData, setPageData] = useState({
        headerTag: "Emergency Response Networkkkk",
        mainTitle: "Every Second Counts. \nBook an Ambulance.",
        subTitle: "24*7 Service Available",
        description: "India's fastest emergency response network. Get connected to the nearest ambulance in under 60 seconds.",
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
                console.error("Failed to fetch ambulance data");
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

    // --- Logic for filtering and showing only 6 ---
    const allFilteredAmbulances = useMemo(() => {
        let filtered = AMBULANCE_DATA.filter((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.vendor.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortBy === "price-low") filtered.sort((a, b) => a.price - b.price);
        if (sortBy === "distance") filtered.sort((a, b) => a.distance - b.distance);
        if (sortBy === "rating") filtered.sort((a, b) => b.rating - a.rating);

        return filtered;
    }, [searchTerm, sortBy]);

    const visibleAmbulances = allFilteredAmbulances.slice(0, 6);
    const hasMore = allFilteredAmbulances.length > 6;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFEFF] font-sans selection:bg-red-100">
            <ShowAmbulanceModal
                isOpen={isModalOpen}
                ambulance={selectedAmbulance}
                onClose={closeModal}
            />

            {/* ================= 1. EMERGENCY HERO SECTION ================= */}
            <section className="relative pt-16 pb-24 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-7 space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-600">{pageData.headerTag}</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight whitespace-pre-line">
                            {pageData.mainTitle}
                        </h1>

                        <p className="text-lg md:text-xl text-slate-500 max-w-xl leading-relaxed">
                            {pageData.description}
                        </p>

                        {/* Search Control */}
                        <div className="max-w-2xl bg-white rounded-[2.5rem] p-2 shadow-[0_20px_50px_rgba(220,38,38,0.1)] border border-slate-100 flex flex-col md:flex-row items-center gap-2">
                            <div className="relative flex-1 w-full group">
                                <FaMapMarkerAlt className="absolute left-6 top-1/2 -translate-y-1/2 text-red-500" />
                                <input
                                    type="text"
                                    placeholder={pageData.searchPlaceholder}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-14 pr-6 py-5 bg-transparent outline-none font-bold text-slate-700"
                                />
                            </div>
                            <button className="w-full md:w-auto bg-red-600 text-white px-10 py-5 rounded-[2rem] font-black hover:bg-slate-900 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                                <FaAmbulance /> Find Now
                            </button>
                        </div>

                        {/* Category Grid */}
                        <div className="grid grid-cols-4 gap-4 max-w-sm">
                            {AMBULANCE_CATEGORIES.map((cat, index) => (
                                <div key={index} className="flex flex-col items-center gap-2 group cursor-pointer" title={cat.fullForm}>
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:border-red-500 group-hover:shadow-md transition-all">
                                        <img src={cat.img} alt={cat.label} className="w-8 h-8 object-contain" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-800">{cat.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-5 relative"
                    >
                        <div className="bg-white p-4 rounded-[3.5rem] shadow-2xl border border-slate-50">
                            <img
                                src="https://images.unsplash.com/photo-1587350859728-117622bc75fb?auto=format&fit=crop&q=80&w=800"
                                className="w-full h-[500px] object-cover rounded-[2.5rem]"
                                alt="Emergency"
                            />
                            <div className="absolute -bottom-6 -left-6 bg-slate-900 text-white p-6 rounded-3xl shadow-2xl flex items-center gap-4">
                                <FaPhoneAlt className="text-red-500 text-2xl animate-bounce" />
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Emergency Helpline</p>
                                    <p className="text-xl font-black">102 / 108</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ================= 2. RESULTS SECTION ================= */}
            <section className="max-w-7xl mx-auto px-6 pb-32">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="space-y-3">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Active Ambulances</h2>
                        <div className="h-1.5 w-24 bg-red-600 rounded-full" />
                    </div>

                    <div className="flex items-center gap-4">
                        <FaFilter className="text-red-600" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-white border border-slate-100 text-sm font-bold text-slate-700 py-3 px-6 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value="recommended">Recommended</option>
                            <option value="distance">Nearest First</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="rating">Top Rated</option>
                        </select>
                    </div>
                </div>

                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                >
                    <AnimatePresence mode="popLayout">
                        {visibleAmbulances.length > 0 ? (
                            visibleAmbulances.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    variants={fadeInUp}
                                    whileHover={{ y: -12 }}
                                    onClick={() => handleSelectAmbulance(item)}
                                    className="group bg-white rounded-[2.5rem] p-5 border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(220,38,38,0.1)] transition-all cursor-pointer relative"
                                >
                                    <div className="relative mb-6 aspect-video rounded-[2rem] overflow-hidden bg-slate-50">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl flex items-center gap-2 shadow-sm">
                                            <FaStar className="text-amber-400 text-xs" />
                                            <span className="font-black text-xs">{item.rating}</span>
                                        </div>
                                        <div className="absolute bottom-4 right-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase">
                                            {item.type}
                                        </div>
                                    </div>

                                    <div className="space-y-4 px-2">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 group-hover:text-red-600 transition-colors leading-tight">{item.name}</h3>
                                            <p className="text-red-600 font-bold text-xs uppercase mt-1">{item.vendor}</p>
                                        </div>

                                        <div className="flex items-center justify-between py-3 border-y border-slate-50">
                                            <div className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                                <FaMapMarkerAlt className="text-red-500" /> {item.distance} km away
                                            </div>
                                            <div className="text-xs font-black text-emerald-600 uppercase">Available</div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Est. Fare</p>
                                                <p className="text-2xl font-black text-slate-900">₹{item.price}</p>
                                            </div>
                                            <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-colors">
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center">
                                <FaAmbulance className="mx-auto text-6xl text-slate-100 mb-4" />
                                <h3 className="text-xl font-bold text-slate-800">No Ambulances Found</h3>
                                <button onClick={() => setSearchTerm("")} className="text-red-600 font-bold underline">Reset Search</button>
                            </div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {hasMore && (
                    <div className="mt-16 text-center">
                        <button
                            onClick={() => router.push("/ambulance/seeallambulances")}
                            className="inline-flex items-center gap-3 bg-red-600 text-white px-12 py-5 rounded-[2rem] font-black hover:bg-slate-900 transition-all shadow-xl"
                        >
                            View All Units <FaArrowRight />
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}

export default FindEmergencyAmbulance;