"use client";

import React, { useEffect, useState, useMemo } from "react";
import { FaStar, FaFlask, FaChevronRight, FaClinicMedical, FaCheckCircle } from "react-icons/fa";
import PackageDetailsModal from "./otherComponents/PackageDetailsModal";
import UserAPI from "@/app/services/UserAPI";
import { useCart } from "@/app/context/CartContext";

function PackagesList({ searchTerm = "", selectedLabId = null }) {
    const { cartItemIds } = useCart(); // Consume context to show 'Added' state
    const [packages, setPackages] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setLoading(true);
                let response;
                if (selectedLabId && selectedLabId !== "undefined") {
                    response = await UserAPI.getLabDetails(selectedLabId);
                    if (response.success) setPackages(response.packages || []);
                } else {
                    response = await UserAPI.getStandardPackageCatalog();
                    if (response.success) setPackages(response.data || response.packages || []);
                }
            } catch (err) {
                console.error("Packages Fetch Error:", err);
                setPackages([]);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, [selectedLabId]);

    const filteredPackages = useMemo(() => {
        const term = searchTerm?.toLowerCase() || "";
        return packages.filter((pkg) =>
            pkg.packageName?.toLowerCase().includes(term) ||
            pkg.mainCategory?.toLowerCase().includes(term) ||
            pkg.category?.toLowerCase().includes(term)
        );
    }, [packages, searchTerm]);

    const handleCardClick = (pkg) => {
        setSelectedPackage(pkg);
        setIsModalOpen(true);
    };

    if (loading) return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-80 bg-slate-50 animate-pulse rounded-3xl border border-slate-100" />
            ))}
        </div>
    );

    return (
        <div className="bg-transparent">
            <PackageDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                pkg={selectedPackage}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPackages.map((pkg) => {
                    const isAdded = cartItemIds.includes(pkg._id);
                    const displayPrice = pkg.offerPrice || pkg.minPrice || pkg.mrp;
                    const strikePrice = pkg.mrp || pkg.standardMRP;

                    return (
                        <div
                            key={pkg._id}
                            onClick={() => handleCardClick(pkg)}
                            className="group relative bg-white rounded-[2rem] border border-slate-100 hover:border-emerald-500/30 hover:shadow-[0_20px_50px_rgba(8,179,106,0.12)] transition-all duration-500 flex flex-col overflow-hidden cursor-pointer"
                        >
                            {/* Top Badge: Labs Count */}
                            {pkg.vendorCount > 0 && (
                                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm flex items-center gap-2 border border-slate-100">
                                    <FaClinicMedical className="text-emerald-500 text-xs" />
                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">
                                        {pkg.vendorCount} Labs
                                    </span>
                                </div>
                            )}

                            {/* Image Section */}
                            <div className="relative h-48 w-full overflow-hidden">
                                <img
                                    src={pkg.image || `https://images.unsplash.com/photo-1579152276532-535c21af30b0?q=80&w=800`}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    alt={pkg.packageName}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                                {/* Discount Tag */}
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
                                        {pkg.mainCategory || 'Full Body'}
                                    </span>
                                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                                        <FaStar className="text-amber-400 text-[10px]" />
                                        <span className="text-slate-700 font-bold text-[10px]">4.9</span>
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
                                        <span className="text-xs font-medium text-slate-500">{pkg.testCount || pkg.tests?.length} Tests</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center">
                                            <FaCheckCircle className="text-blue-500 text-[10px]" />
                                        </div>
                                        <span className="text-xs font-medium text-slate-500">Certified</span>
                                    </div>
                                </div>

                                {/* Footer: Price & Button */}
                                <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Starts From</p>
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
                                        {isAdded ? "Selected" : "Book Now"}
                                        {!isAdded && <FaChevronRight size={10} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredPackages.length === 0 && !loading && (
                <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 mx-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <FaFlask className="text-slate-300 text-xl" />
                    </div>
                    <h3 className="text-slate-800 font-bold text-lg">No matches found</h3>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
                </div>
            )}
        </div>
    );
}

export default PackagesList;