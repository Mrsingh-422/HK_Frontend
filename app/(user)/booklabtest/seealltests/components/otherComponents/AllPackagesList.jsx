"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation"; // Added for navigation
import { 
    FaStar, 
    FaFlask, 
    FaChevronRight, 
    FaClinicMedical, 
    FaChevronLeft, 
    FaShieldAlt,
    FaArrowRight
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";
import { useCart } from "@/app/context/CartContext";

// Professional Medical Fallback Image
const FALLBACK_IMAGE = "https://eu-images.contentstack.com/v3/assets/blta023acee29658dfc/blt9c34ecdceb81dbfb/651a7809eb58cafed2dd6951/COVID-19-testing-kit-Alamy-2G606ND-ftd.jpg?width=1280&auto=webp&quality=80&disable=upscale";

// --- PROFESSIONAL SKELETON ---
const PackageCardSkeleton = () => (
    <div className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse h-[360px] flex flex-col">
        <div className="h-32 bg-slate-100 rounded-lg mb-4" />
        <div className="space-y-3 flex-1">
            <div className="h-4 bg-slate-100 rounded w-1/4" />
            <div className="h-5 bg-slate-100 rounded w-full" />
            <div className="h-5 bg-slate-100 rounded w-3/4" />
            <div className="h-3 bg-slate-50 rounded w-1/2 mt-4" />
        </div>
        <div className="h-10 bg-slate-100 rounded-lg w-full mt-4" />
    </div>
);

function AllPackagesList({ searchTerm = "", selectedLabId = null }) {
    const router = useRouter(); // Initialize router
    const { cartItemIds } = useCart();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 12;

    const fetchPackages = useCallback(async () => {
        try {
            setLoading(true);
            const response = await UserAPI.getStandardPackageCatalog({
                page: currentPage,
                limit: limit,
                search: searchTerm,
                labId: selectedLabId
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
    }, [currentPage, searchTerm, selectedLabId]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedLabId]);

    useEffect(() => {
        fetchPackages();
    }, [fetchPackages]);

    // Update: Now handles navigation instead of opening a modal
    const handleNavigate = (pkgId) => {
        router.push(`/booklabtest/packagedetails/${pkgId}`);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 400, behavior: 'smooth' });
        }
    };

    return (
        <div className="space-y-10">
            {/* Simple Grid - Clean Spacing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {loading ? (
                    Array(8).fill(0).map((_, i) => <PackageCardSkeleton key={i} />)
                ) : (
                    packages.map((pkg) => {
                        const isAdded = cartItemIds.includes(pkg._id);
                        const displayPrice = pkg.offerPrice || pkg.minPrice || pkg.mrp;
                        const strikePrice = pkg.mrp || pkg.standardMRP;
                        const imageSrc = pkg.image && pkg.image.trim() !== "" ? pkg.image : FALLBACK_IMAGE;

                        return (
                            <div
                                key={pkg._id}
                                onClick={() => handleNavigate(pkg._id)}
                                className="group bg-white rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
                            >
                                {/* Thumbnail */}
                                <div className="relative h-36 w-full overflow-hidden bg-slate-50 border-b border-slate-100">
                                    <img
                                        src={imageSrc}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        alt={pkg.packageName}
                                        onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                                    />
                                    {strikePrice > displayPrice && (
                                        <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                                            {Math.round(((strikePrice - displayPrice) / strikePrice) * 100)}% OFF
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            {pkg.mainCategory || 'Diagnostics'}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <FaStar className="text-amber-400" size={10} />
                                            <span className="text-[11px] font-bold text-slate-600">4.8</span>
                                        </div>
                                    </div>

                                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 h-10 mb-3">
                                        {pkg.packageName}
                                    </h3>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <FaFlask size={11} className="text-slate-400" />
                                            <span className="text-[11px] font-medium">{pkg.totalTestsIncluded || pkg.tests?.length || 0} Parameters</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <FaClinicMedical size={11} className="text-slate-400" />
                                            <span className="text-[11px] font-medium">{pkg.vendorCount || 0} Labs available</span>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            {strikePrice > displayPrice && (
                                                <span className="text-[10px] text-slate-400 line-through">₹{strikePrice}</span>
                                            )}
                                            <span className="text-lg font-bold text-slate-900">₹{displayPrice}</span>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleNavigate(pkg._id);
                                            }}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${isAdded
                                                ? "bg-slate-100 text-slate-500 border border-slate-200"
                                                : "bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-600 hover:text-white"
                                            }`}
                                        >
                                            {isAdded ? "In Cart" : "View Details"}
                                            {!isAdded && <FaArrowRight size={10} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Professional Pagination */}
            {totalPages > 1 && !loading && (
                <div className="flex justify-center items-center gap-6 py-8 border-t border-slate-100">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 disabled:opacity-30 transition-colors"
                    >
                        <FaChevronLeft size={10} /> Previous
                    </button>

                    <div className="flex items-center gap-2">
                        {[...Array(totalPages)].map((_, i) => {
                            const p = i + 1;
                            if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                                return (
                                    <button
                                        key={p}
                                        onClick={() => handlePageChange(p)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === p 
                                            ? "bg-slate-900 text-white" 
                                            : "text-slate-500 hover:bg-slate-100"}`}
                                    >
                                        {p}
                                    </button>
                                );
                            }
                            if (p === currentPage - 2 || p === currentPage + 2) return <span key={p} className="text-slate-300">...</span>;
                            return null;
                        })}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 disabled:opacity-30 transition-colors"
                    >
                        Next <FaChevronRight size={10} />
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!loading && packages.length === 0 && (
                <div className="text-center py-20 border border-slate-200 rounded-xl bg-white">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaShieldAlt className="text-slate-300" size={24} />
                    </div>
                    <h3 className="text-slate-900 font-bold">No match found</h3>
                    <p className="text-slate-500 text-xs mt-1">Adjust your search or clear filters to see more packages.</p>
                </div>
            )}
        </div>
    );
}

export default AllPackagesList;