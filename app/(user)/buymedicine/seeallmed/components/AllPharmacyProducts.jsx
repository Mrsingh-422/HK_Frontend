"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    X,
    Filter,
    Stethoscope,
    Info,
    ShoppingBag,
    ArrowRight,
    ShoppingCart,
    Grid
} from 'lucide-react';
import UserAPI from '@/app/services/UserAPI';

// Local network asset configuration setup
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.healthkartlabs.com";

const RANDOM_IMAGES = [
    "https://png.pngtree.com/png-clipart/20240619/original/pngtree-drug-capsule-pill-from-prescription-in-drugstore-pharmacy-for-treatment-health-png-image_15366552.png",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoCeZWPrZTbRmEPXrqFtm1_6dqQIB0sQzkVhd_x154tg&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQv-J7r_z4VKOmVifDiSnHDtqViF1AciVwbhdBu0SRoBkgfycz7xyzYwPo&s=10",

];

function AllPharmacyProducts() {
    const router = useRouter();

    const [products, setProducts] = useState([]);
    const [dynamicCategories, setDynamicCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    const limit = 12;

    // Fetch Dynamic Categories from Backend Array
    useEffect(() => {
        const fetchCategoriesData = async () => {
            try {
                setCategoriesLoading(true);
                const res = await UserAPI.getAllMedicineCategories();
                if (res?.success && Array.isArray(res.data)) {
                    setDynamicCategories(res.data);
                }
            } catch (error) {
                console.error("Failed to load global pharmacy category filters:", error);
            } finally {
                setCategoriesLoading(false);
            }
        };
        fetchCategoriesData();
    }, []);

    // Primary Core Callback handler for Paginated Products Catalog Data
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await UserAPI.getPharmacyProductsAll({
                page: currentPage,
                limit: limit,
                search: searchTerm || undefined,
                category: activeCategory !== "All" ? activeCategory : undefined
            });

            if (res && res.success) {
                setProducts(res.data || []);
                setTotalPages(res.totalPages || 1);
                setTotalProducts(res.total || 0);
            }
        } catch (error) {
            console.error("Failed to fetch products array list:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, activeCategory]);

    // Track state variations and execute queries on pipeline change
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Reset layout pagination back to page 1 whenever category is toggled on the UI
    const handleCategorySelect = (categoryName) => {
        setActiveCategory(categoryName);
        setCurrentPage(1);
    };

    const handleProductClick = (productId) => {
        router.push(`/buymedicine/singleproductdetail/${productId}`);
    };

return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20 selection:bg-emerald-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10">

                {/* --- METRICS SUB HEADER BRAND TRACKING BAR --- */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 px-1">
                    <div className="flex flex-col gap-1.5">
                        <h2 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            Browsing Scope <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg font-black">{activeCategory}</span>
                        </h2>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white border border-slate-200/60 rounded-lg text-slate-500 font-bold text-[10px] md:text-xs w-fit shadow-sm">
                            {totalProducts} Matches Found
                        </div>
                    </div>

                    <button className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[10px] font-black hover:border-emerald-600 hover:text-emerald-600 transition-all shadow-sm active:scale-95">
                        <Filter size={13} /> <span>SORT BY RELEVANCE</span>
                    </button>
                </div>

                {/* --- HORIZONTAL DYNAMIC CATEGORY FILTER TOOLBAR --- */}
                <div className="mb-10 relative px-1">
                    {categoriesLoading ? (
                        <div className="flex gap-3 overflow-x-auto pb-3">
                            {[...Array(6)].map((_, idx) => (
                                <div key={idx} className="h-10 w-28 bg-white border border-slate-100 rounded-xl animate-pulse shrink-0" />
                            ))}
                        </div>
                    ) : (
                        <div className="flex gap-3 overflow-x-auto pb-3 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-slate-50 [&::-webkit-scrollbar-thumb]:bg-slate-200/80 [&::-webkit-scrollbar-thumb]:rounded-full mask-edge">
                            {/* Global Base Scope Selection Capsule */}
                            <button
                                onClick={() => handleCategorySelect("All")}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border tracking-tight transition-all shrink-0 shadow-sm ${
                                    activeCategory === "All"
                                        ? "bg-slate-900 border-slate-900 text-white"
                                        : "bg-white border-slate-200/70 text-slate-600 hover:border-slate-300"
                                }`}
                            >
                                <Grid size={13} />
                                <span>All Categories</span>
                            </button>

                            {/* Dynamically Mapping Content Response Entries */}
                            {dynamicCategories.map((cat, idx) => {
                                const isTargetActive = activeCategory === cat.name;
                                return (
                                    <button
                                        key={cat.name || idx}
                                        onClick={() => handleCategorySelect(cat.name)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border tracking-tight transition-all shrink-0 shadow-sm ${
                                            isTargetActive
                                                ? "bg-emerald-600 border-emerald-600 text-white"
                                                : "bg-white border-slate-200/70 text-slate-600 hover:border-emerald-500/30 hover:text-emerald-600"
                                        }`}
                                    >
                                        {cat.image && (
                                            <img
                                                src={cat.image.startsWith('http') ? cat.image : `${IMAGE_BASE_URL}${cat.image}`}
                                                alt=""
                                                className={`w-4 h-4 rounded object-cover ${isTargetActive ? 'brightness-125' : 'mix-blend-multiply'}`}
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        )}
                                        <span>{cat.name}</span>
                                        {cat.productCount !== undefined && (
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${isTargetActive ? 'bg-emerald-700/50 text-emerald-100' : 'bg-slate-50 text-slate-400'}`}>
                                                {cat.productCount}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* --- INVENTORY PRODUCT GRID METRICS VIEW --- */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white aspect-[3/4.6] rounded-2xl md:rounded-[2rem] animate-pulse border border-slate-100 shadow-sm" />
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
                        {products.map((product, index) => {
                            // Extract valid matching asset link strings safely
                            const nativeImg = Array.isArray(product.image_url) ? product.image_url[0] : product.image;
                            const completeImgPath = nativeImg
                                ? (nativeImg.startsWith('http') ? nativeImg : `${IMAGE_BASE_URL}${nativeImg}`)
                                : RANDOM_IMAGES[index % RANDOM_IMAGES.length];

                            // Safe pricing extraction handles string/number formatting gracefully
                            const discountPercentStr = product.discont_percent || product.discount || "";
                            const discountPercentVal = parseInt(discountPercentStr.toString().replace('%', '')) || 0;
                            const priceBest = parseFloat(product.best_price || product.bestPrice || 0);
                            const priceMrp = parseFloat(product.mrp || 0) || priceBest;

                            // Out of stock evaluation from schema flags
                            const isOutOfStock = product.isAvailable === false || product.isAvailable === "false" || product.vendorCount === 0;

                            return (
                                <div
                                    key={product._id || index}
                                    onClick={() => handleProductClick(product._id)}
                                    className={`group flex flex-col bg-white border border-slate-100 rounded-2xl md:rounded-[2.5rem] p-3 md:p-5 hover:shadow-[0_22px_50px_rgba(15,23,42,0.06)] hover:border-slate-200/50 transition-all duration-500 cursor-pointer relative ${
                                        isOutOfStock ? "opacity-85" : ""
                                    }`}
                                >
                                    {/* Image Container Aspect Wrapper Frame */}
                                    <div className="relative aspect-square w-full mb-4 bg-slate-50/70 rounded-xl md:rounded-3xl overflow-hidden shrink-0 flex items-center justify-center">
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {/* Prescription Required Indicator */}
                                        {product.prescription_required === "YES" && (
                                            <div className="absolute top-2 left-2 z-10 bg-white/95 backdrop-blur-md text-red-600 text-[8px] md:text-[9px] font-bold px-2 py-0.5 rounded-md border border-red-100/50 flex items-center gap-1 shadow-sm uppercase tracking-wider">
                                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> Rx
                                            </div>
                                        )}

                                        {/* Dynamic Stock State / Discount Tag Overlay */}
                                        {isOutOfStock ? (
                                            <div className="absolute top-2 right-2 z-10 bg-rose-50 text-rose-600 border border-rose-100 text-[8px] md:text-[9px] font-extrabold px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wider">
                                                Out of Stock
                                            </div>
                                        ) : (
                                            discountPercentVal > 0 && (
                                                <div className="absolute top-2 right-2 z-10 bg-emerald-600 text-white text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md uppercase tracking-tight">
                                                    {discountPercentVal}% OFF
                                                </div>
                                            )
                                        )}

                                        <img
                                            src={completeImgPath}
                                            alt={product.name}
                                            className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                                                isOutOfStock ? "grayscale opacity-50" : "group-hover:scale-105"
                                            }`}
                                            onError={(e) => {
                                                e.target.src = RANDOM_IMAGES[index % RANDOM_IMAGES.length];
                                            }}
                                        />
                                    </div>

                                    {/* Content Segment Data Layout */}
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className="text-[8px] md:text-[9px] font-bold text-emerald-600 mb-1.5 uppercase tracking-wide bg-emerald-50 w-fit px-2 py-0.5 rounded-md truncate max-w-full">
                                            {product.bread_crumb?.split('>').pop().trim() || activeCategory}
                                        </span>

                                        <h3 className={`text-[12px] md:text-[14px] font-bold text-slate-800 line-clamp-2 h-9 md:h-11 mb-1 leading-snug transition-colors ${
                                            isOutOfStock ? "text-slate-500" : "group-hover:text-emerald-600"
                                        }`}>
                                            {product.name}
                                        </h3>

                                        <p className="text-[10px] md:text-xs text-slate-400 mb-4 font-medium truncate max-w-full">
                                            {product.salt_composition && product.salt_composition !== 'N/A' ? product.salt_composition : (product.manufacturers || 'Standard Formulation')}
                                        </p>

                                        <div className="mt-auto">
                                            <div className="flex items-baseline justify-between mb-4 gap-2">
                                                <div className="flex items-baseline gap-1.5 flex-wrap">
                                                    <span className={`text-base md:text-xl font-extrabold tracking-tight ${isOutOfStock ? "text-slate-500" : "text-slate-900"}`}>
                                                        ₹{priceBest}
                                                    </span>
                                                    {priceMrp > priceBest && (
                                                        <span className="text-[10px] md:text-xs text-slate-300 line-through font-medium">₹{priceMrp}</span>
                                                    )}
                                                </div>
                                                <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 shrink-0 whitespace-nowrap">
                                                    {product.packaging || 'Pack'}
                                                </span>
                                            </div>

                                            <button
                                                disabled={isOutOfStock}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!isOutOfStock) handleProductClick(product._id);
                                                }}
                                                className={`w-full flex items-center justify-center gap-1.5 py-2.5 md:py-3.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md ${
                                                    isOutOfStock 
                                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                                                        : "bg-slate-900 hover:bg-emerald-600 text-white active:scale-95"
                                                }`}
                                            >
                                                <span>{isOutOfStock ? "Temporarily Unavailable" : "View Details"}</span>
                                                {!isOutOfStock && <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 mx-1 shadow-sm">
                        <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <ShoppingBag size={28} />
                        </div>
                        <h3 className="text-base font-bold text-slate-800">No products discovered</h3>
                        <p className="text-slate-400 text-xs mt-1 font-medium px-6">We couldn't track live matches under the currently selected parameters grid.</p>
                        <button
                            onClick={() => { setSearchTerm(""); handleCategorySelect("All"); }}
                            className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-600 transition-colors"
                        >
                            Reset All Filters
                        </button>
                    </div>
                )}

                {/* --- PAGINATION GRID SYSTEMS CONTROL --- */}
                {!loading && totalPages > 1 && (
                    <div className="mt-16 flex justify-center">
                        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl shadow-sm border border-slate-200/60">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg hover:bg-slate-50 disabled:opacity-20 text-slate-600 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <div className="flex items-center px-4 whitespace-nowrap">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                                    Page <span className="text-slate-900 text-sm font-extrabold mx-0.5">{currentPage}</span> of <span className="text-slate-900 text-sm font-extrabold mx-0.5">{totalPages}</span>
                                </span>
                            </div>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg hover:bg-slate-50 disabled:opacity-20 text-slate-600 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* --- TRUST FOOTER METRIC ROW --- */}
                <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[
                        { icon: <Info size={20} />, title: "100% Genuine", desc: "Sourced directly from authorized clinical pharmacy warehouses.", colors: "bg-emerald-50 text-emerald-600" },
                        { icon: <Stethoscope size={20} />, title: "Expert Verified", desc: "Checked and approved by certified licensed clinical pharmacists.", colors: "bg-blue-50 text-blue-600" },
                        { icon: <ShoppingCart size={20} />, title: "Secure Delivery", desc: "Fast, monitored, and strict temperature-controlled logistics.", colors: "bg-amber-50 text-amber-600" }
                    ].map((item, i) => (
                        <div key={i} className="group flex items-start gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${item.colors}`}>
                                {item.icon}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-xs md:text-sm uppercase tracking-tight">{item.title}</h4>
                                <p className="text-[11px] text-slate-400 mt-1 font-semibold leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx global>{`
                .mask-edge {
                    mask-image: linear-gradient(to right, black 92%, transparent 100%);
                    -webkit-mask-image: linear-gradient(to right, black 92%, transparent 100%);
                }
            `}</style>
        </div>
    );
}

export default AllPharmacyProducts;