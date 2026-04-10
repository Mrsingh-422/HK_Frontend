"use client";

import React, { useState, useEffect, useCallback } from "react";
import UserAPI from "@/app/services/UserAPI";
import { 
    FaStar, 
    FaFlask, 
    FaChevronRight, 
    FaChevronLeft, 
    FaVial, 
    FaCheckCircle, 
    FaPrescriptionBottleAlt 
} from "react-icons/fa";
import TestDetailsModal from "./TestDetailsModal";
import { useCart } from "@/app/context/CartContext";

const CATEGORY_IMAGES = {
    Radiology: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2lytqry1YYLSNxtpI-zSkQAtuOmDzscJlcg&s",
    Pathology: "https://www.news-medical.net/images/Article_Images/ImageForArticle_2146_1734704718618352.jpg",
    Default: "https://img.freepik.com/free-photo/medicine-uniform-healthcare-medical-workers-day-concept_185193-108329.jpg?semt=ais_hybrid&w=740&q=80"
};

// --- SKELETON COMPONENT ---
const TestCardSkeleton = () => (
    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden flex flex-col h-full animate-pulse shadow-sm">
        {/* Image Placeholder */}
        <div className="h-40 bg-slate-200 w-full" />
        
        {/* Content Placeholder */}
        <div className="p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-3">
                <div className="h-4 bg-slate-100 rounded-lg w-20" />
                <div className="h-5 bg-slate-50 rounded-lg w-10" />
            </div>

            {/* Title Placeholders */}
            <div className="h-4 bg-slate-200 rounded-md w-full mb-2" />
            <div className="h-4 bg-slate-200 rounded-md w-3/4 mb-4" />

            {/* Info Line Placeholder */}
            <div className="flex items-center gap-3 mb-5">
                <div className="h-3 bg-slate-100 rounded w-16" />
                <div className="w-1 h-3 bg-slate-50" />
                <div className="h-3 bg-slate-100 rounded w-20" />
            </div>

            {/* Footer Placeholder */}
            <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
                <div className="space-y-1.5">
                    <div className="h-2 bg-slate-100 rounded w-12" />
                    <div className="h-6 bg-slate-200 rounded w-20" />
                </div>
                <div className="h-10 bg-slate-200 rounded-2xl w-28" />
            </div>
        </div>
    </div>
);

const AllSingleTestsList = ({ searchTerm = "" }) => {
    const { cartItemIds } = useCart();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTest, setSelectedTest] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 12; // Items per page

    const fetchTests = useCallback(async () => {
        try {
            setLoading(true);
            const response = await UserAPI.getStandardTestCatalog({
                page: currentPage,
                limit: limit,
                search: searchTerm
            });

            if (response.success) {
                setTests(response.data || response.tests || []);
                setTotalPages(response.totalPages || 1);
            }
        } catch (err) {
            console.error("Tests Fetch Error:", err);
            setTests([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        fetchTests();
    }, [fetchTests]);

    const handleCardClick = (test) => {
        setSelectedTest(test);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-transparent space-y-10">
            {/* Details Modal */}
            <TestDetailsModal
                isOpen={!!selectedTest}
                onClose={() => setSelectedTest(null)}
                test={selectedTest}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    // Show 6 skeleton cards while loading
                    Array(6).fill(0).map((_, i) => <TestCardSkeleton key={i} />)
                ) : (
                    tests.map((test) => {
                        const isAdded = cartItemIds.includes(test._id);
                        const displayPrice = test.offerPrice || test.minPrice || test.mrp || test.standardMRP;
                        const strikePrice = test.standardMRP || test.mrp;
                        const testImage = CATEGORY_IMAGES[test.mainCategory] || CATEGORY_IMAGES.Default;

                        return (
                            <div
                                key={test._id}
                                onClick={() => handleCardClick(test)}
                                className="group relative bg-white rounded-[2rem] border border-slate-100 hover:border-emerald-500/30 hover:shadow-[0_20px_50px_rgba(8,179,106,0.12)] transition-all duration-500 flex flex-col overflow-hidden cursor-pointer"
                            >
                                {/* Category Badge */}
                                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm flex items-center gap-2 border border-slate-100">
                                    <FaVial className="text-emerald-500 text-[10px]" />
                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">
                                        {test.mainCategory || 'Diagnostic'}
                                    </span>
                                </div>

                                {/* Image Section */}
                                <div className="relative h-40 w-full overflow-hidden">
                                    <img
                                        src={testImage}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        alt={test.testName}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                    
                                    {strikePrice > displayPrice && (
                                        <div className="absolute bottom-4 right-4 bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                                            SAVE {Math.round(((strikePrice - displayPrice) / strikePrice) * 100)}%
                                        </div>
                                    )}
                                </div>

                                {/* Content Section */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-lg">
                                            <FaCheckCircle className="text-blue-500 text-[10px]" />
                                            <span className="text-[10px] font-bold text-blue-600 uppercase">Verified</span>
                                        </div>
                                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                                            <FaStar className="text-amber-400 text-[10px]" />
                                            <span className="text-slate-700 font-bold text-[10px]">4.8</span>
                                        </div>
                                    </div>

                                    <h3 className="text-base font-bold text-slate-800 line-clamp-2 h-12 leading-tight mb-4 group-hover:text-emerald-600 transition-colors">
                                        {test.testName}
                                    </h3>

                                    <div className="flex items-center gap-4 mb-5">
                                        <div className="flex items-center gap-1.5">
                                            <FaFlask className="text-emerald-500 text-xs" />
                                            <span className="text-xs font-medium text-slate-500">{test.sampleType || 'Blood'}</span>
                                        </div>
                                        <div className="w-px h-3 bg-slate-200" />
                                        <span className="text-xs font-medium text-slate-500">Fast Reports</span>
                                    </div>

                                    {/* Footer: Price & Action */}
                                    <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Test Price</p>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-xl font-black text-slate-900">₹{displayPrice}</span>
                                                {strikePrice > displayPrice && (
                                                    <span className="text-xs text-slate-300 line-through font-medium">₹{strikePrice}</span>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCardClick(test);
                                            }}
                                            className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all duration-300 shadow-md active:scale-95 ${
                                                isAdded 
                                                ? "bg-slate-100 text-slate-500 cursor-default" 
                                                : "bg-emerald-600 text-white hover:bg-slate-900 shadow-emerald-200"
                                            }`}
                                        >
                                            {isAdded ? "Selected" : "Book Now"}
                                            {!isAdded && <FaChevronRight size={10} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && !loading && (
                <div className="flex justify-center items-center gap-2 pt-8">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-3 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                    >
                        <FaChevronLeft className="text-slate-600 text-xs" />
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        if (totalPages > 5 && Math.abs(pageNum - currentPage) > 2) return null;

                        return (
                            <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                                    currentPage === pageNum
                                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-3 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                    >
                        <FaChevronRight className="text-slate-600 text-xs" />
                    </button>
                </div>
            )}

            {/* Empty State */}
            {tests.length === 0 && !loading && (
                <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 mx-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <FaPrescriptionBottleAlt size={24} className="text-slate-300" />
                    </div>
                    <h3 className="text-slate-800 font-bold text-lg">No tests found</h3>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto">Try searching for a different health parameter or category.</p>
                </div>
            )}
        </div>
    );
};

export default AllSingleTestsList;