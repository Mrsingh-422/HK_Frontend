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
            <div className="max-w-7xl mx-auto px-6 pt-10">

                {/* --- HEADER SECTION --- */}

                <div className="flex items-center justify-between mb-8 px-2">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                        Showing <span className="text-slate-900">{activeCategory}</span>
                        <span className="ml-2 px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-500 font-bold tracking-normal">{totalProducts} Items</span>
                    </h2>
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-[10px] font-black cursor-pointer hover:border-[#08B36A] hover:text-[#08B36A] transition-all shadow-sm">
                        <Filter size={14} /> <span>SORT BY RELEVANCE</span>
                    </div>
                </div>

                {/* --- PRODUCT GRID --- */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white aspect-[3/4] rounded-[2rem] animate-pulse border border-slate-100 shadow-sm" />
                        ))}
                    </div>
                ) : displayedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
                        {displayedProducts.map((product, index) => {
                            const displayImage = RANDOM_IMAGES[index % RANDOM_IMAGES.length];

                            return (
                                <div
                                    key={product._id}
                                    onClick={() => handleProductClick(product._id)}
                                    className="group flex flex-col bg-white border border-slate-100 rounded-[2rem] p-5 hover:shadow-[0_20px_50px_rgba(8,179,106,0.12)] hover:border-emerald-100/50 transition-all duration-500 cursor-pointer relative"
                                >
                                    <div className="relative aspect-square w-full mb-6 bg-slate-50 rounded-3xl overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                        {product.prescription_required === "YES" && (
                                            <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md text-red-600 text-[9px] font-black px-2.5 py-1 rounded-xl border border-red-50 flex items-center gap-1 shadow-sm uppercase tracking-wider">
                                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> Rx Required
                                            </div>
                                        )}

                                        {product.discont_percent && parseInt(product.discont_percent) > 0 && (
                                            <div className="absolute top-3 right-3 z-10 bg-[#08B36A] text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl shadow-lg shadow-emerald-200 uppercase tracking-tighter">
                                                -{product.discont_percent}%
                                            </div>
                                        )}

                                        <img
                                            src={displayImage}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                        />
                                    </div>

                                    <div className="flex flex-col flex-1">
                                        <span className="text-[9px] font-black text-emerald-600 mb-2 uppercase tracking-[0.15em] bg-emerald-50 w-fit px-2 py-0.5 rounded-lg">
                                            {product.bread_crumb?.split('>').pop().trim()}
                                        </span>
                                        <h3 className="text-sm font-extrabold text-slate-800 line-clamp-2 h-10 mb-2 leading-tight group-hover:text-[#08B36A] transition-colors">
                                            {product.name}
                                        </h3>
                                        <p className="text-[11px] text-slate-400 mb-6 font-medium line-clamp-1 italic">
                                            {product.salt_composition}
                                        </p>

                                        <div className="mt-auto">
                                            <div className="flex items-end justify-between mb-5">
                                                <div className="flex flex-col">
                                                    {parseInt(product.mrp) > parseInt(product.best_price) && (
                                                        <span className="text-[10px] text-slate-300 line-through font-bold">₹{product.mrp}</span>
                                                    )}
                                                    <span className="text-xl font-black text-slate-900 tracking-tight">₹{product.best_price}</span>
                                                </div>
                                                <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                                    {product.packaging}
                                                </span>
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleProductClick(product._id);
                                                }}
                                                className="w-full flex items-center justify-center gap-2 bg-[#08B36A] hover:bg-slate-900 text-white py-3.5 rounded-[1.25rem] text-xs font-black transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(8,179,106,0.3)] hover:shadow-none hover:translate-y-px"
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
                    <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <ShoppingBag size={40} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800">No products found</h3>
                        <p className="text-slate-400 text-sm mt-2 font-medium">Try refining your search or change the category.</p>
                        <button onClick={() => { setSearchTerm(""); setActiveCategory("All"); }} className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#08B36A] transition-colors">
                            Reset All Filters
                        </button>
                    </div>
                )}

                {/* --- PAGINATION --- */}
                {!loading && totalPages > 1 && (
                    <div className="mt-20 flex justify-center">
                        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-[0_5px_15px_rgba(0,0,0,0.03)] border border-slate-100">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-3 rounded-xl hover:bg-slate-50 disabled:opacity-20 text-slate-600 transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <div className="flex items-center px-6">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">
                                    Page <span className="text-slate-900 text-sm mx-1">{currentPage}</span> of <span className="text-slate-900 text-sm mx-1">{totalPages}</span>
                                </span>
                            </div>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-3 rounded-xl hover:bg-slate-50 disabled:opacity-20 text-slate-600 transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* --- TRUST FOOTER --- */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: <Info />, title: "100% Genuine", desc: "Sourced directly from authorized partners.", color: "emerald" },
                        { icon: <Stethoscope />, title: "Expert Verified", desc: "Checked by certified clinical pharmacists.", color: "blue" },
                        { icon: <ShoppingCart />, title: "Secure Delivery", desc: "Fast, tracked and temperature controlled.", color: "orange" }
                    ].map((item, i) => (
                        <div key={i} className="group flex items-start gap-5 p-8 bg-white rounded-[2rem] border border-slate-100 hover:border-emerald-100/50 transition-all duration-300">
                            <div className={`w-12 h-12 bg-${item.color}-50 rounded-2xl flex items-center justify-center text-${item.color}-500 shrink-0 group-hover:scale-110 transition-transform`}>
                                {item.icon}
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">{item.title}</h4>
                                <p className="text-xs text-slate-400 mt-1 font-semibold leading-relaxed">{item.desc}</p>
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