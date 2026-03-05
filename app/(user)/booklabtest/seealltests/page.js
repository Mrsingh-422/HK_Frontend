"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaStar, FaMapMarkerAlt, FaSearch, FaMicroscope } from "react-icons/fa";
import TestDetailsModal from "../components/otherComponents/TestDetailsModal";
import { INITIAL_PACKAGES } from "../../../constants/constants";

function AllTestsPage() {
    const router = useRouter();
    const [tests, setTests] = useState([]);
    const [localSearch, setLocalSearch] = useState("");

    // ✅ ADDED ONLY THIS
    useEffect(() => {
        setTests(INITIAL_PACKAGES);
    }, []);

    const filteredTests = useMemo(() => {
        return tests.filter((t) =>
            t.name.toLowerCase().includes(localSearch.toLowerCase()) ||
            t.vendor.toLowerCase().includes(localSearch.toLowerCase())
        );
    }, [tests, localSearch]);

    const [selectedPackage, setSelectedPackage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleBookClick = (pkg) => {
        setSelectedPackage(pkg);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen font-sans selection:bg-[#08B36A]/10">

            <TestDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                pkg={selectedPackage}
            />

            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-7">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-600 font-bold text-xs uppercase tracking-widest cursor-pointer">
                        <FaArrowLeft /> Back
                    </button>
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <FaMicroscope className="text-[#08B36A] text-sm" />
                        <span className="text-[9px] font-black uppercase tracking-tighter">Verified Systems</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto py-6 md:py-10 px-4">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                            Medical <span className="text-[#08B36A]">Packages</span>
                        </h1>
                        <p className="text-slate-500 text-[10px] md:text-sm font-medium">Available diagnostics near you.</p>
                    </div>

                    <div className="relative w-full md:w-64">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#08B36A] outline-none text-xs"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                    {filteredTests.map((pkg) => (
                        <div
                            key={pkg.id}
                            className="bg-white rounded-2xl p-2.5 md:p-4 shadow-sm border border-slate-100 flex flex-col group hover:shadow-md transition-all"
                        >
                            <div className="h-28 sm:h-36 md:h-48 w-full relative overflow-hidden rounded-xl bg-slate-50 mb-3">
                                <img
                                    src={pkg.image}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    alt={pkg.name}
                                />
                                <div className="absolute bottom-2 right-2 bg-[#08B36A] text-white px-1.5 py-0.5 rounded-lg text-[7px] md:text-[9px] font-black shadow-lg">
                                    <FaMapMarkerAlt className="inline mr-1" />{pkg.distance}km
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-[7px] md:text-[10px] font-black text-[#08B36A] uppercase tracking-widest truncate max-w-[70px]">{pkg.vendor}</span>
                                    <div className="flex items-center gap-0.5 text-yellow-400 text-[8px] md:text-xs">
                                        <FaStar className="fill-current" /> <span className="text-slate-900 font-bold">{pkg.rating}</span>
                                    </div>
                                </div>

                                <h3 className="text-[11px] md:text-base font-black text-slate-800 line-clamp-2 min-h-[30px] md:min-h-[44px]">
                                    {pkg.name}
                                </h3>
                            </div>

                            <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-50">
                                <p className="text-sm md:text-xl font-black text-slate-900">{pkg.discountPrice}</p>
                                <button
                                    onClick={() => handleBookClick(pkg)}
                                    className="bg-[#08B36A] hover:bg-slate-900 text-white font-bold px-4 md:px-6 py-1.5 md:py-2 rounded-lg text-[9px] md:text-[11px] uppercase tracking-widest transition-all active:scale-90"
                                >
                                    Book
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}

export default AllTestsPage;