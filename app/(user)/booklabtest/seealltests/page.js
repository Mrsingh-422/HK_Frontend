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
    FaChevronRight
} from "react-icons/fa";
import TestDetailsModal from "../components/otherComponents/TestDetailsModal";
import UserAPI from "@/app/services/UserAPI";
import AllPackagesList from "./components/otherComponents/AllPackagesList";
import AllSingleTestsList from "./components/otherComponents/AllSingleTestsList";

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

    // Navigate to Single Lab Detail Page
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

                <section className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-emerald-500" />
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Choose Laboratory</h2>
                        </div>
                        <div className="relative w-full md:w-72">
                            <input
                                type="text"
                                placeholder="Find a specific lab..."
                                value={labSearchTerm}
                                onChange={(e) => setLabSearchTerm(e.target.value)}
                                className="w-full pl-4 pr-10 py-2.5 bg-slate-100 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-bold transition-all"
                            />
                            {labSearchTerm && <FaTimes className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer" onClick={() => setLabSearchTerm("")} />}
                        </div>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        <button
                            onClick={() => setSelectedLabId(null)}
                            className={`flex-shrink-0 text-left w-[200px] p-5 rounded-2xl border-2 transition-all duration-200 ${selectedLabId === null ? "bg-white border-emerald-500 shadow-lg ring-1 ring-emerald-500" : "bg-white border-transparent shadow-sm"}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className={`p-2 rounded-lg ${selectedLabId === null ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}><FaLayerGroup size={16} /></div>
                                {selectedLabId === null && <FaCheckCircle className="text-emerald-500" />}
                            </div>
                            <h3 className="font-black text-sm text-slate-800">All Labs</h3>
                        </button>

                        {loadingLabs ? Array(3).fill(0).map((_, i) => <div key={i} className="min-w-[260px] h-28 bg-white border border-slate-100 rounded-2xl animate-pulse" />) : 
                        labs.map((lab) => (
                            <div
                                key={lab._id}
                                onClick={() => handleLabClick(lab._id)}
                                className="group flex-shrink-0 cursor-pointer text-left w-[260px] p-5 rounded-2xl border-2 border-transparent bg-white shadow-sm hover:border-emerald-500 hover:shadow-xl transition-all relative"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-black text-sm truncate w-4/5 text-slate-800 group-hover:text-emerald-600">{lab.labName || lab.name}</h3>
                                    <FaChevronRight className="text-slate-300 group-hover:text-emerald-500 transition-all" size={12} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-400 uppercase">{lab.city}</span>
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                        {lab.distance ? `${lab.distance.toFixed(1)} KM` : "NEARBY"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

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

export default AllTestsPage;