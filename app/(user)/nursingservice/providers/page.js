"use client";

import React, { useEffect, useState, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
    FaArrowLeft, 
    FaStar, 
    FaBriefcase, 
    FaMapMarkerAlt, 
    FaChevronRight, 
    FaShieldAlt,
    FaStore,
    FaRoute,
    FaRegCommentDots,
    FaTag,
    FaCheckCircle,
    FaFire
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.7:5002";

// Helper to determine the minimum price of a provider for accurate sorting
const getProviderMinPrice = (provider) => {
    const p = provider.pricing;
    const candidates = [];
    if (typeof p?.oneDay?.final === "number" && p.oneDay.final > 0) candidates.push(p.oneDay.final);
    if (typeof p?.hourly?.final === "number" && p.hourly.final > 0) candidates.push(p.hourly.final);
    if (typeof p?.multipleDays?.final === "number" && p.multipleDays.final > 0) candidates.push(p.multipleDays.final);
    if (typeof provider.basePrice === "number" && provider.basePrice > 0) candidates.push(provider.basePrice);
    
    return candidates.length > 0 ? Math.min(...candidates) : (p?.oneDay?.base || 999999);
};

function ProvidersListContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Query parameters matching updated routing
    const serviceId = searchParams.get("serviceId") || "";
    const subCategory = searchParams.get("subCategory") || searchParams.get("title") || "Nursing Care";

    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userCoords, setUserCoords] = useState({ lat: null, lng: null });

    // Optional: Get user coordinates for accurate distance calculation
    useEffect(() => {
        if (typeof window !== "undefined" && "geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserCoords({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    });
                },
                (err) => {
                    console.log("Geolocation permission unavailable:", err.message);
                },
                { timeout: 5000 }
            );
        }
    }, []);

    useEffect(() => {
        const fetchProviders = async () => {
            if (!serviceId && !subCategory) return;
            try {
                setLoading(true);
                const res = await UserAPI.getProvidersForService({
                    serviceId,
                    subCategory,
                    userLat: userCoords.lat,
                    userLng: userCoords.lng
                });
                if (res?.success) {
                    const rawData = res.data || [];
                    // Sort providers so the cheapest provider is at the top (ascending order)
                    const sortedProviders = [...rawData].sort((a, b) => {
                        return getProviderMinPrice(a) - getProviderMinPrice(b);
                    });
                    setProviders(sortedProviders);
                }
            } catch (err) {
                console.error("Error fetching providers for nursing service:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProviders();
    }, [serviceId, subCategory, userCoords.lat, userCoords.lng]);

    // Find the minimum price among all providers to highlight the cheapest
    const lowestPrice = useMemo(() => {
        if (!providers || providers.length === 0) return 0;
        return Math.min(...providers.map(p => getProviderMinPrice(p)));
    }, [providers]);

    const handleSelectProvider = (provider) => {
        const bookingInitiation = {
            nurseId: provider.nurseId || provider.nurseDetails?._id,
            serviceId: provider.serviceId || provider._id,
            masterServiceId: provider.masterServiceId || serviceId,
            serviceDetails: {
                title: provider.serviceTitle || subCategory,
                description: provider.serviceDescription || "",
                type: "Service",
                duration: "Per Visit",
                basePrice: provider.pricing?.oneDay?.final || provider.pricing?.oneDay?.base || 0,
                procedureIncluded: "Standard Clinical Care Procedure"
            },
            pricing: provider.pricing,
            basePrice: provider.pricing?.oneDay?.final || 0,
            nurseName: provider.nurseName || provider.nurseDetails?.name,
            nurseImage: provider.profileImage || provider.nurseDetails?.profileImage,
            nurseCity: provider.nurseCity || provider.nurseDetails?.city,
            nurseAddress: provider.nurseAddress || provider.nurseDetails?.address
        };

        sessionStorage.setItem("pendingNurseBooking", JSON.stringify(bookingInitiation));
        router.push("/nursingservice/booking-details");
    };

    const getImageUrl = (path) => {
        if (!path) return "https://img.freepik.com/free-photo/medical-specialist-taking-care-patient_23-2148962551.jpg";
        if (path.startsWith("http")) return path;
        return `${BASE_URL}/${path.replace(/^public\//, "")}`.replace(/([^:]\/)\/+/g, "$1");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAFBFD]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#08B36A]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFBFD] font-sans text-slate-900 pb-20 overflow-x-hidden relative">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 -z-10 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-full blur-[80px] md:blur-[120px] pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 -z-10 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-gradient-to-tr from-teal-500/5 to-emerald-500/5 rounded-full blur-[80px] md:blur-[120px] pointer-events-none"></div>

            {/* Navigation Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
                    <button 
                        onClick={() => router.back()} 
                        className="text-slate-900 p-2.5 hover:bg-slate-50 rounded-full transition-colors cursor-pointer"
                    >
                        <FaArrowLeft />
                    </button>
                    <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block leading-none mb-1">
                            Available Care Providers
                        </span>
                        <h1 className="text-base sm:text-lg font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#08B36A] to-emerald-800">
                            {subCategory}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 mt-8">
                
                {/* Providers Count & Sorting Indicator */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-500 mb-6">
                    <p>
                        Found <span className="text-slate-900 font-black">{providers.length}</span> Verified Bureau(s)
                    </p>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#08B36A] rounded-full border border-emerald-100 text-[11px] font-black uppercase">
                        <FaTag size={10} /> Sorted by Lowest Price First
                    </div>
                </div>

                {providers.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {providers.map((provider, index) => {
                            const name = provider.nurseName || provider.nurseDetails?.name || "Verified Nursing Bureau";
                            const city = provider.nurseCity || provider.nurseDetails?.city || "Mohali";
                            const address = provider.nurseAddress || provider.nurseDetails?.address || "Clinical Facility";
                            const rating = provider.nurseRating || provider.nurseDetails?.rating || 4.9;
                            const totalReviews = provider.totalReviews || provider.nurseDetails?.totalReviews || 0;
                            const profileImg = provider.profileImage || provider.nurseDetails?.profileImage;
                            const distance = provider.distance;
                            const pricing = provider.pricing || {};

                            const providerMinPrice = getProviderMinPrice(provider);
                            const isCheapest = index === 0 || (providerMinPrice === lowestPrice && lowestPrice > 0);

                            return (
                                <div 
                                    key={provider.serviceId || provider._id || index}
                                    className={`group relative bg-white rounded-[2.5rem] p-6 md:p-8 border transition-all duration-500 flex flex-col xl:flex-row gap-8 justify-between ${
                                        isCheapest 
                                            ? "border-[#08B36A] shadow-2xl shadow-emerald-600/10 ring-2 ring-[#08B36A]/20" 
                                            : "border-slate-100 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-[#08B36A]/10 hover:-translate-y-1"
                                    }`}
                                >
                                    {/* CHEAPEST / BEST VALUE FLOATING BADGE */}
                                    {isCheapest && (
                                        <div className="absolute -top-3.5 left-8 bg-gradient-to-r from-[#08B36A] to-emerald-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md shadow-emerald-600/20 flex items-center gap-1.5 z-20">
                                            <FaFire size={11} className="text-amber-300 fill-amber-300" />
                                            <span>Cheapest Rate • Best Price</span>
                                        </div>
                                    )}
                                    
                                    {/* Left Side: Agency/Provider Details */}
                                    <div className="flex-1 flex flex-col sm:flex-row gap-6">
                                        <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-[2rem] overflow-hidden bg-slate-50 border-4 border-slate-50 shrink-0 shadow-inner">
                                            <img 
                                                src={getImageUrl(profileImg)} 
                                                alt={name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                            />
                                        </div>

                                        <div className="space-y-3 min-w-0">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight leading-snug uppercase group-hover:text-[#08B36A] transition-colors duration-300">
                                                    {name}
                                                </h3>
                                                <div className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-xl text-xs font-black border border-amber-100/50 flex items-center gap-1 shrink-0">
                                                    <FaStar size={10} className="text-amber-400 fill-amber-400" /> {rating}
                                                    {totalReviews > 0 && (
                                                        <span className="text-[10px] text-amber-600/70 font-semibold ml-0.5">({totalReviews})</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-slate-500">
                                                <span className="flex items-center gap-1.5">
                                                    <FaMapMarkerAlt className="text-[#08B36A]" /> {address}, {city}
                                                </span>
                                                {distance !== undefined && distance !== null && (
                                                    <span className="flex items-center gap-1 text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md">
                                                        <FaRoute size={10} /> {distance} km away
                                                    </span>
                                                )}
                                            </div>

                                            {provider.serviceDescription && (
                                                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                                    {provider.serviceDescription}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 pt-2 border-t border-slate-100">
                                                <FaShieldAlt className="text-[#08B36A] shrink-0 text-sm" />
                                                <span>Verified Clinical Bureau • Background-Checked Staff</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Side: Tiered Pricing Matrices & Selection */}
                                    <div className="w-full xl:w-[320px] shrink-0 flex flex-col justify-between xl:border-l border-slate-100 xl:pl-8 pt-6 xl:pt-0 gap-6">
                                        <div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
                                                Package Pricing Rates
                                            </span>
                                            
                                            {/* Tiered Price Columns Grid */}
                                            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-4 rounded-3xl border border-slate-100/60 text-center">
                                                <div className="border-r border-slate-200/80 px-1">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">1 Day</span>
                                                    <span className="text-sm font-black text-slate-800 block">₹{pricing.oneDay?.final ?? 0}</span>
                                                    {pricing.oneDay?.discount > 0 && (
                                                        <span className="text-[9px] font-bold text-slate-300 line-through">₹{pricing.oneDay?.base}</span>
                                                    )}
                                                </div>
                                                <div className="border-r border-slate-200/80 px-1">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Multi-Day</span>
                                                    <span className="text-sm font-black text-slate-800 block">₹{pricing.multipleDays?.final ?? 0}</span>
                                                    {pricing.multipleDays?.discount > 0 && (
                                                        <span className="text-[9px] font-bold text-slate-300 line-through">₹{pricing.multipleDays?.base}</span>
                                                    )}
                                                </div>
                                                <div className="px-1">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Hourly</span>
                                                    <span className="text-sm font-black text-slate-800 block">₹{pricing.hourly?.final ?? 0}</span>
                                                    {pricing.hourly?.discount > 0 && (
                                                        <span className="text-[9px] font-bold text-slate-300 line-through">₹{pricing.hourly?.base}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Booking Action */}
                                        <button
                                            onClick={() => handleSelectProvider(provider)}
                                            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-lg active:scale-95 cursor-pointer ${
                                                isCheapest 
                                                    ? "bg-[#08B36A] hover:bg-[#079c5c] text-white shadow-emerald-600/20"
                                                    : "bg-slate-900 hover:bg-[#08B36A] text-white shadow-slate-900/10"
                                            }`}
                                        >
                                            <span>Select & Continue</span>
                                            <FaChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                                        </button>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-24 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                        <FaStore className="text-slate-200 text-5xl mx-auto mb-3" />
                        <h3 className="text-slate-800 font-bold text-sm tracking-wide">No Providers Available</h3>
                        <p className="text-slate-400 text-xs mt-1">There are no approved active bureaus offering this specific procedure right now.</p>
                    </div>
                )}
            </div>

        </div>
    );
}

export default function ProvidersListPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#FAFBFD]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#08B36A]"></div>
            </div>
        }>
            <ProvidersListContent />
        </Suspense>
    );
}