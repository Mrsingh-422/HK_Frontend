"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaStar, FaPlus, FaLeaf, FaCheckCircle } from 'react-icons/fa';
import UserAPI from "@/app/services/UserAPI";

const WomenCareProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // High-quality dummy images for a medical/skincare look
    const dummyImages = [
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400&auto=format&fit=crop"
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                // Category: Women Care, Page: 1, Limit: 7
                const response = await UserAPI.getNonPrescriptionProducts("Women Care", 1, 7);
                
                if (response.success && response.data) {
                    // Handling both standard array response and the medicineDetails nested structure
                    let dataArray = [];
                    if (Array.isArray(response.data)) {
                        dataArray = response.data;
                    } else if (response.data.medicineDetails) {
                        dataArray = [response.data.medicineDetails];
                    }
                    
                    setProducts(dataArray.slice(0, 7)); // Strictly only 7 products
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleProductClick = (id) => {
        router.push(`/buymedicine/singleproductdetail/${id}`);
    };

    if (loading) {
        return (
            <div className="bg-[#FAFBFD] py-20 px-4 flex justify-center items-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-500/20 border-t-emerald-600"></div>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest animate-pulse">Loading Essentials</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#FAFBFD] py-14 px-4 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans'] overflow-hidden">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex justify-between items-end mb-10 px-1">
                    <div>
                        <span className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Specially Curated</span>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">Women Care</h2>
                    </div>
                    <button 
                        onClick={() => router.push('/buymedicine/category/Women Care')}
                        className="bg-white border border-slate-200/80 px-5 py-2.5 rounded-xl text-slate-700 font-semibold text-xs tracking-wide hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                        View All
                    </button>
                </div>

                {/* Horizontal Scroll Section */}
                <div className="relative group/container">
                    <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:rounded-full">
                        {products.length > 0 ? (
                            products.map((item, index) => (
                                <div
                                    key={item._id || index}
                                    onClick={() => handleProductClick(item._id)}
                                    className="min-w-[260px] md:min-w-[290px] max-w-[290px] bg-white border border-slate-100 rounded-3xl overflow-hidden group hover:border-transparent hover:shadow-[0_20px_50px_rgba(148,163,184,0.15)] transition-all duration-500 snap-start cursor-pointer flex flex-col"
                                >
                                    {/* Image Container with Dummy Images */}
                                    <div className="relative aspect-[4/4.5] bg-slate-50 flex items-center justify-center overflow-hidden">
                                        <div className="absolute top-4 left-4 z-10">
                                            <span className="bg-white/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-800 flex items-center gap-1 shadow-sm border border-white/40">
                                                <FaStar className="text-amber-400 text-xs" /> 4.8
                                            </span>
                                        </div>

                                        {item.discont_percent && item.discont_percent !== "0%" && (
                                            <div className="absolute top-4 right-4 z-10">
                                                <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide shadow-sm">
                                                    {item.discont_percent} OFF
                                                </span>
                                            </div>
                                        )}

                                        <img
                                            src={dummyImages[index % dummyImages.length]}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                        
                                        {/* Soft elegant gradient layer overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-5 flex flex-col flex-1 bg-white">
                                        <div className="mb-3">
                                            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1.5 truncate">
                                                {item.manufacturers || 'Premium Healthcare'}
                                            </p>
                                            <h3 className="font-bold text-slate-800 text-[15px] leading-snug line-clamp-2 h-11 group-hover:text-emerald-700 transition-colors duration-300">
                                                {item.name}
                                            </h3>
                                            <p className="text-xs text-slate-400 font-medium mt-1.5 truncate">
                                                {item.packaging || 'Standard Pack'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1.5 mb-5">
                                            <FaCheckCircle className="text-emerald-500 text-xs shrink-0" />
                                            <span className="text-[11px] font-semibold text-slate-500 tracking-wide">
                                                Verified Quality
                                            </span>
                                        </div>

                                        {/* Pricing & CTA */}
                                        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Our Price</p>
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="text-lg font-extrabold text-slate-900">₹{item.best_price}</span>
                                                    {item.mrp && (
                                                        <span className="text-xs text-slate-300 line-through font-medium">₹{item.mrp}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-all duration-300 shadow-md hover:shadow-emerald-100 active:scale-95 shrink-0"
                                            >
                                                <FaPlus size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="w-full text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 mx-1 shadow-sm">
                                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaLeaf className="text-slate-300 text-2xl" />
                                </div>
                                <p className="text-slate-700 font-bold text-sm tracking-wide">Restocking Soon</p>
                                <p className="text-slate-400 text-xs mt-1">We are updating our medical essentials library.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WomenCareProducts;