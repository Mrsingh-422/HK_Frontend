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
    ChevronRight as ChevronRightIcon,
    ArrowRight,
    ShoppingCart
} from 'lucide-react';
import UserAPI from '@/app/services/UserAPI';

// Updated to match your Postman URL: http://192.168.1.9:5002
// const BACKEND_URL = "http://192.168.1.9:5002";/
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const RANDOM_IMAGES = [
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=500&auto=format&fit=crop",
    "https://m.media-amazon.com/images/I/71S2lC+1icL.jpg",
    "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=500&auto=format&fit=crop",
    "https://cdn.pixabay.com/photo/2020/10/02/09/01/tablets-5620566_1280.jpg",
    "https://media.istockphoto.com/id/538184814/photo/maple-syrup-in-glass-bottle-on-wooden-table.jpg?s=612x612&w=0&k=20&c=otZW1nqNfVGroXScQR3jG3wwZYe28IWqufZw94lHHnA=",
    "https://images.unsplash.com/photo-1628771065518-0d82f1938462?q=80&w=500&auto=format&fit=crop"
];

function AllPharmacyProducts() {
    const router = useRouter();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    const limit = 12;

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await UserAPI.getPharmacyCategories();
                if (res && res.success) {
                    // Prepend "All" category
                    const allCat = {
                        name: "All",
                        productCount: null,
                        image: "https://cdn-icons-png.flaticon.com/512/822/822143.png"
                    };
                    setCategories([allCat, ...res.data]);
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, []);

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
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, activeCategory]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const displayedProducts = useMemo(() => {
        if (activeCategory === "All") return products;
        return products.filter(product =>
            product.bread_crumb && product.bread_crumb.startsWith(activeCategory)
        );
    }, [products, activeCategory]);

    const handleFilterChange = (type, value) => {
        if (type === 'category') setActiveCategory(value);
        if (type === 'search') setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleProductClick = (productId) => {
        router.push(`/buymedicine/singleproductdetail/${productId}`);
    };

    // Robust Image Helper specifically for http://192.168.1.9:5002/
    const getCategoryImage = (path) => {
        if (!path) return "https://cdn-icons-png.flaticon.com/512/822/822143.png";

        // If it's already a full URL
        if (path.startsWith("http")) return path;

        // Ensure path starts with a slash if it doesn't have one, but check if we need to remove duplicate slashes
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${BACKEND_URL}${cleanPath}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            <div className="max-w-7xl mx-auto px-4 pt-8">

                {/* --- HEADER SECTION --- */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Pharmacy Store</h1>
                            <div className="flex items-center gap-2 text-gray-500 mt-1 text-sm">
                                <span>Home</span>
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
                                placeholder="Search medicines, brands..."
                                value={searchTerm}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />
                            {searchTerm && (
                                <button onClick={() => handleFilterChange('search', "")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* --- CATEGORY SELECTOR (Circular with Text & Count Below) --- */}
                    <div className="mt-10 border-t border-gray-100 pt-8">
                        <div className="flex items-start gap-8 overflow-x-auto pb-6 no-scrollbar">
                            {categories.map((cat) => (
                                <button
                                    key={cat.name}
                                    onClick={() => handleFilterChange('category', cat.name)}
                                    className="flex flex-col items-center min-w-[90px] group transition-all"
                                >
                                    {/* Circular Image Wrapper */}
                                    <div className={`relative w-20 h-20 rounded-full flex items-center justify-center mb-2 transition-all duration-300 border-2 ${activeCategory === cat.name
                                        ? "border-[#08B36A] bg-green-50 scale-110 shadow-lg shadow-green-100"
                                        : "border-gray-100 bg-white group-hover:border-[#08B36A]/50"
                                        }`}>
                                        <div className="w-full h-full rounded-full overflow-hidden bg-white">
                                            <img
                                                src={getCategoryImage(cat.image)}
                                                alt={cat.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/822/822143.png" }}
                                            />
                                        </div>
                                    </div>

                                    {/* Name and Count Below */}
                                    <div className="flex flex-col items-center gap-0.5">
                                        <span className={`text-[11px] md:text-xs font-bold text-center leading-tight transition-colors ${activeCategory === cat.name ? "text-[#08B36A]" : "text-gray-600 group-hover:text-[#08B36A]"
                                            }`}>
                                            {cat.name}
                                        </span>
                                        {cat.productCount !== null && (
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                {cat.productCount} Items
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- RESULTS INFO --- */}
                <div className="flex items-center justify-between mb-6 px-1">
                    <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        {activeCategory} <span className="ml-1 text-gray-400">({totalProducts} items)</span>
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
                ) : displayedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {displayedProducts.map((product, index) => {
                            const displayImage = RANDOM_IMAGES[index % RANDOM_IMAGES.length];

                            return (
                                <div
                                    key={product._id}
                                    onClick={() => handleProductClick(product._id)}
                                    className="group flex flex-col bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-xl hover:border-[#08B36A]/30 transition-all duration-300 cursor-pointer"
                                >
                                    <div className="relative aspect-square w-full mb-4 bg-gray-50 rounded-xl overflow-hidden">
                                        {product.prescription_required === "YES" && (
                                            <div className="absolute top-2 left-2 z-10 bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded border border-red-100">
                                                Rx Required
                                            </div>
                                        )}

                                        {product.discont_percent && parseInt(product.discont_percent) > 0 && (
                                            <div className="absolute top-2 right-2 z-10 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                                {product.discont_percent}% OFF
                                            </div>
                                        )}

                                        <img
                                            src={displayImage}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>

                                    <div className="flex flex-col flex-1">
                                        <p className="text-[10px] font-bold text-[#08B36A] mb-1 uppercase tracking-wider">
                                            {product.bread_crumb?.split('>').pop().trim()}
                                        </p>
                                        <h3 className="text-sm font-bold text-gray-800 line-clamp-2 h-10 mb-1 leading-snug">
                                            {product.name}
                                        </h3>
                                        <p className="text-xs text-gray-400 mb-4 line-clamp-1">
                                            {product.salt_composition}
                                        </p>

                                        <div className="mt-auto">
                                            <div className="flex items-baseline gap-2 mb-4">
                                                <span className="text-lg font-bold text-gray-900">₹{product.best_price}</span>
                                                {parseInt(product.mrp) > parseInt(product.best_price) && (
                                                    <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded w-fit">
                                                    {product.packaging}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleProductClick(product._id);
                                                    }}
                                                    className="w-full flex items-center justify-center gap-2 bg-[#08B36A] hover:bg-[#069c5a] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                                                >
                                                    View Details <ArrowRight size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-300">
                        <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
                        <h3 className="text-lg font-bold text-gray-800">No products found</h3>
                        <p className="text-gray-500 text-sm mt-1">Try refining your search or category.</p>
                        <button onClick={() => { setSearchTerm(""); setActiveCategory("All"); }} className="mt-6 text-[#08B36A] font-bold text-sm hover:underline">
                            Clear all filters
                        </button>
                    </div>
                )}

                {/* --- PAGINATION --- */}
                {!loading && totalPages > 1 && (
                    <div className="mt-16 flex justify-center">
                        <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl shadow-sm border border-gray-200">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg hover:bg-gray-50 disabled:opacity-30 text-gray-500"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <div className="flex items-center px-4">
                                <span className="text-sm font-bold text-gray-700">
                                    Page {currentPage} <span className="text-gray-300 mx-2">of</span> {totalPages}
                                </span>
                            </div>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg hover:bg-gray-50 disabled:opacity-30 text-gray-500"
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
                            <h4 className="font-bold text-gray-800 text-sm">100% Genuine</h4>
                            <p className="text-xs text-gray-500 mt-1">Sourced directly from authorized distributors.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 shrink-0"><Stethoscope size={20} /></div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">Expert Verified</h4>
                            <p className="text-xs text-gray-500 mt-1">All products are quality checked by pharmacists.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 shrink-0"><ShoppingCart size={20} /></div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">Secure Delivery</h4>
                            <p className="text-xs text-gray-500 mt-1">Fast and safe delivery to your doorstep.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AllPharmacyProducts;