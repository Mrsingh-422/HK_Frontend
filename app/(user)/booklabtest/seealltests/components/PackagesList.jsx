"use client";

import React, { useEffect, useState, useCallback } from "react";
import { FaStar, FaFlask, FaChevronRight, FaClinicMedical, FaCheckCircle, FaChevronLeft } from "react-icons/fa";
import PackageDetailsModal from "./otherComponents/PackageDetailsModal";
import UserAPI from "@/app/services/UserAPI";
import { useCart } from "@/app/context/CartContext";

// Fallback image URL for medical/lab packages
const FALLBACK_IMAGE = "https://www.pathofast.com/images/packages/cro/renamed/hero/full-body-health-checkup-vitamins-and-screening-tests.png";

function PackagesList({ searchTerm = "", selectedLabId = null }) {
    const { cartItemIds } = useCart();
    
    // Data State
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const fetchPackages = useCallback(async () => {
        try {
            setLoading(true);
            let response;

            // Logic to determine which API to call based on selectedLabId
            if (selectedLabId && selectedLabId !== "undefined") {
                if (searchTerm) {
                    // Search within a specific lab's inventory
                    response = await UserAPI.searchLabInventoryPackages(selectedLabId, { 
                        query: searchTerm,
                        page: currentPage 
                    });
                } else {
                    // Fetch full inventory for a specific lab
                    response = await UserAPI.getLabInventoryPackages(selectedLabId, { 
                        page: currentPage,
                        limit: 12 
                    });
                }
            } else {
                // Global Discovery (Standard Packages)
                response = await UserAPI.getStandardPackageCatalog({
                    search: searchTerm,
                    page: currentPage,
                    limit: 12
                });
            }

            if (response.success) {
                // Mapping the response keys (data or packages depending on endpoint)
                setPackages(response.data || response.packages || []);
                
                // Pagination mapping from backend response
                setTotalPages(response.pages || response.totalPages || 1);
                setTotalResults(response.total || 0);
                
                // Sync current page if backend sends it
                if (response.page) {
                    setCurrentPage(response.page);
                }
            }
        } catch (err) {
            console.error("Packages Fetch Error:", err);
            setPackages([]);
            setTotalResults(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [selectedLabId, searchTerm, currentPage]);

    // Reset to page 1 whenever search or lab filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedLabId]);

    // Fetch data when page or filters change
    useEffect(() => {
        fetchPackages();
    }, [fetchPackages]);

    const handleCardClick = (pkg) => {
        setSelectedPackage(pkg);
        setIsModalOpen(true);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            // Scroll to the top of the results section
            window.scrollTo({ top: 200, behavior: 'smooth' });
        }
    };

    if (loading) return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-48 md:h-80 bg-slate-50 animate-pulse rounded-2xl md:rounded-[2rem] border border-slate-100" />
            ))}
        </div>
    );

    return (
        <div className="bg-transparent space-y-6 md:space-y-10">
            <PackageDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                pkg={selectedPackage}
            />

            {/* Total Results Counter */}
            {totalResults > 0 && (
                <div className="flex items-center gap-2 mb-2 px-1">
                    <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Showing {packages.length} of {totalResults} packages
                    </span>
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {packages.map((pkg) => {
                    const isAdded = cartItemIds.includes(pkg._id);
                    
                    // NORMALIZE PRICING FOR BOTH APIS
                    const displayPrice = pkg.discountPrice ?? pkg.offerPrice ?? pkg.minPrice ?? pkg.amount;
                    const strikePrice = pkg.amount ?? pkg.mrp ?? pkg.standardMRP;

                    // NORMALIZE NAMES & PARAMETERS COUNT
                    const displayName = pkg.testName || pkg.packageName;
                    const testCount = pkg.masterTestId?.parameters?.length || pkg.testCount || pkg.totalTestsIncluded || 1;

                    // NORMALIZE IMAGE
                    const imageSrc = pkg.image && pkg.image !== "" ? pkg.image : FALLBACK_IMAGE;

                    return (
                        <div
                            key={pkg._id}
                            onClick={() => handleCardClick(pkg)}
                            className="group relative bg-white rounded-[1.25rem] md:rounded-[2rem] border border-slate-100 hover:border-emerald-500/30 hover:shadow-[0_20px_50px_rgba(8,179,106,0.12)] transition-all duration-500 flex flex-col overflow-hidden cursor-pointer"
                        >
                            {/* Labs Count Badge */}
                            {!selectedLabId && pkg.vendorCount > 0 && (
                                <div className="absolute top-2 md:top-4 left-2 md:left-4 z-10 bg-white/90 backdrop-blur-md px-1.5 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-2xl shadow-sm flex items-center gap-1 md:gap-2 border border-slate-100">
                                    <FaClinicMedical className="text-emerald-500 text-[8px] md:text-xs" />
                                    <span className="text-[7px] md:text-[10px] font-black text-slate-700 uppercase tracking-tight">
                                        {pkg.vendorCount} Labs
                                    </span>
                                </div>
                            )}

                            {/* Image Section */}
                            <div className="relative h-28 sm:h-36 md:h-48 w-full overflow-hidden bg-slate-100">
                                <img
                                    src={imageSrc}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    alt={displayName}
                                    onError={(e) => {
                                        e.target.src = FALLBACK_IMAGE; 
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                                {strikePrice > displayPrice && (
                                    <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 bg-orange-500 text-white text-[7px] md:text-[10px] font-black px-1.5 md:px-3 py-0.5 md:py-1 rounded-full shadow-lg">
                                        -{Math.round(((strikePrice - displayPrice) / strikePrice) * 100)}%
                                    </div>
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="p-3 md:p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2 md:mb-3">
                                    <span className="text-[7px] md:text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-md md:rounded-lg uppercase tracking-wider">
                                        {pkg.mainCategory || pkg.category || 'Wellness'}
                                    </span>
                                    <div className="flex items-center gap-1 bg-amber-50 px-1 md:px-2 py-0.5 md:py-1 rounded-md md:rounded-lg border border-amber-100">
                                        <FaStar className="text-amber-400 text-[8px] md:text-[10px]" />
                                        <span className="text-slate-700 font-bold text-[8px] md:text-[10px]">4.9</span>
                                    </div>
                                </div>

                                <h3 className="text-xs md:text-lg font-bold text-slate-800 line-clamp-2 h-8 md:h-14 leading-tight mb-2 md:mb-4 group-hover:text-emerald-600 transition-colors">
                                    {displayName}
                                </h3>

                                <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-3 md:mb-6">
                                    <div className="flex items-center gap-1 md:gap-1.5">
                                        <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-slate-50 flex items-center justify-center">
                                            <FaFlask className="text-emerald-500 text-[8px] md:text-[10px]" />
                                        </div>
                                        <span className="text-[9px] md:text-xs font-medium text-slate-500">
                                            {testCount} Tests
                                        </span>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-1.5">
                                        <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center">
                                            <FaCheckCircle className="text-blue-500 text-[10px]" />
                                        </div>
                                        <span className="text-xs font-medium text-slate-500">Verified</span>
                                    </div>
                                </div>

                                {/* Pricing & Action */}
                                <div className="mt-auto pt-3 md:pt-5 border-t border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-4">
                                    <div className="flex flex-col">
                                        <div className="flex items-baseline gap-1 md:gap-1.5">
                                            <span className="text-lg md:text-2xl font-black text-slate-900">₹{displayPrice}</span>
                                            {strikePrice > displayPrice && (
                                                <span className="text-[9px] md:text-xs text-slate-300 line-through font-medium">₹{strikePrice}</span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCardClick(pkg);
                                        }}
                                        className={`w-full sm:w-auto px-3 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-bold text-[9px] md:text-xs flex items-center justify-center gap-1 md:gap-2 transition-all duration-300 shadow-md active:scale-95 ${
                                            isAdded 
                                            ? "bg-slate-100 text-slate-400 cursor-default" 
                                            : "bg-emerald-600 text-white hover:bg-slate-900 shadow-emerald-200"
                                        }`}
                                    >
                                        {isAdded ? "In Cart" : "Book"}
                                        {!isAdded && <FaChevronRight size={8} className="md:size-[10px]" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1.5 md:gap-2 pt-4 md:pt-8">
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
                                className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition-all ${
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
                        className="p-2 md:p-3 rounded-lg md:rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                    >
                        <FaChevronRight className="text-slate-600 text-[10px] md:text-xs" />
                    </button>
                </div>
            )}

            {/* Empty State */}
            {packages.length === 0 && !loading && (
                <div className="text-center py-16 md:py-24 bg-slate-50 rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-slate-200 mx-2 md:mx-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <FaFlask className="text-slate-300 text-base md:text-xl" />
                    </div>
                    <h3 className="text-slate-800 font-bold text-sm md:text-lg">No packages found</h3>
                    <p className="text-slate-400 text-[10px] md:text-sm max-w-xs mx-auto">Try searching for something else or check another laboratory.</p>
                </div>
            )}
        </div>
    );
}

export default PackagesList;