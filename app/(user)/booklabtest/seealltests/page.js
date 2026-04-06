"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaSearch, FaMicroscope, FaBuilding, FaChevronRight } from "react-icons/fa";
import TestDetailsModal from "../components/otherComponents/TestDetailsModal";
import UserAPI from "@/app/services/UserAPI";
import AllPackagesList from "./components/otherComponents/AllPackagesList";
import AllSingleTestsList from "./components/otherComponents/AllSingleTestsList";

function AllTestsPage() {
    const router = useRouter();
    const [localSearch, setLocalSearch] = useState("");
    const [activeTab, setActiveTab] = useState("packages");
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [labs, setLabs] = useState([]);
    const [selectedLabId, setSelectedLabId] = useState(null);
    const [loadingLabs, setLoadingLabs] = useState(true);

    useEffect(() => {
        const fetchLabs = async () => {
            try {
                setLoadingLabs(true);
                const response = await UserAPI.getLabsList();
                if (response.success) {
                    setLabs(response.data);
                    if (response.data.length > 0) {
                        setSelectedLabId(response.data[0]._id);
                    }
                }
            } catch (error) {
                console.error("Error fetching labs:", error);
            } finally {
                setLoadingLabs(false);
            }
        };
        fetchLabs();
    }, []);

    const handleOpenModal = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleLabClick = (labId) => {
        router.push(`/booklabtest/singlelabdetail/${labId}`);
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <TestDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} pkg={selectedItem} />

            {/* Top Bar - Minimal & Professional */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-semibold"
                    >
                        <FaArrowLeft size={14} />
                        <span>Return</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <FaMicroscope className="text-[#08B36A]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Diagnostic Portal</span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-100">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            Available <span className="text-[#08B36A]">{activeTab === "packages" ? "Diagnostic Packages" : "Individual Tests"}</span>
                        </h1>
                        <p className="text-slate-500 mt-2 text-sm">
                            Select a diagnostic center to view specific services and pricing.
                        </p>
                    </div>

                    {/* Professional Search Input */}
                    <div className="relative w-full md:w-96">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search for tests or health checkups..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-[#08B36A] focus:border-[#08B36A] outline-none text-sm transition-all"
                        />
                    </div>
                </div>

                {/* Lab Selection - Clean Horizontal Grid */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Partner Laboratories</h2>
                    </div>

                    <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200">
                        {loadingLabs ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="h-16 w-64 flex-shrink-0 bg-slate-100 animate-pulse rounded border border-slate-200" />
                            ))
                        ) : (
                            labs.map((lab) => (
                                <button
                                    key={lab._id}
                                    onClick={() => handleLabClick(lab._id)}
                                    className="flex-shrink-0 flex items-center gap-4 px-4 py-3 rounded border border-slate-200 bg-white hover:border-[#08B36A] hover:bg-slate-50 transition-all group min-w-[260px]"
                                >
                                    <div className="p-2.5 rounded bg-slate-100 text-slate-500 group-hover:bg-[#08B36A] group-hover:text-white transition-colors">
                                        <FaBuilding size={16} />
                                    </div>
                                    <div className="text-left overflow-hidden">
                                        <h3 className="text-sm font-bold text-slate-800 truncate">{lab.name}</h3>
                                        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-tighter">{lab.city}</p>
                                    </div>
                                    <FaChevronRight size={10} className="ml-auto text-slate-300 group-hover:text-[#08B36A]" />
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Tab Navigation - Corporate Style */}
                <div className="flex items-center border-b border-slate-200 mb-8">
                    <button
                        onClick={() => setActiveTab("packages")}
                        className={`px-6 pb-3 text-sm font-bold transition-all relative ${activeTab === "packages" ? "text-[#08B36A]" : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        Health Packages
                        {activeTab === "packages" && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#08B36A]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("single")}
                        className={`px-6 pb-3 text-sm font-bold transition-all relative ${activeTab === "single" ? "text-[#08B36A]" : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        Single Tests
                        {activeTab === "single" && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#08B36A]" />
                        )}
                    </button>
                </div>

                {/* Content Area */}
                <div className="min-h-[400px]">
                    {activeTab === "packages" ? (
                        <AllPackagesList
                            searchTerm={localSearch}
                            selectedLabId={selectedLabId}
                            onBook={handleOpenModal}
                        />
                    ) : (
                        <AllSingleTestsList
                            searchTerm={localSearch}
                            selectedLabId={selectedLabId}
                            onBook={handleOpenModal}
                        />
                    )}
                </div>
            </main>

            {/* Footer-like Note */}
            <footer className="max-w-7xl mx-auto px-4 py-10 border-t border-slate-100 mt-12">
                <p className="text-center text-xs text-slate-400 font-medium uppercase tracking-[0.2em]">
                    All tests are conducted in ISO certified partner laboratories
                </p>
            </footer>

            <style jsx global>{`
                /* Hide scrollbar for clean horizontal scrolling but allow functionality */
                ::-webkit-scrollbar {
                    height: 4px;
                    width: 4px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #08B36A;
                }
            `}</style>
        </div>
    );
}

export default AllTestsPage;