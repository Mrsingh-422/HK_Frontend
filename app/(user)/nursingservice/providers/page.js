"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
    FaArrowLeft, 
    FaStar, 
    FaBriefcase, 
    FaMapMarkerAlt, 
    FaChevronRight, 
    FaShieldAlt,
    FaStore
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.7:5002";

function ProvidersListContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const serviceTitle = searchParams.get("title") || "Nursing Service";

    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProviders = async () => {
            if (!serviceTitle) return;
            try {
                setLoading(true);
                const res = await UserAPI.getProvidersForService(serviceTitle);
                if (res?.success) {
                    setProviders(res.data || []);
                }
            } catch (err) {
                console.error("Error fetching providers:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProviders();
    }, [serviceTitle]);

    const handleSelectProvider = (provider) => {
        // Constructs the exact state mapping required by your appointment schedule/checkout flows
        const bookingInitiation = {
            nurseId: provider.nurseDetails?._id,
            serviceId: provider.serviceId,
            serviceDetails: {
                title: serviceTitle,
                type: "Service",
                duration: "Per Visit",
                basePrice: provider.pricing?.oneDay?.final || 0,
                procedureIncluded: "Standard Clinical Care Procedure",
                servicesOffered: ""
            },
            basePrice: provider.pricing?.oneDay?.final || 0,
            nurseName: provider.nurseDetails?.name,
            nurseImage: provider.nurseDetails?.profileImage
        };

        // Persist booking snapshot and redirect to dynamic checkout flow
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
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFBFD] font-sans text-slate-900 pb-20 overflow-x-hidden relative">
            
            {/* Premium Ambient Background Elements */}
            <div className="absolute top-0 right-0 -z-10 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-gradient-to-br from-teal-500/5 to-emerald-500/5 rounded-full blur-[80px] md:blur-[120px] pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 -z-10 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-gradient-to-tr from-emerald-500/5 to-teal-500/5 rounded-full blur-[80px] md:blur-[120px] pointer-events-none"></div>

            {/* Navigation Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-slate-900 p-2.5 hover:bg-slate-50 rounded-full transition-colors">
                        <FaArrowLeft />
                    </button>
                    <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block leading-none mb-1">Service Providers</span>
                        <h1 className="text-base sm:text-lg font-black tracking-tight uppercase text-teal-600">{serviceTitle}</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 mt-12">
                {providers.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {providers.map((provider, index) => {
                            const details = provider.nurseDetails || {};
                            return (
                                <div 
                                    key={index}
                                    className="group relative bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-teal-500/10 hover:-translate-y-1.5 transition-all duration-500 flex flex-col xl:flex-row gap-8 justify-between"
                                >
                                    
                                    {/* Left Side: Agency/Provider Details */}
                                    <div className="flex-1 flex flex-col sm:flex-row gap-6">
                                        <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-[2rem] overflow-hidden bg-slate-50 border-4 border-slate-50 shrink-0 shadow-inner">
                                            <img 
                                                src={getImageUrl(details.profileImage)} 
                                                alt={details.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                            />
                                            {details.isOnline && (
                                                <span className="absolute bottom-2 right-2 flex h-3.5 w-3.5 rounded-full bg-emerald-500 ring-4 ring-white shadow-sm"></span>
                                            )}
                                        </div>

                                        <div className="space-y-4 min-w-0">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h3 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight leading-none uppercase group-hover:text-teal-600 transition-colors duration-300">
                                                    {details.name}
                                                </h3>
                                                <div className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-xl text-xs font-black border border-amber-100/50 flex items-center gap-1 shrink-0">
                                                    <FaStar size={10} className="text-amber-400 fill-amber-400 animate-pulse" /> {details.rating || "5.0"}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-slate-500">
                                                <span className="flex items-center gap-2">
                                                    <FaBriefcase className="text-teal-500" /> {details.experienceYears || "0"} Years Exp.
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <FaMapMarkerAlt className="text-teal-500" /> {details.city || "Mohali"}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 pt-3 border-t border-slate-100">
                                                <FaShieldAlt className="text-emerald-500 shrink-0 text-sm" />
                                                <span>Verified Clinical Bureau • Approved Agency Partner</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Side: Tiered Pricing Matrices & Selection */}
                                    <div className="w-full xl:w-[320px] shrink-0 flex flex-col justify-between xl:border-l border-slate-100 xl:pl-8 pt-6 xl:pt-0 gap-6">
                                        <div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Pricing Matrices</span>
                                            
                                            {/* Tiered Price Columns Grid */}
                                            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-4 rounded-3xl border border-slate-100/60 text-center">
                                                <div className="border-r border-slate-200/80 px-1">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">One Day</span>
                                                    <span className="text-sm font-black text-slate-800 block">₹{provider.pricing?.oneDay?.final}</span>
                                                    {provider.pricing?.oneDay?.discount > 0 && (
                                                        <span className="text-[9px] font-bold text-slate-300 line-through">₹{provider.pricing?.oneDay?.base}</span>
                                                    )}
                                                </div>
                                                <div className="border-r border-slate-200/80 px-1">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Multi-Day</span>
                                                    <span className="text-sm font-black text-slate-800 block">₹{provider.pricing?.multipleDays?.final}</span>
                                                    {provider.pricing?.multipleDays?.discount > 0 && (
                                                        <span className="text-[9px] font-bold text-slate-300 line-through">₹{provider.pricing?.multipleDays?.base}</span>
                                                    )}
                                                </div>
                                                <div className="px-1">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Hourly</span>
                                                    <span className="text-sm font-black text-slate-800 block">₹{provider.pricing?.hourly?.final}</span>
                                                    {provider.pricing?.hourly?.discount > 0 && (
                                                        <span className="text-[9px] font-bold text-slate-300 line-through">₹{provider.pricing?.hourly?.base}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Selector Actions Trigger */}
                                        <button
                                            onClick={() => handleSelectProvider(provider)}
                                            className="w-full bg-gradient-to-r from-slate-950 to-slate-900 hover:from-teal-600 hover:to-teal-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-teal-500/10 active:scale-95"
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
                        <p className="text-slate-400 text-xs mt-1">There are no approved active agencies offering this specific service right now.</p>
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
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
            </div>
        }>
            <ProvidersListContent />
        </Suspense>
    );
}