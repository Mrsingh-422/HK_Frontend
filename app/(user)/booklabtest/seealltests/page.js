"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    FaArrowLeft,
    FaMapMarkerAlt,
    FaFlask,
    FaBoxOpen,
    FaLayerGroup,
    FaChevronRight,
    FaStar,
    FaHospital,
    FaTag,
    FaSearch
} from "react-icons/fa";
import TestDetailsModal from "../components/otherComponents/TestDetailsModal";
import UserAPI from "@/app/services/UserAPI";
import AllPackagesList from "./components/otherComponents/AllPackagesList";
import AllSingleTestsList from "./components/otherComponents/AllSingleTestsList";
import { useGlobalContext } from "@/app/context/GlobalContext";

// --- SKELETON COMPONENT ---
const LabCardSkeleton = () => (
    <div className="flex-shrink-0 w-[360px] bg-white rounded-2xl border border-gray-100 p-5 animate-pulse shadow-sm">
        <div className="flex gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
        </div>
        <div className="h-16 bg-gray-50 rounded-xl mt-4"></div>
        <div className="h-10 bg-gray-50 rounded-xl mt-4"></div>
    </div>
);

function AllTestsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("packages");
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { location } = useGlobalContext();
    // alert(location?.lat + " " + location?.lng);

    // Lab Data States
    const [labs, setLabs] = useState([]);
    const [selectedLabId, setSelectedLabId] = useState(null);
    const [loadingLabs, setLoadingLabs] = useState(true);

    // Search & Suggestion States
    const [labSearchQuery, setLabSearchQuery] = useState("");
    const [labSuggestions, setLabSuggestions] = useState([]);
    const [showLabSuggestions, setShowLabSuggestions] = useState(false);

    // Location State (Retrieved from LocalStorage)
    const [coords, setCoords] = useState({ lat: null, lng: null });
    // alert(coords.lat + " " + coords.lng);

    // Fetch Labs Logic
    const fetchLabs = useCallback(async () => {
        setLoadingLabs(true);
        try {
            const payload = {
                lat: coords.lat,
                lng: coords.lng,
                // lat: location?.lat,
                // lng: location?.lng,
                search: labSearchQuery,
                // City/State/Country removed as we rely on coords
            };

            const response = await UserAPI.getLabsList(payload);
            if (response.success) {
                const labsData = Array.isArray(response.data) ? response.data : [response.data];
                setLabs(labsData);
            } else {
                setLabs([]);
            }
        } catch (error) {
            console.error("Error fetching labs:", error);
            setLabs([]);
        } finally {
            setLoadingLabs(false);
        }
    }, [coords, labSearchQuery]);

    // Initial Load: Check local storage for existing coords
    useEffect(() => {
        const storedCoords = localStorage.getItem("userCoords");
        if (storedCoords) {
            try {
                setCoords(JSON.parse(storedCoords));
            } catch (e) {
                console.error("Error parsing userCoords", e);
            }
        }
    }, []);

    // Re-fetch when coordinates or search query change
    useEffect(() => {
        fetchLabs();
    }, [fetchLabs, location]);

    // --- SEARCH LOGIC ---
    const handleLabSearchChange = async (val) => {
        setLabSearchQuery(val);
        if (val.length > 1) {
            try {
                const res = await UserAPI.getLabNameSuggestions(val);
                if (res.success) {
                    setLabSuggestions(res.data);
                    setShowLabSuggestions(true);
                }
            } catch (err) {
                console.error("Lab suggestion error:", err);
            }
        } else {
            setLabSuggestions([]);
        }
    };

    const selectLabSuggestion = (name) => {
        setLabSearchQuery(name);
        setShowLabSuggestions(false);
    };

    const handleLabClick = (labId) => {
        router.push(`/booklabtest/singlelabdetail/${labId}`);
    };

    const handleOpenModal = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <TestDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} pkg={selectedItem} />

            {/* Navigation Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors text-sm font-medium"
                        >
                            <FaArrowLeft size={16} /> Back
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                                <FaFlask size={14} className="text-white" />
                            </div>
                            <span className="text-sm font-semibold text-gray-800">HK Diagnostics</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* SEARCH BAR SECTION (Cleaned up to Lab Search Only) */}
                <div className="mb-10">
                    <div className="max-w-2xl mx-auto relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for a specific diagnostic center..."
                            value={labSearchQuery}
                            onChange={(e) => handleLabSearchChange(e.target.value)}
                            onFocus={() => labSuggestions.length > 0 && setShowLabSuggestions(true)}
                            className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                        />
                        {showLabSuggestions && labSuggestions.length > 0 && (
                            <div className="absolute z-[60] w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto">
                                {labSuggestions.map((s, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => selectLabSuggestion(s.name)}
                                        className="px-4 py-3 hover:bg-emerald-50 cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-0"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-emerald-600">
                                            <FaHospital size={14} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">{s.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-tight">{s.city}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Labs Carousel Section */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-emerald-500" size={16} />
                            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Diagnostic Centers Near Your Location
                            </h2>
                        </div>
                    </div>

                    <div className="overflow-x-auto pb-4 -mx-2 px-2 no-scrollbar">
                        <div className="flex gap-4">
                            {/* Reset Filter Button */}
                            <div
                                onClick={() => {
                                    setSelectedLabId(null);
                                    setLabSearchQuery("");
                                }}
                                className={`flex-shrink-0 cursor-pointer w-[160px] rounded-xl border-2 transition-all p-4 ${selectedLabId === null && !labSearchQuery
                                    ? "bg-emerald-600 border-emerald-600 text-white shadow-lg"
                                    : "bg-white border-gray-200 text-gray-600 hover:border-emerald-300"
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${selectedLabId === null && !labSearchQuery ? "bg-white/20" : "bg-gray-100"}`}>
                                    <FaLayerGroup size={20} className={selectedLabId === null && !labSearchQuery ? "text-white" : "text-gray-500"} />
                                </div>
                                <h3 className="font-semibold text-sm">All Labs</h3>
                                <p className="text-xs opacity-75 mt-1">Reset Filters</p>
                            </div>

                            {loadingLabs ? (
                                [1, 2, 3].map((i) => <LabCardSkeleton key={i} />)
                            ) : labs.length > 0 ? (
                                labs.map((lab) => (
                                    <div
                                        key={lab._id}
                                        onClick={() => handleLabClick(lab._id)}
                                        className="group flex-shrink-0 cursor-pointer w-[360px] bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 p-5"
                                    >
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400 overflow-hidden">
                                                {lab.profileImage ? (
                                                    <img src={lab.profileImage} alt={lab.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <FaHospital size={28} />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className="font-semibold text-gray-900 truncate">{lab.name}</h3>
                                                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                                                        <FaStar size={10} className="text-amber-500" />
                                                        <span className="text-xs font-semibold text-amber-700">{lab.rating || "New"}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                    {lab.distance && (
                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                            <FaMapMarkerAlt size={10} /> {lab.distance} km
                                                        </span>
                                                    )}
                                                    {lab.startingPrice > 0 && (
                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                            <FaTag size={10} /> From ₹{lab.startingPrice}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <p className="text-xs text-gray-700 font-medium">{lab.city}, {lab.state}</p>
                                            <p className="text-xs text-gray-400 mt-0.5 truncate">{lab.address}</p>
                                        </div>

                                        <div className="mt-4 pt-3 flex items-center justify-between border-t border-gray-100">
                                            <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">Available now</span>
                                            <button className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors">
                                                View Lab <FaChevronRight size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="w-full py-10 px-10 text-center bg-white rounded-xl border border-dashed border-gray-300 min-w-[300px]">
                                    <p className="text-gray-500 text-sm font-medium">No diagnostic centers found near you.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="mb-8">
                    <div className="flex gap-2 bg-gray-100 rounded-xl p-1 w-fit">
                        <button
                            onClick={() => setActiveTab("packages")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "packages" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                        >
                            <FaBoxOpen size={16} /> Health Packages
                        </button>
                        <button
                            onClick={() => setActiveTab("single")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "single" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                        >
                            <FaFlask size={16} /> Single Tests
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="min-h-[400px]">
                    {activeTab === "packages" ? (
                        <AllPackagesList selectedLabId={selectedLabId} onBook={handleOpenModal} />
                    ) : (
                        <AllSingleTestsList selectedLabId={selectedLabId} onBook={handleOpenModal} />
                    )}
                </div>
            </div>

            {/* Click Outside Listener to close suggestion overlays */}
            {showLabSuggestions && (
                <div
                    className="fixed inset-0 z-[55]"
                    onClick={() => setShowLabSuggestions(false)}
                />
            )}
        </div>
    );
}

export default AllTestsPage;