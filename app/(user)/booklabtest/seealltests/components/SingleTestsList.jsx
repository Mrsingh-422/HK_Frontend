"use client";

import React, { useState, useEffect, useCallback } from "react";
import UserAPI from "@/app/services/UserAPI";
import {
    FaStar, FaFlask, FaChevronRight, FaVial,
    FaCheckCircle, FaPrescriptionBottleAlt, FaChevronLeft,
    FaExclamationTriangle, FaTrashAlt
} from "react-icons/fa";
import TestDetailsModal from "./otherComponents/TestDetailsModal";
import { useCart } from "@/app/context/CartContext";

const CATEGORY_IMAGES = {
    Radiology: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2lytqry1YYLSNxtpI-zSkQAtuOmDzscJlcg&s",
    Pathology: "https://www.news-medical.net/images/Article_Images/ImageForArticle_2146_1734704718618352.jpg",
    Default: "https://img.freepik.com/free-photo/medicine-uniform-healthcare-medical-workers-day-concept_185193-108329.jpg?semt=ais_hybrid&w=740&q=80"
};

const SingleTestsList = ({ searchTerm = "", selectedLabId = null }) => {
    const { cartItemIds, addItem, removeItem, clearFullCart } = useCart();

    // Data State
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTest, setSelectedTest] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    // Conflict/Clear Cart State
    const [showClearCartModal, setShowClearCartModal] = useState(false);
    const [pendingTest, setPendingTest] = useState(null);
    const [isClearing, setIsClearing] = useState(false);

    const fetchTests = useCallback(async () => {
        try {
            setLoading(true);
            let response;

            if (selectedLabId && selectedLabId !== "undefined") {
                if (searchTerm) {
                    response = await UserAPI.searchLabInventoryTests(selectedLabId, {
                        query: searchTerm,
                        page: currentPage
                    });
                } else {
                    response = await UserAPI.getLabInventoryTests(selectedLabId, {
                        page: currentPage,
                        limit: 12
                    });
                }
            } else {
                response = await UserAPI.getStandardTestCatalog({
                    search: searchTerm,
                    page: currentPage,
                    limit: 12
                });
            }

            if (response.success) {
                setTests(response.data || response.tests || []);
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

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedLabId]);

    useEffect(() => {
        fetchTests();
    }, [fetchTests]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleCartAction = async (test, e) => {
        if (e) e.stopPropagation();
        const isAlreadyAdded = cartItemIds.includes(test._id);

        if (isAlreadyAdded) {
            removeItem(test._id);
        } else {
            const targetLabId = selectedLabId || test.labId || test.minPriceLabId;
            if (!targetLabId) {
                handleCardClick(test);
                return;
            }

            try {
                const result = await addItem(targetLabId, test._id, 'LabTest');

                if (result && result.error && (result.type === 'LAB_MISMATCH' || result.type === 'CATEGORY_MISMATCH')) {
                    setPendingTest(test);
                    setShowClearCartModal(true);
                }
            } catch (error) {
                if (error.message?.includes('different lab') || error.message?.includes('category')) {
                    setPendingTest(test);
                    setShowClearCartModal(true);
                } else {
                    console.error("Add to cart error:", error);
                }
            }
        }
    };

    const handleClearAndAdd = async () => {
        if (!pendingTest) return;
        try {
            setIsClearing(true);
            await clearFullCart();
            const targetLabId = selectedLabId || pendingTest.labId || pendingTest.minPriceLabId;
            await addItem(targetLabId, pendingTest._id, 'LabTest');
            setShowClearCartModal(false);
            setPendingTest(null);
        } catch (error) {
            console.error("Clear and add error:", error);
        } finally {
            setIsClearing(false);
        }
    };

    const handleCardClick = (test) => {
        setSelectedTest(test);
    };

    if (loading) return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-48 md:h-80 bg-slate-50 animate-pulse rounded-2xl md:rounded-[2rem] border border-slate-100" />
            ))}
        </div>
    );

    return (
        <div className="bg-transparent space-y-6 md:space-y-8">
            <TestDetailsModal
                isOpen={!!selectedTest}
                onClose={() => setSelectedTest(null)}
                test={selectedTest}
                onAddToCart={(test) => handleCartAction(test)}
                isAdded={selectedTest && cartItemIds.includes(selectedTest._id)}
            />

            {/* Clear Cart Conflict Modal */}
            {showClearCartModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-rose-50 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6">
                            <FaExclamationTriangle className="text-rose-500 text-xl md:text-2xl" />
                        </div>

                        <h3 className="text-lg md:text-xl font-black text-slate-800 mb-2">Replace Cart Items?</h3>
                        <p className="text-slate-500 text-[12px] md:text-sm leading-relaxed mb-6 md:mb-8">
                            Your cart contains items from a different Lab or Category (Pathology/Radiology).
                            You can only book tests from one lab and one category at a time.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleClearAndAdd}
                                disabled={isClearing}
                                className="w-full py-3 md:py-4 bg-slate-900 hover:bg-rose-600 text-white rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2"
                            >
                                {isClearing ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <FaTrashAlt size={14} />
                                        Clear & Add New
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => { setShowClearCartModal(false); setPendingTest(null); }}
                                disabled={isClearing}
                                className="w-full py-3 md:py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Result Stats */}
            {totalResults > 0 && (
                <div className="flex items-center gap-2 mb-2 px-1 md:px-2">
                    <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Showing {tests.length} of {totalResults} available tests
                    </span>
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {tests.map((test) => {
                    const isAdded = cartItemIds.includes(test._id);
                    const displayPrice = test.discountPrice || test.minPrice || test.amount || test.mrp;
                    const strikePrice = test.amount || test.standardMRP || test.mrp;
                    const category = test.masterTestId?.mainCategory || test.mainCategory || 'Pathology';
                    const testImage = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.Default;

                    return (
                        <div
                            key={test._id}
                            onClick={() => handleCardClick(test)}
                            className="group relative bg-white rounded-2xl md:rounded-[2rem] border border-slate-100 hover:border-emerald-500/30 hover:shadow-[0_20px_50px_rgba(8,179,106,0.12)] transition-all duration-500 flex flex-col overflow-hidden cursor-pointer"
                        >
                            <div className="absolute top-2 md:top-4 left-2 md:left-4 z-10 bg-white/90 backdrop-blur-md px-1.5 md:px-3 py-0.5 md:py-1.5 rounded-lg md:rounded-2xl shadow-sm flex items-center gap-1 md:gap-2 border border-slate-100">
                                <FaVial className="text-emerald-500 text-[8px] md:text-[10px]" />
                                <span className="text-[7px] md:text-[10px] font-black text-slate-700 uppercase tracking-tight">
                                    {category}
                                </span>
                            </div>

                            <div className="relative h-28 sm:h-40 w-full overflow-hidden">
                                <img
                                    src={testImage}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    alt={test.testName}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                                {strikePrice > displayPrice && (
                                    <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 bg-orange-500 text-white text-[7px] md:text-[10px] font-black px-1.5 md:px-3 py-0.5 md:py-1 rounded-full shadow-lg">
                                        -{Math.round(((strikePrice - displayPrice) / strikePrice) * 100)}%
                                    </div>
                                )}
                            </div>

                            <div className="p-3 md:p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2 md:mb-3">
                                    <div className="flex items-center gap-1 bg-blue-50 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md md:rounded-lg">
                                        <FaCheckCircle className="text-blue-500 text-[8px] md:text-[10px]" />
                                        <span className="text-[7px] md:text-[10px] font-bold text-blue-600 uppercase">Verified</span>
                                    </div>
                                    <div className="flex items-center gap-0.5 md:gap-1 bg-amber-50 px-1 md:px-2 py-0.5 md:py-1 rounded-md md:rounded-lg border border-amber-100">
                                        <FaStar className="text-amber-400 text-[8px] md:text-[10px]" />
                                        <span className="text-slate-700 font-bold text-[8px] md:text-[10px]">4.8</span>
                                    </div>
                                </div>

                                <h3 className="text-[11px] md:text-base font-bold text-slate-800 line-clamp-2 h-8 md:h-12 leading-tight mb-2 md:mb-4 group-hover:text-emerald-600 transition-colors">
                                    {test.testName}
                                </h3>

                                <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-3 md:mb-5">
                                    <div className="flex items-center gap-1 md:gap-1.5">
                                        <FaFlask className="text-emerald-500 text-[10px] md:text-xs" />
                                        <span className="text-[9px] md:text-xs font-medium text-slate-500">{test.sampleType || 'Blood'}</span>
                                    </div>
                                    <div className="hidden sm:block w-px h-3 bg-slate-200" />
                                    <span className="text-[9px] md:text-xs font-medium text-slate-500">{test.reportTime || '24'}h</span>
                                </div>

                                <div className="mt-auto pt-3 md:pt-5 border-t border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-4">
                                    <div>
                                        <div className="flex items-baseline gap-1 md:gap-1.5">
                                            <span className="text-lg md:text-xl font-black text-slate-900">₹{displayPrice}</span>
                                            {strikePrice > displayPrice && (
                                                <span className="text-[9px] md:text-xs text-slate-300 line-through font-medium">₹{strikePrice}</span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => handleCartAction(test, e)}
                                        className={`w-full sm:w-auto px-3 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl font-bold text-[9px] md:text-xs flex items-center justify-center gap-1.5 md:gap-2 transition-all duration-300 shadow-md active:scale-95 ${isAdded
                                            ? "bg-rose-50 text-rose-500 hover:bg-rose-100"
                                            : "bg-emerald-600 text-white hover:bg-slate-900 shadow-emerald-200"
                                            }`}
                                    >
                                        {isAdded ? "Remove" : "Book"}
                                        {!isAdded && <FaChevronRight size={8} className="md:size-[10px]" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1.5 md:gap-2 pt-6 md:pt-8">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 md:p-3 rounded-lg md:rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                    >
                        <FaChevronLeft className="text-slate-600 text-[10px] md:text-xs" />
                    </button>

                    {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        if (totalPages > 5 && Math.abs(pageNum - currentPage) > 1) {
                             if (pageNum === 1 || pageNum === totalPages) return <span key={pageNum} className="text-slate-300">...</span>;
                             return null;
                        }

                        return (
                            <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition-all ${currentPage === pageNum
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
                        className="p-2 md:p-3 rounded-lg md:rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                    >
                        <FaChevronRight className="text-slate-600 text-[10px] md:text-xs" />
                    </button>
                </div>
            )}

            {/* Empty State */}
            {tests.length === 0 && !loading && (
                <div className="text-center py-16 md:py-24 bg-slate-50 rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-slate-200 mx-2 md:mx-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <FaPrescriptionBottleAlt size={24} className="text-slate-300" />
                    </div>
                    <h3 className="text-slate-800 font-bold text-sm md:text-lg">No tests found</h3>
                    <p className="text-slate-400 text-[10px] md:text-sm max-w-xs mx-auto">We couldn't find any tests matching your search criteria for this lab.</p>
                </div>
            )}
        </div>
    );
};

export default SingleTestsList;