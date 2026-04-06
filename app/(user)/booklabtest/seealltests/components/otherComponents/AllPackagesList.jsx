"use client";

import React, { useEffect, useState, useMemo } from "react";
import { FaStar, FaShoppingCart, FaTrashAlt, FaFlask } from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";
import PackageDetailsModal from "./PackageDetailsModal";

function AllPackagesList({ searchTerm = "" }) {
    const [packages, setPackages] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setLoading(true);
                let response;
                response = await UserAPI.getStandardPackageCatalog();
                if (response.success) {
                    setPackages(response.data || response.packages || []);
                }
            } catch (err) {
                console.error("Packages Fetch Error:", err);
                setPackages([]);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    const filteredPackages = useMemo(() => {
        const term = searchTerm?.toLowerCase() || "";
        return packages.filter((pkg) =>
            pkg.packageName?.toLowerCase().includes(term) ||
            pkg.mainCategory?.toLowerCase().includes(term) ||
            pkg.category?.toLowerCase().includes(term)
        );
    }, [packages, searchTerm]);

    const toggleCart = (pkg, e) => {
        if (e) e.stopPropagation();
        setCartItems(prev => prev.includes(pkg._id)
            ? prev.filter(id => id !== pkg._id)
            : [...prev, pkg._id]
        );
    };

    const handleCardClick = (pkg) => {
        setSelectedPackage(pkg);
        setIsModalOpen(true);
    };

    if (loading) return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
        </div>
    );

    return (
        <div className="bg-transparent">
            <PackageDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                pkg={selectedPackage}
                onCartToggle={toggleCart}
                isAdded={selectedPackage && cartItems.includes(selectedPackage._id)}
            />

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {filteredPackages.map((pkg) => {
                    const isAdded = cartItems.includes(pkg._id);
                    const displayPrice = pkg.offerPrice || pkg.minPrice || pkg.mrp;

                    return (
                        <div
                            key={pkg._id}
                            onClick={() => handleCardClick(pkg)}
                            className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-[#08B36A] hover:shadow-xl transition-all duration-300 flex flex-col"
                        >
                            <div className="h-28 sm:h-44 md:h-52 w-full relative overflow-hidden bg-slate-100">
                                <img
                                    src={pkg.image || `https://images.unsplash.com/photo-1579152276532-535c21af30b0?q=80&w=800`}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    alt={pkg.packageName}
                                />
                                {pkg.vendorCount && (
                                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter text-slate-800">
                                        {pkg.vendorCount} Labs Available
                                    </div>
                                )}
                            </div>

                            <div className="p-3 md:p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[7px] md:text-[10px] font-black text-[#08B36A] uppercase tracking-widest truncate">
                                        {pkg.mainCategory || pkg.category || 'Health Package'}
                                    </span>
                                    <div className="flex items-center gap-0.5 text-yellow-400 text-[8px] md:text-xs">
                                        <FaStar className="fill-current" />
                                        <span className="text-slate-900 font-bold">4.8</span>
                                    </div>
                                </div>

                                <h3 className="text-[11px] md:text-base font-black text-slate-800 line-clamp-2 h-8 md:h-12 leading-tight group-hover:text-[#08B36A] transition-colors">
                                    {pkg.packageName}
                                </h3>

                                <div className="mt-2 md:mt-3 flex items-center gap-2 text-[9px] md:text-[11px] text-slate-400 font-bold uppercase tracking-tighter">
                                    <FaFlask className="text-[#08B36A]" />
                                    <span>{pkg.testCount || pkg.tests?.length || 'Comprehensive'} Tests</span>
                                </div>

                                <div className="mt-4 pt-3 md:pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Price</p>
                                        <p className="text-sm md:text-xl font-black text-slate-900 leading-none">
                                            ₹{displayPrice}
                                        </p>
                                    </div>

                                    <button
                                        onClick={(e) => toggleCart(pkg, e)}
                                        className={`p-2 md:p-3 rounded-xl transition-all border flex items-center justify-center ${isAdded
                                            ? "bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-500 hover:text-white"
                                            : "bg-[#08B36A] text-white border-[#08B36A] hover:bg-slate-900 shadow-md"
                                            }`}
                                    >
                                        {isAdded ? <FaTrashAlt className="text-xs md:text-sm" /> : <FaShoppingCart className="text-xs md:text-sm" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredPackages.length === 0 && !loading && (
                <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                    <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">No Packages Available</p>
                </div>
            )}
        </div>
    );
}

export default AllPackagesList;