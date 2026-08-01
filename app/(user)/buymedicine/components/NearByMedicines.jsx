"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPills, FaStar, FaMapMarkerAlt, FaPlus, FaCalendarAlt } from 'react-icons/fa';
import UserAPI from '@/app/services/UserAPI';

const NearByMedicines = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Static image as requested
    const STATIC_MEDICINE_IMAGE = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQam2-MPWslkoAp2wbGLZBigue9gbmlAab4Mw&s";

    useEffect(() => {
        const fetchNearbyMedicines = async () => {
            try {
                setLoading(true);
                const res = await UserAPI.getNonPrescriptionProducts("Medicines");

                if (res?.success && res.data) {
                    let extractedData = [];

                    // Direct support for the nested response payload architecture
                    if (res.data.medicineDetails) {
                        extractedData = Array.isArray(res.data.medicineDetails)
                            ? res.data.medicineDetails
                            : [res.data.medicineDetails];
                    } else if (Array.isArray(res.data)) {
                        extractedData = res.data;
                    }

                    setMedicines(extractedData);
                }
            } catch (error) {
                console.error("Error fetching trending medicines:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNearbyMedicines();
    }, []);

    const handleProductClick = (id) => {
        router.push(`/buymedicine/singleproductdetail/${id}`);
    };

    if (loading) {
        return (
            <div className="bg-[#FAFBFD] py-24 flex justify-center items-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500/20 border-t-emerald-600"></div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest animate-pulse">Scanning Nearby Warehouses</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#FAFBFD] py-16 px-4 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans'] overflow-hidden">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 px-1">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border border-emerald-100 animate-pulse">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span> Instant Delivery
                            </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Medicines Near You</h2>
                        <p className="text-slate-500 text-sm max-w-xl">Get your essential medicines delivered instantly from verified healthcare hubs matching your area code.</p>
                    </div>
                    <button
                        onClick={() => router.push('/buymedicine/seeallmed')}
                        className="text-slate-500 font-bold text-xs uppercase tracking-wider hover:text-slate-900 transition-colors shrink-0 pb-1 border-b border-dashed border-slate-300 hover:border-slate-900">
                        View All Stores
                    </button>
                </div>

                {/* Horizontal Scroll Section */}
                <div className="relative">
                    <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:rounded-full">
                        {medicines.slice(0, 10).map((med, index) => {
                            // Safe fallbacks parsing string values returned natively by database engines
                            const basePrice = parseFloat(med.best_price || med.bestPrice || 0);
                            const marketPrice = parseFloat(med.mrp || 0);
                            const activeDiscount = med.discont_percent || (med.discount ? `${med.discount}%` : null);

                            return (
                                <div
                                    key={med._id || index}
                                    onClick={() => handleProductClick(med._id)}
                                    className="min-w-[265px] md:min-w-[295px] max-w-[295px] bg-white border border-slate-100 rounded-3xl overflow-hidden group hover:border-transparent hover:shadow-[0_22px_50px_rgba(148,163,184,0.12)] transition-all duration-500 snap-start cursor-pointer flex flex-col"
                                >
                                    {/* Image & Badges */}
                                    <div className="relative aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
                                        <div className="absolute top-4 left-4 z-10">
                                            <span className="bg-white/80 backdrop-blur-md border border-white/40 px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-800 flex items-center gap-1 shadow-sm">
                                                <FaStar className="text-amber-400 text-[11px]" /> 4.8
                                            </span>
                                        </div>

                                        {activeDiscount && activeDiscount !== "0%" && (
                                            <div className="absolute top-4 right-4 z-10">
                                                <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide shadow-sm">
                                                    {activeDiscount} OFF
                                                </span>
                                            </div>
                                        )}

                                        {/* Medicine Image */}
                                        <img
                                            src={STATIC_MEDICINE_IMAGE}
                                            alt={med.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 flex flex-col flex-1 bg-white">
                                        <div className="mb-3 space-y-1">
                                            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider truncate">
                                                {med.manufacturers || 'Trending Formulation'}
                                            </p>
                                            <h3 className="font-bold text-slate-800 text-[15px] leading-snug tracking-tight h-11 line-clamp-2 group-hover:text-emerald-700 transition-colors duration-300">
                                                {med.name}
                                            </h3>
                                            <p className="text-xs text-slate-400 font-medium truncate">
                                                {med.salt_composition && med.salt_composition !== 'N/A' ? med.salt_composition : (med.packaging || 'Standard Pack')}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1.5 mb-5 bg-slate-50 w-fit px-2.5 py-1 rounded-full border border-slate-100/50">
                                            <FaMapMarkerAlt className="text-slate-400 text-[10px]" />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                                Nearby Hub
                                            </span>
                                        </div>

                                        {/* Pricing block */}
                                        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Retail Price</p>
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="text-lg font-extrabold text-slate-900">₹{basePrice}</span>
                                                    {marketPrice > basePrice && (
                                                        <span className="text-xs text-slate-300 line-through font-medium">₹{marketPrice}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                                className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-all duration-300 shadow-md hover:shadow-emerald-100 active:scale-95 shrink-0"
                                            >
                                                <FaPlus size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {medicines.length === 0 && !loading && (
                    <div className="w-full text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 mx-1 shadow-sm">
                        <div className="h-14 w-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <FaPills className="text-slate-300 text-xl" />
                        </div>
                        <p className="text-slate-700 font-bold text-sm tracking-wide">Out of Coverage Area</p>
                        <p className="text-slate-400 text-xs mt-1">No operational pharmacies were recognized inside your immediate grid perimeter.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default NearByMedicines;