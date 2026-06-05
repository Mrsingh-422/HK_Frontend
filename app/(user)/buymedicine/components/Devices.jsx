"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaStar, FaPlus, FaCheckCircle, FaChevronRight, FaMicrochip } from 'react-icons/fa';
import UserAPI from "@/app/services/UserAPI";

const Devices = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Professional Medical Device Dummy Images
    const dummyImages = [
        "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?q=80&w=500&auto=format&fit=crop", // Pulse Oximeter
        "https://images.unsplash.com/photo-1628595351029-c2bf17511435?q=80&w=500&auto=format&fit=crop", // BP Monitor
        "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=500&auto=format&fit=crop", // Digital Thermometer
        "https://images.unsplash.com/photo-1583947581924-860bda6a26df?q=80&w=500&auto=format&fit=crop", // Nebulizer
        "https://images.unsplash.com/photo-1603398938378-e54eab446f8a?q=80&w=500&auto=format&fit=crop", // Glucometer
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=500&auto=format&fit=crop", // Medical Tech
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=500&auto=format&fit=crop", // Infrared Thermometer
        "https://images.unsplash.com/photo-1619033582884-d2d1d394b9ca?q=80&w=500&auto=format&fit=crop"  // Smart Health Device
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                // Category: Devices, Page: 1, Limit: 8
                const response = await UserAPI.getNonPrescriptionProducts("Devices", 1, 8);

                if (response.success && response.data) {
                    const dataArray = Array.isArray(response.data) ? response.data :
                        response.data.medicineDetails ? [response.data.medicineDetails] : [];
                    setProducts(dataArray.slice(0, 8));
                }
            } catch (error) {
                console.error("Fetch Error:", error);
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
            <div className="bg-[#F8FAFC] py-24 flex justify-center items-center min-h-[420px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative flex items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-slate-800"></div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Devices</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#F8FAFC] py-16 px-4 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans'] overflow-hidden">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 px-1">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500 text-sm flex items-center gap-1.5 bg-slate-200/60 px-2.5 py-1 rounded-md font-semibold text-[11px] tracking-wide">
                                <FaMicrochip className="text-slate-600 text-[10px]" /> Precision Medical Gear
                            </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">Health Devices</h2>
                    </div>
                    {/* <button
                        onClick={() => router.push('/buymedicine/category/Devices')}
                        className="group flex items-center gap-1.5 text-slate-500 font-bold text-xs uppercase tracking-wider hover:text-slate-900 transition-colors duration-300 w-fit"
                    >
                        View Full Range
                        <FaChevronRight className="text-[9px] transform group-hover:translate-x-1 transition-transform duration-300" />
                    </button> */}
                </div>

                {/* Horizontal Scroll Area */}
                <div className="relative">
                    <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:bg-slate-300 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:rounded-full">
                        {products.length > 0 ? (
                            products.map((item, index) => (
                                <div
                                    key={item._id || index}
                                    onClick={() => handleProductClick(item._id)}
                                    className="min-w-[265px] md:min-w-[295px] max-w-[295px] bg-white border border-slate-200/60 rounded-2xl overflow-hidden group hover:border-slate-300 hover:shadow-[0_15px_40px_-10px_rgba(15,23,42,0.06)] transition-all duration-500 snap-start cursor-pointer flex flex-col"
                                >
                                    {/* Studio-Style Product Image */}
                                    <div className="relative aspect-square bg-slate-100/50 overflow-hidden flex items-center justify-center">
                                        {/* Rating & Discount Labels */}
                                        <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm border border-slate-100">
                                            <FaStar className="text-amber-400 text-[10px]" />
                                            <span className="text-[11px] font-bold text-slate-800">4.8</span>
                                        </div>

                                        {item.discont_percent && item.discont_percent !== "0%" && (
                                            <div className="absolute top-4 right-4 z-10 bg-slate-900 text-white px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide shadow-sm">
                                                {item.discont_percent} OFF
                                            </div>
                                        )}

                                        <img
                                            src={dummyImages[index % dummyImages.length]}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />

                                        <div className="absolute inset-0 bg-slate-950/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>

                                    {/* Product Details Area */}
                                    <div className="p-5 flex flex-col flex-1 bg-white">
                                        <div className="mb-3 space-y-1.5">
                                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                                                {item.manufacturers || 'Omni-Tech Diagnostics'}
                                            </p>
                                            <h3 className="font-bold text-slate-800 text-[15px] leading-snug tracking-tight h-11 line-clamp-2 group-hover:text-slate-900 transition-colors duration-300">
                                                {item.name}
                                            </h3>
                                            <p className="text-xs text-slate-400 font-medium">
                                                {item.packaging || 'Electronic Unit'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1.5 mb-5 border border-slate-100 w-fit px-2.5 py-0.5 rounded bg-slate-50">
                                            <FaCheckCircle className="text-slate-600 text-[10px]" />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                Clinic Grade
                                            </span>
                                        </div>

                                        {/* Price & Action */}
                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Sale Price</p>
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="text-xl font-extrabold text-slate-900 tracking-tight">₹{item.best_price}</span>
                                                    {item.mrp && (
                                                        <span className="text-xs text-slate-300 line-through font-medium">₹{item.mrp}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center hover:bg-slate-800 transition-all duration-300 shadow-sm active:scale-95 shrink-0"
                                            >
                                                <FaPlus size={11} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="w-full text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 mx-1 shadow-sm">
                                <div className="h-14 w-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FaMicrochip className="text-slate-300 text-xl" />
                                </div>
                                <p className="text-slate-700 font-bold text-sm tracking-wide">Stocking Devices...</p>
                                <p className="text-slate-400 text-xs mt-1">Our hardware diagnostic inventory is rendering short-term updates.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Devices;