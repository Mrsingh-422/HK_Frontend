"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
    <div className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse h-[400px] flex flex-col shadow-sm">
        <div className="h-40 bg-slate-100 rounded-xl mb-4" />
        <div className="space-y-3 flex-1">
            <div className="h-3 bg-slate-100 rounded w-1/4" />
            <div className="h-5 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-50 rounded w-1/2 mt-4" />
        </div>
        <div className="h-12 bg-slate-100 rounded-xl w-full mt-4" />
    </div>
);

function AllPackagesList({ searchTerm = "", selectedLabId = null }) {
    const router = useRouter();
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

    const handleNavigate = (pkgId) => {
        router.push(`/booklabtest/packagedetails/${pkgId}`);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            const element = document.getElementById("packages-grid-top");
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6 space-y-10" id="packages-grid-top">
            
            {/* Professional Grid - Updated to 2 columns on mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {loading ? (
                    Array(8).fill(0).map((_, i) => <PackageCardSkeleton key={i} />)
                ) : (
                    packages.map((pkg) => {
                        // Logic: Use minPrice if available, else fallback to standardMRP
                        const displayPrice = pkg.minPrice || pkg.standardMRP || pkg.mrp || 0;
                        const strikePrice = pkg.standardMRP || pkg.mrp || 0;
                        const hasDiscount = strikePrice > displayPrice;
                        const isAdded = cartItemIds.includes(pkg._id);
                        const imageSrc = pkg.image && pkg.image.trim() !== "" ? pkg.image : FALLBACK_IMAGE;

                        return (
                            <div
                                key={pkg._id}
                                onClick={() => handleNavigate(pkg._id)}
                                className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
                            >
                                {/* Thumbnail Section */}
                                <div className="relative h-32 sm:h-40 w-full overflow-hidden bg-slate-50">
                                    <img
                                        src={imageSrc}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        alt={pkg.packageName}
                                        onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
                                    
                                    {hasDiscount && (
                                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-emerald-500 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-lg backdrop-blur-sm">
                                            {Math.round(((strikePrice - displayPrice) / strikePrice) * 100)}% OFF
                                        </div>
                                    )}

                                    <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 flex gap-1 sm:gap-2">
                                        <span className="bg-white/90 backdrop-blur-md text-[7px] sm:text-[9px] font-bold text-slate-700 px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
                                            {pkg.mainCategory || 'Pathology'}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-3 sm:p-5 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                                        <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded">
                                            <FaStar className="text-amber-500" size={8} />
                                            <span className="text-[9px] sm:text-[11px] font-bold text-amber-700">4.9</span>
                                        </div>
                                        <span className="hidden sm:block text-[10px] text-slate-400 font-medium">ID: {pkg._id.slice(-4).toUpperCase()}</span>
                                    </div>

                                    <h3 className="text-[12px] sm:text-[15px] font-bold text-slate-900 line-clamp-2 h-8 sm:h-11 mb-2 sm:mb-3 leading-tight group-hover:text-emerald-600 transition-colors">
                                        {pkg.packageName}
                                    </h3>

                                    <div className="space-y-1.5 sm:space-y-2.5 mb-4 sm:mb-6">
                                        <div className="flex items-center gap-2 sm:gap-3 text-slate-600">
                                            <FaFlask size={10} className="text-emerald-500 shrink-0" />
                                            <span className="text-[10px] sm:text-[12px] font-medium truncate">
                                                {pkg.testCount || pkg.totalTestsIncluded || 0} Tests
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3 text-slate-600">
                                            <FaClinicMedical size={10} className="text-blue-500 shrink-0" />
                                            <span className="text-[10px] sm:text-[12px] font-medium truncate">{pkg.vendorCount || 1} Labs</span>
                                        </div>
                                    </div>

                                    {/* Price & CTA Section */}
                                    <div className="mt-auto pt-3 sm:pt-4 border-t border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex flex-col">
                                            {hasDiscount && (
                                                <span className="text-[9px] sm:text-[11px] text-slate-400 line-through">₹{strikePrice}</span>
                                            )}
                                            <div className="flex items-baseline gap-0.5">
                                                <span className="text-[10px] sm:text-xs font-bold text-slate-900">₹</span>
                                                <span className="text-base sm:text-xl font-black text-slate-900 tracking-tight">{displayPrice}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleNavigate(pkg._id);
                                            }}
                                            className={`flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-[12px] font-bold transition-all duration-300 ${isAdded
                                                ? "bg-slate-100 text-slate-500"
                                                : "bg-emerald-600 text-white shadow-md shadow-emerald-100 hover:bg-emerald-700"
                                            }`}
                                        >
                                            <span className="truncate">{isAdded ? "In Cart" : "Details"}</span>
                                            {!isAdded && <FaArrowRight size={8} className="shrink-0" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Premium Pagination */}
            {totalPages > 1 && !loading && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-6 py-12 border-t border-slate-100">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 text-[12px] font-bold text-slate-600 hover:text-emerald-600 disabled:opacity-30 transition-colors px-4 py-2"
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
                                        className={`w-10 h-10 rounded-xl text-[12px] font-bold transition-all duration-200 ${currentPage === p 
                                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
                                            : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
                                    >
                                        {p}
                                    </button>
                                );
                            }
                            if (p === currentPage - 2 || p === currentPage + 2) return <span key={p} className="text-slate-300 px-1">...</span>;
                            return null;
                        })}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 text-[12px] font-bold text-slate-600 hover:text-emerald-600 disabled:opacity-30 transition-colors px-4 py-2"
                    >
                        Next <FaChevronRight size={10} />
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!loading && packages.length === 0 && (
                <div className="text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="bg-white w-20 h-20 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
                        <FaShieldAlt className="text-slate-300" size={32} />
                    </div>
                    <h3 className="text-slate-900 font-bold text-lg">No health packages found</h3>
                    <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
                        We couldn't find any health packages matching your search. Try adjusting your filters.
                    </p>
                </div>
            )}
        </div>
    );
}

export default AllPackagesList;