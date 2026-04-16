"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  FaChevronRight, 
  FaChevronLeft, 
  FaStar, 
  FaHeart, 
  FaPlus,
  FaCheckCircle,
  FaTruck,
  FaLock
} from "react-icons/fa"; 
import UserAPI from '@/app/services/UserAPI';

const RANDOM_IMAGES = [
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=500&auto=format&fit=crop",
    "https://m.media-amazon.com/images/I/71S2lC+1icL.jpg",
    "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=500&auto=format&fit=crop",
    "https://cdn.pixabay.com/photo/2020/10/02/09/01/tablets-5620566_1280.jpg",
    "https://media.istockphoto.com/id/538184814/photo/maple-syrup-in-glass-bottle-on-wooden-table.jpg?s=612x612&w=0&k=20&c=otZW1nqNfVGroXScQR3jG3wwZYe28IWqufZw94lHHnA=",
    "https://images.unsplash.com/photo-1628771065518-0d82f1938462?q=80&w=500&auto=format&fit=crop"
];

export default function MedicineComponent() {
    const router = useRouter();
    const scrollRef = useRef(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            // Fetching a small limit for the featured section
            const res = await UserAPI.getPharmacyProductsAll({
                page: 1,
                limit: 10
            });

            if (res && res.success) {
                setProducts(res.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch featured medicines:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
        }
    };

    const handleProductClick = (productId) => {
        router.push(`/buymedicine/singleproductdetail/${productId}`);
    };

    return (
        <section className="py-16 bg-[#F8FAFC]">
            <div className="max-w-7xl mx-auto px-4 md:px-6">

                {/* --- HEADER --- */}
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <span className="h-1 w-8 bg-[#08B36A] rounded-full"></span>
                             <span className="text-[10px] font-bold text-[#08B36A] uppercase tracking-[2px]">Trusted Pharmacy</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                            Featured Medicines
                        </h2>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex gap-2">
                            <button onClick={() => scroll('left')} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-600 cursor-pointer shadow-sm">
                                <FaChevronLeft size={14}/>
                            </button>
                            <button onClick={() => scroll('right')} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-600 cursor-pointer shadow-sm">
                                <FaChevronRight size={14}/>
                            </button>
                        </div>
                        <button 
                            onClick={() => router.push("/buymedicine/seeallmed")}
                            className="text-xs font-bold text-white bg-slate-900 px-5 py-2.5 rounded-xl hover:bg-[#08B36A] transition-all cursor-pointer shadow-lg shadow-slate-200"
                        >
                            VIEW ALL
                        </button>
                    </div>
                </div>

                {/* --- HORIZONTAL SCROLL --- */}
                <div 
                    ref={scrollRef}
                    className="flex flex-nowrap overflow-x-auto gap-5 pb-8 scrollbar-hide snap-x snap-mandatory pt-2"
                >
                    {loading ? (
                        // Loader Skeleton
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-[200px] md:w-[240px] h-[380px] bg-white border border-slate-100 rounded-[24px] animate-pulse" />
                        ))
                    ) : (
                        products.map((med, index) => {
                            const displayImage = RANDOM_IMAGES[index % RANDOM_IMAGES.length];
                            
                            return (
                                <div
                                    key={med._id}
                                    onClick={() => handleProductClick(med._id)}
                                    className="flex-shrink-0 w-[200px] md:w-[240px] snap-start group bg-white border border-slate-100 rounded-[24px] p-4 flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-1 relative cursor-pointer"
                                >

                                    {/* Discount Badge */}
                                    {med.discont_percent && (
                                        <div className="absolute top-4 left-4 z-10">
                                            <span className="bg-[#08B36A] text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-md shadow-emerald-500/20 uppercase">
                                                {med.discont_percent} OFF
                                            </span>
                                        </div>
                                    )}

                                    {/* Image Section */}
                                    <div className="relative mb-4 aspect-square rounded-2xl bg-[#F1F5F9] overflow-hidden">
                                        <img
                                            src={displayImage}
                                            alt={med.name}
                                            className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>

                                    {/* Info Section */}
                                    <div className="flex flex-col flex-grow">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <div className="flex items-center bg-amber-50 px-2 py-0.5 rounded-md text-amber-600 gap-1 border border-amber-100">
                                                <FaStar size={10} />
                                                <span className="text-[11px] font-bold">4.7</span>
                                            </div>
                                            <span className="text-[11px] text-slate-400 font-medium">1.2k reviews</span>
                                        </div>

                                        <h3 className="text-sm md:text-base font-bold text-slate-900 line-clamp-1 mb-0.5">
                                            {med.name}
                                        </h3>
                                        <p className="text-[11px] text-slate-500 font-semibold mb-4">
                                            By {med.manufacturers}
                                        </p>

                                        {/* Pricing & Add Button */}
                                        <div className="mt-auto flex items-center justify-between gap-2">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-400 line-through font-medium">₹{med.mrp}</span>
                                                <span className="text-lg font-black text-slate-900">₹{med.best_price}</span>
                                            </div>

                                            <button 
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-2 bg-[#08B36A] text-white px-4 py-2.5 rounded-xl text-xs font-black hover:bg-slate-900 transition-all active:scale-90 shadow-lg shadow-emerald-500/20 cursor-pointer"
                                            >
                                                <FaPlus size={10} /> ADD
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* --- TRUST BAR --- */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TrustItem 
                        icon={<FaCheckCircle className="text-emerald-600" size={20}/>} 
                        title="100% Authentic" 
                        desc="Products sourced directly" 
                    />
                    <TrustItem 
                        icon={<FaTruck className="text-emerald-600" size={20}/>} 
                        title="Express Delivery" 
                        desc="Safe & on-time home delivery" 
                    />
                    <TrustItem 
                        icon={<FaLock className="text-emerald-600" size={20}/>} 
                        title="Secure Checkout" 
                        desc="Encrypted payment processing" 
                    />
                </div>

                <style jsx>{`
                    .scrollbar-hide::-webkit-scrollbar { display: none; }
                    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>
            </div>
        </section>
    );
}

function TrustItem({ icon, title, desc }) {
    return (
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                {icon}
            </div>
            <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
        </div>
    );
}