"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation"; // 1. Import useRouter
import UserAPI from "@/app/services/UserAPI";
import {
    FaStar,
    FaChevronRight,
    FaChevronLeft,
    FaVial,
    FaCheckCircle,
    FaPrescriptionBottleAlt,
    FaArrowRight,
} from "react-icons/fa";
import { useCart } from "@/app/context/CartContext";

const CATEGORY_IMAGES = {
    Radiology: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0QRZMC23aP3XMiUiumX_ynR1rRgQoNPDTmg&s",
    Pathology: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwlrnKrrE9AQMVWZedivnzySwDvwXueGMHQQ&s",
    Default: "https://img.freepik.com/free-photo/medicine-uniform-healthcare-medical-workers-day-concept_185193-108329.jpg?semt=ais_hybrid&w=740&q=80"
};

// --- PROFESSIONAL SKELETON ---
const TestCardSkeleton = () => (
    <div className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse h-[340px] flex flex-col">
        <div className="h-32 bg-slate-50 rounded-lg mb-4" />
        <div className="space-y-3 flex-1">
            <div className="h-3 bg-slate-100 rounded w-1/4" />
            <div className="h-5 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-50 rounded w-1/2 mt-4" />
        </div>
        <div className="h-10 bg-slate-100 rounded-lg w-full mt-4" />
    </div>
);

const AllSingleTestsList = ({ searchTerm = "", selectedLabId = null }) => {
    const router = useRouter(); // 2. Initialize router
    const { cartItemIds } = useCart();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 12;

    const fetchTests = useCallback(async () => {
        try {
            setLoading(true);
            const response = await UserAPI.getStandardTestCatalog({
                page: currentPage,
                limit: limit,
                search: searchTerm,
                labId: selectedLabId
            });

            if (response.success) {
                const data = response.data || response.tests || [];
                setTests(data);
                setTotalPages(response.totalPages || 1);
            }
        } catch (err) {
            console.error("Tests Fetch Error:", err);
            setTests([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, selectedLabId]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedLabId]);

    useEffect(() => {
        fetchTests();
    }, [fetchTests]);

    // 3. Update navigation function
    const handleCardClick = (testId) => {
        router.push(`/booklabtest/testdetails/${testId}`);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            const element = document.getElementById("tests-grid-top");
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    return (
        <div className="space-y-10" id="tests-grid-top">
            {/* Modal removed as it's no longer needed here */}

            {/* Professional Compact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {loading ? (
                    Array(8).fill(0).map((_, i) => <TestCardSkeleton key={i} />)
                ) : (
                    tests.map((test) => {
                        const isAdded = cartItemIds.includes(test._id);
                        const displayPrice = test.offerPrice || test.minPrice || test.mrp || test.standardMRP;
                        const strikePrice = test.standardMRP || test.mrp;
                        const testImage = CATEGORY_IMAGES[test.mainCategory] || CATEGORY_IMAGES.Default;

                        return (
                            <div
                                key={test._id}
                                onClick={() => handleCardClick(test._id)} // Navigate on click
                                className="group bg-white rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
                            >
                                {/* Professional Thumbnail */}
                                <div className="relative h-32 w-full overflow-hidden bg-slate-50 border-b border-slate-100">
                                    <img
                                        src={testImage}
                                        className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                                        alt={test.testName}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = CATEGORY_IMAGES.Default;
                                        }}
                                    />
                                    {strikePrice > displayPrice && (
                                        <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                                            {Math.round(((strikePrice - displayPrice) / strikePrice) * 100)}% OFF
                                        </div>
                                    )}
                                </div>

                                {/* Test Details */}
                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            {test.mainCategory || 'Diagnostic'}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <FaStar className="text-amber-400" size={9} />
                                            <span className="text-[10px] font-bold text-slate-600">4.8</span>
                                        </div>
                                    </div>

                                    <h3 className="text-[13px] font-bold text-slate-900 line-clamp-2 h-9 mb-3 leading-snug group-hover:text-emerald-600 transition-colors">
                                        {test.testName}
                                    </h3>

                                    <div className="space-y-1.5 mb-4">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <FaVial size={10} className="text-slate-400" />
                                            <span className="text-[11px] font-medium truncate">{test.sampleType || 'Blood Sample'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <FaCheckCircle size={10} className="text-emerald-500" />
                                            <span className="text-[11px] font-medium">NABL Accredited</span>
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            {strikePrice > displayPrice && (
                                                <span className="text-[9px] text-slate-400 line-through">₹{strikePrice}</span>
                                            )}
                                            <span className="text-base font-bold text-slate-900">₹{displayPrice}</span>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCardClick(test._id);
                                            }}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${isAdded
                                                ? "bg-slate-50 text-slate-400 border border-slate-200"
                                                : "bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-600 hover:text-white"
                                                }`}
                                        >
                                            {isAdded ? "Added" : "Book Now"}
                                            {!isAdded && <FaArrowRight size={9} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && !loading && (
                <div className="flex justify-center items-center gap-6 py-8 border-t border-slate-100">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 text-[11px] font-bold text-slate-500 hover:text-emerald-600 disabled:opacity-30 transition-colors"
                    >
                        <FaChevronLeft size={9} /> Previous
                    </button>

                    <div className="flex items-center gap-1.5">
                        {[...Array(totalPages)].map((_, i) => {
                            const p = i + 1;
                            if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                                return (
                                    <button
                                        key={p}
                                        onClick={() => handlePageChange(p)}
                                        className={`w-7 h-7 rounded-md text-[11px] font-bold transition-all ${currentPage === p
                                            ? "bg-slate-900 text-white shadow-sm"
                                            : "text-slate-500 hover:bg-slate-100"}`}
                                    >
                                        {p}
                                    </button>
                                );
                            }
                            if (p === currentPage - 2 || p === currentPage + 2) return <span key={p} className="text-slate-300 px-1 text-[11px]">...</span>;
                            return null;
                        })}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 text-[11px] font-bold text-slate-500 hover:text-emerald-600 disabled:opacity-30 transition-colors"
                    >
                        Next <FaChevronRight size={9} />
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!loading && tests.length === 0 && (
                <div className="text-center py-20 border border-slate-200 rounded-xl bg-white">
                    <div className="bg-slate-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaPrescriptionBottleAlt className="text-slate-300" size={20} />
                    </div>
                    <h3 className="text-slate-900 font-bold text-sm">No tests found</h3>
                    <p className="text-slate-500 text-[11px] mt-1">Try refining your search or selected lab.</p>
                </div>
            )}
        </div>
    );
};

export default AllSingleTestsList;