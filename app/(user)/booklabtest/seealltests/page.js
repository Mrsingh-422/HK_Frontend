"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    FaArrowLeft,
    FaSearch,
    FaMapMarkerAlt,
    FaCheckCircle,
    FaFlask,
    FaBoxOpen,
    FaTimes,
    FaLayerGroup,
    FaChevronRight,
    FaStar,
    FaClock,
    FaHouseUser,
    FaBolt,
    FaShieldAlt,
    FaHistory
} from "react-icons/fa";
import TestDetailsModal from "../components/otherComponents/TestDetailsModal";
import UserAPI from "@/app/services/UserAPI";
import AllPackagesList from "./components/otherComponents/AllPackagesList";
import AllSingleTestsList from "./components/otherComponents/AllSingleTestsList";

// --- SKELETON COMPONENTS ---
const LabCardSkeleton = () => (
    <div className="flex-shrink-0 w-[340px] h-[210px] bg-white rounded-3xl border border-slate-100 p-5 flex flex-col justify-between animate-pulse">
        <div>
            <div className="flex justify-between items-start">
                <div className="w-2/3">
                    <div className="h-5 bg-slate-200 rounded-md w-full mb-2"></div>
                    <div className="h-3 bg-slate-100 rounded-md w-1/2"></div>
                </div>
                <div className="w-16 h-8 bg-slate-100 rounded-lg"></div>
            </div>
            <div className="flex gap-2 mt-4">
                <div className="h-6 w-12 bg-slate-100 rounded-md"></div>
                <div className="h-6 w-12 bg-slate-100 rounded-md"></div>
                <div className="h-6 w-12 bg-slate-100 rounded-md"></div>
            </div>
        </div>
        <div className="flex justify-between items-end pt-4 border-t border-slate-50">
            <div className="w-1/2">
                <div className="h-3 bg-slate-100 rounded-md w-full mb-1"></div>
                <div className="h-3 bg-slate-100 rounded-md w-2/3"></div>
            </div>
            <div className="w-8 h-8 bg-slate-100 rounded-full"></div>
        </div>
    </div>
);

function AllTestsPage() {
    const router = useRouter();

    const [localSearch, setLocalSearch] = useState("");
    const [labSearchTerm, setLabSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("packages");
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [labs, setLabs] = useState([]);
    const [selectedLabId, setSelectedLabId] = useState(null);
    const [loadingLabs, setLoadingLabs] = useState(true);
    const [locationError, setLocationError] = useState(false);

    const fetchLabs = useCallback(async (searchTerm = "") => {
        setLoadingLabs(true);
        const storedCoords = localStorage.getItem("userCoords");

        if (!storedCoords) {
            setLocationError(true);
            setLoadingLabs(false);
            return;
        }

        try {
            const parsedCoords = JSON.parse(storedCoords);
            const payload = {
                lat: parsedCoords.lat,
                lng: parsedCoords.lng,
                search: searchTerm
            };

            const response = await UserAPI.getLabsList(payload);
            if (response.success) {
                setLabs(response.data || []);
            }
        } catch (error) {
            console.error("Error fetching labs:", error);
            setLocationError(true);
        } finally {
            setLoadingLabs(false);
        }
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchLabs(labSearchTerm);
        }, 400);
        return () => clearTimeout(delayDebounceFn);
    }, [labSearchTerm, fetchLabs]);

    const handleLabClick = (labId) => {
        router.push(`/booklabtest/singlelabdetail/${labId}`);
    };

    const handleOpenModal = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
            <TestDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} pkg={selectedItem} />

            {/* Sticky Navigation */}
            <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold text-sm transition-colors">
                        <FaArrowLeft size={12} />
                        <span className="uppercase tracking-wider">Back</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-500 rounded-lg"><FaFlask className="text-white text-sm" /></div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Diagnostics</span>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Search & Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Explore <span className="text-emerald-600">Diagnostics</span></h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Verified tests from trusted NABL laboratories.</p>
                    </div>
                    <div className="relative w-full md:w-[450px]">
                        <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search for tests (e.g. Vitamin B12, KFT)..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-sm shadow-sm font-medium"
                        />
                    </div>
                </div>

                {/* Lab Selection Section */}
                <section className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-emerald-500" />
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Labs Near You</h2>
                        </div>
                        <div className="relative w-full md:w-72">
                            <input
                                type="text"
                                placeholder="Search lab by name..."
                                value={labSearchTerm}
                                onChange={(e) => setLabSearchTerm(e.target.value)}
                                className="w-full pl-4 pr-10 py-2.5 bg-slate-100 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-bold transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar pt-2">
                        {/* Static "All Labs" Filter Card */}
                        <div
                            onClick={() => setSelectedLabId(null)}
                            className={`flex-shrink-0 cursor-pointer w-[180px] p-6 rounded-3xl border-2 transition-all flex flex-col justify-between h-[210px] ${selectedLabId === null ? "bg-white border-emerald-500 shadow-xl" : "bg-white border-transparent shadow-sm"}`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedLabId === null ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                                <FaLayerGroup size={20} />
                            </div>
                            <div>
                                <h3 className="font-black text-sm text-slate-800 uppercase tracking-tight">Show All Labs</h3>
                                <p className="text-[10px] text-slate-400 font-bold mt-1">Discover all providers</p>
                            </div>
                        </div>

                        {/* Dynamic Lab Cards based on API Response */}
                        {loadingLabs ? (
                            <>
                                <LabCardSkeleton />
                                <LabCardSkeleton />
                            </>
                        ) : (
                            labs.map((lab) => (
                                <div
                                    key={lab._id}
                                    onClick={() => handleLabClick(lab._id)}
                                    className="group flex-shrink-0 cursor-pointer w-[340px] bg-white rounded-3xl border-2 border-transparent shadow-sm hover:border-emerald-500 hover:shadow-2xl transition-all duration-300 p-5 flex flex-col justify-between h-[210px]"
                                >
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <div className="max-w-[65%]">
                                                <h3 className="font-black text-base text-slate-800 group-hover:text-emerald-600 transition-colors truncate">
                                                    {lab.name}
                                                </h3>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                    {lab.city}, {lab.state} {lab.distance ? `• ${lab.distance.toFixed(1)} KM` : ""}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg text-amber-600 border border-amber-100">
                                                    <FaStar size={10} />
                                                    <span className="text-[11px] font-black">{lab.rating || "N/A"}</span>
                                                    <span className="text-[9px] text-amber-400 ml-0.5">({lab.totalReviews || 0})</span>
                                                </div>
                                                <span className={`mt-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${lab.openStatus === "Open Now" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                                                    {lab.openStatus}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Dynamic Badges from JSON Features */}
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {lab.is24x7 && <Badge icon={<FaHistory size={8} />} text="24/7" color="blue" />}
                                            {lab.isRapidServiceAvailable && <Badge icon={<FaBolt size={8} />} text="Rapid" color="purple" />}
                                            {lab.isHomeCollectionAvailable && <Badge icon={<FaHouseUser size={8} />} text="Home Visit" color="emerald" />}
                                            {lab.isInsuranceAccepted && <Badge icon={<FaShieldAlt size={8} />} text="Insurance" color="slate" />}
                                        </div>
                                    </div>

                                    {/* Timing and Slots from JSON */}
                                    <div className="flex items-end justify-between pt-4 border-t border-slate-50">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                <FaClock size={10} className="text-slate-300" />
                                                <span className="text-[10px] font-bold">{lab.timingLabel}</span>
                                            </div>
                                            {lab.nextAvailableSlot && (
                                                <div className="text-[10px]">
                                                    <span className="text-slate-400 font-medium">Next: </span>
                                                    <span className="text-emerald-600 font-black">
                                                        {lab.nextAvailableSlot.date}, {lab.nextAvailableSlot.time}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-emerald-500 group-hover:text-white transition-all flex items-center justify-center">
                                            <FaChevronRight size={10} />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Tab Switcher */}
                <div className="flex p-1.5 bg-slate-200/50 rounded-2xl mb-10 w-fit mx-auto md:mx-0">
                    <button onClick={() => setActiveTab("packages")} className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "packages" ? "bg-white text-emerald-600 shadow-md" : "text-slate-500"}`}>
                        <FaBoxOpen size={14} /> Health Packages
                    </button>
                    <button onClick={() => setActiveTab("single")} className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "single" ? "bg-white text-emerald-600 shadow-md" : "text-slate-500"}`}>
                        <FaFlask size={14} /> Single Tests
                    </button>
                </div>

                <div className="min-h-[500px]">
                    {activeTab === "packages" ? (
                        <AllPackagesList searchTerm={localSearch} selectedLabId={selectedLabId} onBook={handleOpenModal} />
                    ) : (
                        <AllSingleTestsList searchTerm={localSearch} selectedLabId={selectedLabId} onBook={handleOpenModal} />
                    )}
                </div>
            </main>
        </div>
    );
}

// Reusable Small Badge Component
const Badge = ({ icon, text, color }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        slate: "bg-slate-50 text-slate-600 border-slate-100",
    };
    return (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-md border ${colors[color]}`}>
            {icon}
            <span className="text-[9px] font-bold uppercase">{text}</span>
        </div>
    );
};

export default AllTestsPage;