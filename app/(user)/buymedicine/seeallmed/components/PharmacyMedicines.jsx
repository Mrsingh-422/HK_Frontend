"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    ShoppingCart,
    Grid
} from 'lucide-react';
import UserAPI from '@/app/services/UserAPI';

// Local network asset asset configuration setup
const IMAGE_BASE_URL = "http://192.168.1.26:5002/";

const RANDOM_IMAGES = [
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=500&auto=format&fit=crop",
    "https://cdn.pixabay.com/photo/2020/10/02/09/01/tablets-5620566_1280.jpg",
    "https://images.unsplash.com/photo-1628771065518-0d82f1938462?q=80&w=500&auto=format&fit=crop"
];

function PharmacyMedicines({ id }) {
    const router = useRouter();
    const { pharmacyId } = useParams();
    
    // Resolve valid ID path context from prop parameter parsing or fallback URL variables parsing
    const targetPharmacyId = id || pharmacyId;

    // Core Inventory/Category States
    const [products, setProducts] = useState([]);
    const [dynamicCategories, setDynamicCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    // Filter Optimization Typing States
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    const limit = 12;

    // Mount-fetch dedicated dynamic categorization payload data rows
    useEffect(() => {
        const fetchCategoriesData = async () => {
            try {
                setCategoriesLoading(true);
                const res = await UserAPI.getAllMedicineCategories();
                if (res?.success && Array.isArray(res.data)) {
                    setDynamicCategories(res.data);
                }
            } catch (error) {
                console.error("Failed to load runtime e-commerce store categorization tracks:", error);
            } finally {
                setCategoriesLoading(false);
            }
        };
        fetchCategoriesData();
    }, []);

    // Debounce search term entries to limit processing load
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); 
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Primary Core Data Handler calling remote pharmacy inventory listings
    const fetchProducts = useCallback(async () => {
        if (!targetPharmacyId) return;
        setLoading(true);
        try {
            const res = await UserAPI.getSinglePharmacyMedicines(targetPharmacyId, {
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
            console.error("Failed to fetch targeted store sub-inventory grid payload:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearch, activeCategory, targetPharmacyId]);

    // Re-execute lookup anytime dependency array targets reflect adjustments
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleCategoryChange = (categoryName) => {
        setActiveCategory(categoryName);
        setCurrentPage(1); 
    };

    const handleProductClick = (medicineId) => {
        router.push(`/buymedicine/singleproductdetail/${medicineId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            <div className="max-w-7xl mx-auto px-4 pt-8">

                {/* --- HEADER CONTROLS CARD CONTEXT BOX --- */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Pharmacy Inventory</h1>
                            <div className="flex items-center gap-2 text-gray-500 mt-1 text-sm">
                                <span>Store Shelf Range</span>
                                <ChevronRightIcon size={14} className="text-gray-300" />
                                <span className="text-[#08B36A] font-semibold">{activeCategory}</span>
                            </div>
                        </div>

                        {/* Search Action Input Field Container */}
                        <div className="relative w-full lg:w-[400px]">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] outline-none transition-all text-sm font-medium text-gray-800"
                                placeholder="Search in this pharmacy..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* --- HORIZONTAL DYNAMIC CATEGORY FILTER TRACK --- */}
                    <div className="mt-8 border-t border-gray-100 pt-6">
                        {categoriesLoading ? (
                            <div className="flex gap-2 pb-2 overflow-x-auto">
                                {[...Array(6)].map((_, idx) => (
                                    <div key={idx} className="h-9 w-24 bg-gray-100 rounded-lg animate-pulse shrink-0" />
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar mask-edge">
                                {/* Base "All" filter item pill */}
                                <button
                                    onClick={() => handleCategoryChange("All")}
                                    className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold tracking-tight whitespace-nowrap transition-all border flex items-center gap-1.5 shrink-0 ${
                                        activeCategory === "All"
                                            ? "bg-[#08B36A] text-white border-[#08B36A] shadow-sm"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-[#08B36A] hover:text-[#08B36A]"
                                    }`}
                                >
                                    <Grid size={13} />
                                    <span>All Products</span>
                                </button>

                                {/* Mapping API dynamic database nodes */}
                                {dynamicCategories.map((cat, idx) => {
                                    const isSelected = activeCategory === cat.name;
                                    return (
                                        <button
                                            key={cat.name || idx}
                                            onClick={() => handleCategoryChange(cat.name)}
                                            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold tracking-tight whitespace-nowrap transition-all border flex items-center gap-2 shrink-0 ${
                                                isSelected
                                                    ? "bg-[#08B36A] text-white border-[#08B36A] shadow-sm"
                                                    : "bg-white text-gray-600 border-gray-200 hover:border-[#08B36A] hover:text-[#08B36A]"
                                            }`}
                                        >
                                            {cat.image && (
                                                <img 
                                                    src={cat.image.startsWith('http') ? cat.image : `${IMAGE_BASE_URL}${cat.image}`} 
                                                    alt=""
                                                    className={`w-3.5 h-3.5 rounded object-cover ${isSelected ? 'brightness-125' : 'mix-blend-multiply'}`}
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            )}
                                            <span>{cat.name}</span>
                                            {cat.productCount !== undefined && (
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${isSelected ? 'bg-emerald-700/50 text-emerald-100' : 'bg-gray-50 text-gray-400'}`}>
                                                    {cat.productCount}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* --- GRID METRICS BOUNDS DESCRIPTION LINE --- */}
                <div className="flex items-center justify-between mb-6 px-1">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Matched Products <span className="ml-1 text-gray-400 font-medium">({totalProducts} available)</span>
                    </h2>
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold cursor-pointer hover:text-gray-800 transition-colors">
                        <Filter size={13} /> <span>SORT: RELEVANCE</span>
                    </div>
                </div>

                {/* --- PRODUCT DISPLAY WINDOW GRID --- */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white h-84 rounded-2xl animate-pulse border border-gray-100 shadow-sm" />
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {products.map((item, index) => {
                            // Extract explicit remote asset URLs safely or inject responsive stock fallbacks
                            const directImage = Array.isArray(item.image_url) ? item.image_url[0] : (item.image || item.imagePath);
                            const completeImgPath = directImage 
                                ? (directImage.startsWith('http') ? directImage : `${IMAGE_BASE_URL}${directImage}`)
                                : RANDOM_IMAGES[index % RANDOM_IMAGES.length];

                            const mrpNumber = parseFloat(item.mrp || 0);
                            const vendorPriceNumber = parseFloat(item.vendorPrice || item.best_price || 0);
                            const isOutOfStock = !item.isAvailable || item.stock === 0;

                            return (
                                <div
                                    key={item.inventoryId || item._id || index}
                                    onClick={() => handleProductClick(item.medicineId || item._id)}
                                    className="group flex flex-col bg-white border border-gray-200/80 rounded-2xl p-4 hover:shadow-[0_15px_40px_rgba(0,0,0,0.04)] hover:border-[#08B36A]/30 transition-all duration-500 cursor-pointer relative"
                                >
                                    {/* Image Wrapper Block Container */}
                                    <div className="relative aspect-square w-full mb-4 bg-gray-50/50 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                                        {/* Prescription Required Rx Status Check */}
                                        {item.prescriptionRequired === "YES" && (
                                            <div className="absolute top-2 left-2 z-10 bg-white/95 backdrop-blur-sm text-red-600 text-[9px] font-bold px-2 py-0.5 rounded border border-red-100 flex items-center gap-1 shadow-sm">
                                                <span className="w-1 h-1 bg-red-500 rounded-full" /> Rx
                                            </div>
                                        )}

                                        {/* Sale Markdown Tag Indicators */}
                                        {item.discountPercentage > 0 && (
                                            <div className="absolute top-2 right-2 z-10 bg-[#08B36A] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm tracking-wide">
                                                {parseInt(item.discountPercentage)}% OFF
                                            </div>
                                        )}

                                        <img
                                            src={completeImgPath}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
                                            onError={(e) => {
                                                e.target.src = RANDOM_IMAGES[index % RANDOM_IMAGES.length];
                                            }}
                                        />

                                        {/* Out of Stock Overlay Screen Layer */}
                                        {isOutOfStock && (
                                            <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-20">
                                                <span className="bg-slate-900 text-white text-[9px] font-bold tracking-wider px-2.5 py-1 rounded-md uppercase">Out of Stock</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Medical Description Text Fields Block */}
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-gray-800 line-clamp-2 h-10 mb-1 leading-snug group-hover:text-[#08B36A] transition-colors">
                                            {item.name}
                                        </h3>
                                        
                                        <p className="text-xs text-gray-400 mb-4 font-medium truncate max-w-full">
                                            {item.packaging || 'Standard Packaging'}
                                        </p>

                                        <div className="mt-auto">
                                            <div className="flex items-baseline gap-1.5 mb-4 flex-wrap">
                                                <span className="text-lg font-extrabold text-gray-900 tracking-tight">₹{vendorPriceNumber}</span>
                                                {mrpNumber > vendorPriceNumber && (
                                                    <span className="text-xs text-gray-300 line-through font-medium">₹{mrpNumber}</span>
                                                )}
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleProductClick(item.medicineId || item._id);
                                                }}
                                                className="w-full flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-[#08B36A] text-white py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm active:scale-95"
                                            >
                                                <span>View Details</span> 
                                                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200 max-w-7xl mx-auto shadow-sm">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <ShoppingBag size={24} />
                        </div>
                        <h3 className="text-base font-bold text-gray-800">Inventory channel empty</h3>
                        <p className="text-gray-400 text-xs mt-1 px-6">No medicines match the given search query parameters in this storefront scope.</p>
                    </div>
                )}

                {/* --- PAGINATION INTERFACE COMPONENT LAYER --- */}
                {!loading && totalPages > 1 && (
                    <div className="mt-16 flex justify-center">
                        <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl shadow-sm border border-gray-200">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg hover:bg-gray-50 disabled:opacity-20 text-gray-500 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="flex items-center px-4">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                                    Page <span className="text-gray-900 text-sm font-extrabold mx-0.5">{currentPage}</span> of <span className="text-gray-900 text-sm font-extrabold mx-0.5">{totalPages}</span>
                                </span>
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg hover:bg-gray-50 disabled:opacity-20 text-gray-500 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* --- TRUST FOOTER QUALITY TARGET LABELS --- */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-200/60 shadow-sm">
                        <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center text-[#08B36A] shrink-0"><Info size={18} /></div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wide">Pharmacy Verified</h4>
                            <p className="text-xs text-gray-400 mt-1 font-medium leading-relaxed">Stock levels and configuration details map out updates in live real-time metrics.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-200/60 shadow-sm">
                        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0"><Stethoscope size={18} /></div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wide">Authentic Stock</h4>
                            <p className="text-xs text-gray-400 mt-1 font-medium leading-relaxed">All active formulation items undergo chemical batch validation profiles.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-200/60 shadow-sm">
                        <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 shrink-0"><ShoppingCart size={18} /></div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wide">Safe Handling</h4>
                            <p className="text-xs text-gray-400 mt-1 font-medium leading-relaxed">Prescriptions are stored and securely packaged under cold-chain logistics protocols.</p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .mask-edge {
                    mask-image: linear-gradient(to right, black 90%, transparent 100%);
                    -webkit-mask-image: linear-gradient(to right, black 90%, transparent 100%);
                }
            `}</style>
        </div>
    );
}

export default PharmacyMedicines;