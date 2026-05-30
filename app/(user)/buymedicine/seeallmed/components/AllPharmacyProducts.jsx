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
    ShoppingCart,
    Zap
} from 'lucide-react';
import UserAPI from '@/app/services/UserAPI';

// Updated to match your Postman URL: http://192.168.1.9:5002
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
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    const limit = 12;

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

    const handleProductClick = (productId) => {
        router.push(`/buymedicine/singleproductdetail/${productId}`);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10">

                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-10 gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            Showing <span className="text-slate-900">{activeCategory}</span>
                        </h2>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 font-bold text-[10px] md:text-xs w-fit shadow-sm">
                            {totalProducts} Items Available
                        </div>
                    </div>

                    <button className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[10px] font-black hover:border-[#08B36A] hover:text-[#08B36A] transition-all shadow-sm active:scale-95">
                        <Filter size={14} /> <span>SORT BY RELEVANCE</span>
                    </button>
                </div>

                {/* --- PRODUCT GRID --- */}
                {/* Updated Grid: grid-cols-2 (Phone), md:grid-cols-3 (Tablet), lg:grid-cols-4 (Laptop/Desktop) */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white aspect-[3/4.5] rounded-2xl md:rounded-[2rem] animate-pulse border border-slate-100 shadow-sm" />
                        ))}
                    </div>
                ) : displayedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
                        {displayedProducts.map((product, index) => {
                            const displayImage = RANDOM_IMAGES[index % RANDOM_IMAGES.length];

                            return (
                                <div
                                    key={product._id}
                                    onClick={() => handleProductClick(product._id)}
                                    className="group flex flex-col bg-white border border-slate-100 rounded-2xl md:rounded-[2.5rem] p-3 md:p-5 hover:shadow-[0_20px_50px_rgba(8,179,106,0.12)] hover:border-emerald-100/50 transition-all duration-500 cursor-pointer relative"
                                >
                                    {/* Image Area */}
                                    <div className="relative aspect-square w-full mb-4 bg-slate-50 rounded-xl md:rounded-3xl overflow-hidden shrink-0">
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                        {product.prescription_required === "YES" && (
                                            <div className="absolute top-2 left-2 z-10 bg-white/95 backdrop-blur-md text-red-600 text-[7px] md:text-[9px] font-black px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-lg border border-red-50 flex items-center gap-1 shadow-sm uppercase tracking-wider">
                                                <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" /> Rx
                                            </div>
                                        )}

                                        {product.discont_percent && parseInt(product.discont_percent) > 0 && (
                                            <div className="absolute top-2 right-2 z-10 bg-[#08B36A] text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-lg shadow-lg shadow-emerald-200 uppercase tracking-tighter">
                                                -{product.discont_percent}%
                                            </div>
                                        )}

                                        <img
                                            src={displayImage}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                        />
                                    </div>

                                    {/* Content Area */}
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className="text-[7px] md:text-[9px] font-black text-emerald-600 mb-1.5 uppercase tracking-wider bg-emerald-50 w-fit px-1.5 py-0.5 rounded-md">
                                            {product.bread_crumb?.split('>').pop().trim()}
                                        </span>
                                        <h3 className="text-[11px] md:text-[13px] lg:text-sm font-extrabold text-slate-800 line-clamp-2 h-8 md:h-10 mb-1 md:mb-2 leading-tight group-hover:text-[#08B36A] transition-colors uppercase">
                                            {product.name}
                                        </h3>
                                        <p className="text-[9px] md:text-[11px] text-slate-400 mb-4 font-medium line-clamp-1 italic">
                                            {product.salt_composition}
                                        </p>

                                        <div className="mt-auto">
                                            <div className="flex items-end justify-between mb-4">
                                                <div className="flex flex-col">
                                                    {parseInt(product.mrp) > parseInt(product.best_price) && (
                                                        <span className="text-[8px] md:text-[10px] text-slate-300 line-through font-bold">₹{product.mrp}</span>
                                                    )}
                                                    <span className="text-sm md:text-lg lg:text-xl font-black text-slate-900 tracking-tight">₹{product.best_price}</span>
                                                </div>
                                                <span className="text-[7px] md:text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">
                                                    {product.packaging}
                                                </span>
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleProductClick(product._id);
                                                }}
                                                className="w-full flex items-center justify-center gap-1.5 md:gap-2 bg-[#08B36A] hover:bg-slate-900 text-white py-2.5 md:py-3.5 rounded-xl text-[9px] md:text-[11px] font-black transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(8,179,106,0.3)] active:scale-95"
                                            >
                                                VIEW DETAILS <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-16 md:py-24 text-center bg-white rounded-3xl md:rounded-[3rem] border-2 border-dashed border-slate-200 mx-1">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 text-slate-300">
                            <ShoppingBag size={40} />
                        </div>
                        <h3 className="text-lg md:text-xl font-black text-slate-800">No products found</h3>
                        <p className="text-slate-400 text-xs md:text-sm mt-2 font-medium px-6">Try refining your search or change the category.</p>
                        <button onClick={() => { setSearchTerm(""); setActiveCategory("All"); }} className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-[#08B36A] transition-colors">
                            Reset All Filters
                        </button>
                    </div>
                )}

                {/* --- PAGINATION --- */}
                {!loading && totalPages > 1 && (
                    <div className="mt-12 md:mt-20 flex justify-center">
                        <div className="flex items-center gap-1 md:gap-2 bg-white p-1.5 md:p-2 rounded-2xl shadow-sm border border-slate-100">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 md:p-3 rounded-xl hover:bg-slate-50 disabled:opacity-20 text-slate-600 transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <div className="flex items-center px-4 md:px-8 whitespace-nowrap">
                                <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-tighter">
                                    Page <span className="text-slate-900 text-xs md:text-base mx-1">{currentPage}</span> of <span className="text-slate-900 text-xs md:text-base mx-1">{totalPages}</span>
                                </span>
                            </div>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 md:p-3 rounded-xl hover:bg-slate-50 disabled:opacity-20 text-slate-600 transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* --- TRUST FOOTER --- */}
                <div className="mt-16 md:mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                    {[
                        { icon: <Info size={24} />, title: "100% Genuine", desc: "Sourced directly from authorized partners.", color: "emerald" },
                        { icon: <Stethoscope size={24} />, title: "Expert Verified", desc: "Checked by certified clinical pharmacists.", color: "blue" },
                        { icon: <ShoppingCart size={24} />, title: "Secure Delivery", desc: "Fast, tracked and temperature controlled.", color: "orange" }
                    ].map((item, i) => (
                        <div key={i} className="group flex items-start gap-5 p-6 md:p-8 bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-100 hover:border-emerald-100/50 transition-all duration-300">
                            <div className={`w-12 h-12 bg-${item.color}-50 rounded-2xl flex items-center justify-center text-${item.color}-500 shrink-0 group-hover:scale-110 transition-transform`}>
                                {item.icon}
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 text-xs md:text-sm uppercase tracking-tight">{item.title}</h4>
                                <p className="text-[10px] md:text-xs text-slate-400 mt-1.5 font-semibold leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .mask-edge {
                    mask-image: linear-gradient(to right, black 85%, transparent 100%);
                }
            `}</style>
        </div>
    );
}

export default AllPharmacyProducts;