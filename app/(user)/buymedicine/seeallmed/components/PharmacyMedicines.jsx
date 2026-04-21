"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    X,
    Filter,
    Stethoscope,
    Info,
    ShoppingBag,
    ChevronRight as ChevronRightIcon,
    ArrowRight,
    ShoppingCart
} from 'lucide-react';
import UserAPI from '@/app/services/UserAPI';

const RANDOM_IMAGES = [
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=500&auto=format&fit=crop",
    "https://m.media-amazon.com/images/I/71S2lC+1icL.jpg",
    "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=500&auto=format&fit=crop",
    "https://cdn.pixabay.com/photo/2020/10/02/09/01/tablets-5620566_1280.jpg",
    "https://images.unsplash.com/photo-1628771065518-0d82f1938462?q=80&w=500&auto=format&fit=crop"
];

const CATEGORIES = [
    "All",
    "Medicines",
    "Diabetes",
    "Cardiac Care",
    "Respiratory",
    "Fitness & Supplements",
    "Baby Care",
    "Devices"
];

function PharmacyMedicines({ id }) {
    const router = useRouter();
    const { pharmacyId } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    // Search states
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    const limit = 12;

    // Debounce search term to avoid hitting API on every keystroke
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Reset to page 1 on search
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    const fetchProducts = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await UserAPI.getSinglePharmacyMedicines(id, {
                page: currentPage,
                limit: limit,
                search: debouncedSearch || undefined,
                category: activeCategory !== "All" ? activeCategory : undefined
            });

            if (res && res.success) {
                setProducts(res.data || []);
                setTotalPages(res.totalPages || 1);
                setTotalProducts(res.total || 0);
            }
        } catch (error) {
            console.error("Failed to fetch pharmacy medicines:", error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearch, activeCategory, id]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleCategoryChange = (category) => {
        setActiveCategory(category);
        setCurrentPage(1); // Reset to page 1 on category change
    };

    const handleProductClick = (medicineId) => {
        router.push(`/buymedicine/singleproductdetail/${medicineId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            <div className="max-w-7xl mx-auto px-4 pt-8">

                {/* --- HEADER SECTION --- */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Pharmacy Inventory</h1>
                            <div className="flex items-center gap-2 text-gray-500 mt-1 text-sm">
                                <span>Store</span>
                                <ChevronRightIcon size={14} />
                                <span className="text-[#08B36A] font-medium">{activeCategory}</span>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full lg:w-[400px]">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] outline-none transition-all text-sm"
                                placeholder="Search in this pharmacy..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* --- CATEGORY SELECTOR --- */}
                    <div className="mt-8 border-t border-gray-100 pt-6">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryChange(cat)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${activeCategory === cat
                                        ? "bg-[#08B36A] text-white border-[#08B36A] shadow-sm"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-[#08B36A] hover:text-[#08B36A]"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- RESULTS INFO --- */}
                <div className="flex items-center justify-between mb-6 px-1">
                    <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        Products <span className="ml-1 text-gray-400">({totalProducts} items)</span>
                    </h2>
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-bold cursor-pointer hover:text-gray-800">
                        <Filter size={14} /> <span>SORT: RELEVANCE</span>
                    </div>
                </div>

                {/* --- PRODUCT GRID --- */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white h-80 rounded-2xl animate-pulse border border-gray-100" />
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {products.map((item, index) => {
                            const displayImage = RANDOM_IMAGES[index % RANDOM_IMAGES.length];
                            const mrpNumber = parseFloat(item.mrp);

                            return (
                                <div
                                    key={item.inventoryId}
                                    onClick={() => handleProductClick(item.medicineId)}
                                    className="group flex flex-col bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-xl hover:border-[#08B36A]/30 transition-all duration-300 cursor-pointer"
                                >
                                    <div className="relative aspect-square w-full mb-4 bg-gray-50 rounded-xl overflow-hidden">
                                        {/* Prescription Tag */}
                                        {item.prescriptionRequired === "YES" && (
                                            <div className="absolute top-2 left-2 z-10 bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded border border-red-100">
                                                Rx Required
                                            </div>
                                        )}

                                        {/* Discount Tag */}
                                        {item.discountPercentage > 0 && (
                                            <div className="absolute top-2 right-2 z-10 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                                {item.discountPercentage}% OFF
                                            </div>
                                        )}

                                        <img
                                            src={displayImage} // Using random fallbacks as API provides strings like "img_3"
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />

                                        {(!item.isAvailable || item.stock === 0) && (
                                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                                <span className="bg-gray-800 text-white text-[10px] font-black px-3 py-1 rounded uppercase">Out of Stock</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col flex-1">
                                        <h3 className="text-sm font-bold text-gray-800 line-clamp-2 h-10 mb-1 leading-snug">
                                            {item.name}
                                        </h3>
                                        <p className="text-xs text-gray-400 mb-4 font-medium">
                                            {item.packaging}
                                        </p>

                                        <div className="mt-auto">
                                            <div className="flex items-baseline gap-2 mb-4">
                                                <span className="text-lg font-bold text-gray-900">₹{item.vendorPrice}</span>
                                                {mrpNumber > item.vendorPrice && (
                                                    <span className="text-xs text-gray-400 line-through">₹{item.mrp}</span>
                                                )}
                                            </div>

                                            <button
                                                className="w-full flex items-center justify-center gap-2 bg-[#08B36A] hover:bg-[#069c5a] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                                            >
                                                View Details <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-300">
                        <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
                        <h3 className="text-lg font-bold text-gray-800">Inventory empty</h3>
                        <p className="text-gray-500 text-sm mt-1">No medicines found matching your criteria.</p>
                    </div>
                )}

                {/* --- PAGINATION --- */}
                {!loading && totalPages > 1 && (
                    <div className="mt-16 flex justify-center">
                        <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl shadow-sm border border-gray-200">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg hover:bg-gray-50 disabled:opacity-30 text-gray-500 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="flex items-center px-4">
                                <span className="text-sm font-bold text-gray-700">
                                    Page {currentPage} of {totalPages}
                                </span>
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg hover:bg-gray-50 disabled:opacity-30 text-gray-500 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* --- TRUST FOOTER --- */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-[#08B36A] shrink-0"><Info size={20} /></div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">Pharmacy Verified</h4>
                            <p className="text-xs text-gray-500 mt-1">Stock levels and prices are updated in real-time.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 shrink-0"><Stethoscope size={20} /></div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">Authentic Stock</h4>
                            <p className="text-xs text-gray-500 mt-1">All items are checked for batch and expiry details.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 shrink-0"><ShoppingCart size={20} /></div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">Safe Handling</h4>
                            <p className="text-xs text-gray-500 mt-1">Medicines are stored and packed under strict guidelines.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PharmacyMedicines;