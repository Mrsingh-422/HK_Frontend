"use client";

import React, { useState, useEffect, useCallback } from "react";
import UserAPI from "@/app/services/UserAPI";
import { 
    FaStar, FaFlask, FaChevronRight, FaVial, 
    FaCheckCircle, FaPrescriptionBottleAlt, FaChevronLeft 
} from "react-icons/fa";
import TestDetailsModal from "./otherComponents/TestDetailsModal";
import { useCart } from "@/app/context/CartContext";

const CATEGORY_IMAGES = {
    Radiology: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2lytqry1YYLSNxtpI-zSkQAtuOmDzscJlcg&s",
    Pathology: "https://www.news-medical.net/images/Article_Images/ImageForArticle_2146_1734704718618352.jpg",
    Default: "https://img.freepik.com/free-photo/medicine-uniform-healthcare-medical-workers-day-concept_185193-108329.jpg?semt=ais_hybrid&w=740&q=80"
};

const SingleTestsList = ({ searchTerm = "", selectedLabId = null }) => {
    const { cartItemIds, addItem, removeItem } = useCart();
    
    // Data State
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTest, setSelectedTest] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const fetchTests = useCallback(async () => {
        try {
            setLoading(true);
            let response;

            // Logic to determine which API to call
            if (selectedLabId && selectedLabId !== "undefined") {
                if (searchTerm) {
                    // 1. Search within a specific lab's inventory
                    response = await UserAPI.searchLabInventoryTests(selectedLabId, { 
                        query: searchTerm,
                        page: currentPage 
                    });
                } else {
                    // 2. Fetch full inventory for a specific lab (Paginated)
                    response = await UserAPI.getLabInventoryTests(selectedLabId, { 
                        page: currentPage,
                        limit: 12 
                    });
                }
            } else {
                // 3. Global Discovery (Standard Catalog)
                response = await UserAPI.getStandardTestCatalog({
                    search: searchTerm,
                    page: currentPage,
                    limit: 12
                });
            }

            if (response.success) {
                // Based on your JSON, inventory results are in 'data'
                setTests(response.data || response.tests || []);
                
                // Pagination mapping
                setTotalPages(response.pages || response.totalPages || 1);
                setTotalResults(response.total || 0);
            }
        } catch (err) {
            console.error("Tests Fetch Error:", err);
            setTests([]);
        } finally {
            setLoading(false);
        }
    }, [selectedLabId, searchTerm, currentPage]);

    // Reset to page 1 whenever search or lab filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedLabId]);

    // Fetch data when filters or page change
    useEffect(() => {
        fetchTests();
    }, [fetchTests]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleCartAction = (test, e) => {
        if (e) e.stopPropagation();
        const isAlreadyAdded = cartItemIds.includes(test._id);

        if (isAlreadyAdded) {
            removeItem(test._id);
        } else {
            // Priority: Use selectedLabId if viewing a specific lab, else fallback to test data
            const targetLabId = selectedLabId || test.labId || test.minPriceLabId;
            if (!targetLabId) {
                handleCardClick(test);
                return;
            }
            addItem(targetLabId, test._id, 'LabTest');
        }
    };

    const handleCardClick = (test) => {
        setSelectedTest(test);
    };

    if (loading) return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-80 bg-slate-50 animate-pulse rounded-[2rem] border border-slate-100" />
            ))}
        </div>
    );

    return (
        <div className="bg-transparent space-y-8">
            <TestDetailsModal
                isOpen={!!selectedTest}
                onClose={() => setSelectedTest(null)}
                test={selectedTest}
                onAddToCart={(test) => handleCartAction(test)}
                isAdded={selectedTest && cartItemIds.includes(selectedTest._id)}
            />

            {/* Result Stats */}
            {totalResults > 0 && (
                <div className="flex items-center gap-2 mb-2 px-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Showing {tests.length} of {totalResults} available tests
                    </span>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tests.map((test) => {
                    const isAdded = cartItemIds.includes(test._id);
                    
                    // Price Logic: inventory uses discountPrice/amount, catalog uses minPrice/mrp
                    const displayPrice = test.discountPrice || test.minPrice || test.amount || test.mrp;
                    const strikePrice = test.amount || test.standardMRP || test.mrp;
                    
                    // Image Logic: Use master data category or default
                    const category = test.masterTestId?.mainCategory || test.mainCategory || 'Pathology';
                    const testImage = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.Default;

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
                                    {category}
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
                                    <span className="text-xs font-medium text-slate-500">Reports in {test.reportTime || '24'}h</span>
                                </div>

                                {/* Pricing & Action */}
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
                                        onClick={(e) => handleCartAction(test, e)}
                                        className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all duration-300 shadow-md active:scale-95 ${
                                            isAdded 
                                            ? "bg-rose-50 text-rose-500 hover:bg-rose-100" 
                                            : "bg-emerald-600 text-white hover:bg-slate-900 shadow-emerald-200"
                                        }`}
                                    >
                                        {isAdded ? "Remove" : "Book Now"}
                                        {!isAdded && <FaChevronRight size={10} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
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
                    <p className="text-slate-400 text-sm max-w-xs mx-auto">We couldn't find any tests matching your search criteria for this lab.</p>
                </div>
            )}
        </div>
    );
};

export default SingleTestsList;