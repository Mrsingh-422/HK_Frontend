"use client";

import React, { useEffect, useState, useCallback } from "react";
import { FaStar, FaFlask, FaChevronRight, FaClinicMedical, FaCheckCircle, FaChevronLeft } from "react-icons/fa";
import PackageDetailsModal from "./PackageDetailsModal";
import UserAPI from "@/app/services/UserAPI";
import { useCart } from "@/app/context/CartContext";

// Fallback image URL for medical packages
const FALLBACK_IMAGE = "https://www.pathofast.com/images/packages/cro/renamed/hero/full-body-health-checkup-vitamins-and-screening-tests.png";

// --- SKELETON COMPONENT ---
const PackageCardSkeleton = () => (
    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden flex flex-col h-full animate-pulse shadow-sm">
        {/* Image Placeholder */}
        <div className="h-48 bg-slate-200 w-full" />

        {/* Content Placeholder */}
        <div className="p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-3">
                <div className="h-4 bg-slate-100 rounded-lg w-24" />
                <div className="h-6 bg-slate-50 rounded-lg w-12" />
            </div>

            {/* Title Placeholders */}
            <div className="h-5 bg-slate-200 rounded-md w-full mb-2" />
            <div className="h-5 bg-slate-200 rounded-md w-2/3 mb-4" />

            {/* Info Badges Placeholders */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100" />
                    <div className="h-3 bg-slate-100 rounded w-12" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100" />
                    <div className="h-3 bg-slate-100 rounded w-12" />
                </div>
            </div>

            {/* Pricing & Button Placeholder */}
            <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-2 bg-slate-100 rounded w-16" />
                    <div className="h-6 bg-slate-200 rounded w-24" />
                </div>
                <div className="h-12 bg-slate-200 rounded-2xl w-32" />
            </div>
        </div>
    </div>
);

function AllPackagesList({ searchTerm = "" }) {
    const { cartItemIds } = useCart();
    const [packages, setPackages] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 12; // Items per page

    const fetchPackages = useCallback(async () => {
        try {
            setLoading(true);
            const response = await UserAPI.getStandardPackageCatalog({
                page: currentPage,
                limit: limit,
                search: searchTerm
            });

            if (response.success) {
                setPackages(response.data || []);
                setTotalPages(response.totalPages || 1);
            }
        } catch (err) {
            console.error("Packages Fetch Error:", err);
            setPackages([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm]);

    // Reset to page 1 when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Fetch data when page or search term changes
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
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-transparent space-y-10">
            <PackageDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                pkg={selectedPackage}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    // Render 6 skeleton cards while loading
                    Array(6).fill(0).map((_, i) => <PackageCardSkeleton key={i} />)
                ) : (
                    packages.map((pkg) => {
                        const isAdded = cartItemIds.includes(pkg._id);
                        const displayPrice = pkg.offerPrice || pkg.minPrice || pkg.mrp;
                        const strikePrice = pkg.mrp || pkg.standardMRP;
                        const imageSrc = pkg.image && pkg.image !== "" ? pkg.image : FALLBACK_IMAGE;

                        return (
                            <div
                                key={pkg._id}
                                onClick={() => handleCardClick(pkg)}
                                className="group relative bg-white rounded-[2rem] border border-slate-100 hover:border-emerald-500/30 hover:shadow-[0_20px_50px_rgba(8,179,106,0.12)] transition-all duration-500 flex flex-col overflow-hidden cursor-pointer"
                            >
                                {/* Labs Count Badge */}
                                {pkg.vendorCount > 0 && (
                                    <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm flex items-center gap-2 border border-slate-100">
                                        <FaClinicMedical className="text-emerald-500 text-xs" />
                                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">
                                            {pkg.vendorCount} Labs Available
                                        </span>
                                    </div>
                                )}

                                {/* Image Section */}
                                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                                    <img
                                        src={imageSrc}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        alt={pkg.packageName}
                                        onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
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
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                            {pkg.mainCategory || pkg.category || 'Wellness'}
                                        </span>
                                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                                            <FaStar className="text-amber-400 text-[10px]" />
                                            <span className="text-slate-700 font-bold text-[10px]">4.8</span>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-800 line-clamp-2 h-14 leading-tight mb-4 group-hover:text-emerald-600 transition-colors">
                                        {pkg.packageName}
                                    </h3>

                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center">
                                                <FaFlask className="text-emerald-500 text-[10px]" />
                                            </div>
                                            <span className="text-xs font-medium text-slate-500">{pkg.testCount || pkg.tests?.length || 0} Tests</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center">
                                                <FaCheckCircle className="text-blue-500 text-[10px]" />
                                            </div>
                                            <span className="text-xs font-medium text-slate-500">Verified</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Price Starts From</p>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-2xl font-black text-slate-900">₹{displayPrice}</span>
                                                {strikePrice > displayPrice && (
                                                    <span className="text-xs text-slate-300 line-through font-medium">₹{strikePrice}</span>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCardClick(pkg);
                                            }}
                                            className={`px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all duration-300 shadow-md active:scale-95 ${isAdded
                                                ? "bg-slate-100 text-slate-500 cursor-default"
                                                : "bg-emerald-600 text-white hover:bg-slate-900 shadow-emerald-200"
                                                }`}
                                        >
                                            {isAdded ? "In Cart" : "Book Now"}
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
                                className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${currentPage === pageNum
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
            {packages.length === 0 && !loading && (
                <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 mx-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <FaFlask className="text-slate-300 text-xl" />
                    </div>
                    <h3 className="text-slate-800 font-bold text-lg">No packages found</h3>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto">Try searching for something else or browse different categories.</p>
                </div>
            )}
        </div>
    );
}

export default AllPackagesList;