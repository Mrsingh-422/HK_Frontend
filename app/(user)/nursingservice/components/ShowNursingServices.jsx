"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
    FaClock, 
    FaSyringe, 
    FaHeartbeat, 
    FaShieldAlt, 
    FaUserCheck, 
    FaStethoscope,
    FaUserNurse,
    FaArrowRight,
    FaThLarge,
    FaUsers,
    FaCheckCircle,
    FaRegHospital,
    FaCertificate
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

// Fallback configuration mapping icons to global service categories
const SERVICE_ICONS = {
    "NURSING CARE": <FaSyringe className="text-[#08B36A]" />,
    "ELDERLY CARE": <FaHeartbeat className="text-[#08B36A]" />,
    "CRITICAL CARE": <FaClock className="text-[#08B36A]" />,
    "HOME ATTENDANT": <FaUserCheck className="text-[#08B36A]" />
};

export default function ShowNursingServices() {
    const router = useRouter();
    const [services, setServices] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopServices = async () => {
            try {
                setLoading(true);
                const res = await UserAPI.getGlobalNursingServices({
                    page: 1,
                    limit: 6,
                    sortBy: "available_first"
                });
                if (res?.success) {
                    setServices(res.data || []);
                    setTotalCount(res.pagination?.totalItems || res.count || res.data?.length || 0);
                }
            } catch (error) {
                console.error("Error fetching global nursing services:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTopServices();
    }, []);

    const handleServiceClick = (service) => {
        const subCategory = service.subCategory || service.title;
        router.push(`/nursingservice/providers?serviceId=${service._id}&subCategory=${encodeURIComponent(subCategory)}`);
    };

    const handleSeeAllRedirection = () => {
        router.push("/nursingservice/seeallservices");
    };

    // Strictly enforce maximum 6 items on this home section
    const displayedServices = services.slice(0, 6);

    if (loading) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center bg-[#F8FAFC]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#08B36A] mb-3" />
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Loading Clinical Care...</p>
            </div>
        );
    }

    return (
        <div className="bg-[#F8FAFC] font-sans text-slate-900 pb-16 overflow-x-hidden relative selection:bg-[#08B36A]/20 selection:text-[#08B36A]">
            
            {/* Ambient Background Glow */}
            <div className="absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-emerald-50/60 via-slate-50/30 to-transparent pointer-events-none -z-10" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 sm:mt-14 space-y-12 sm:space-y-14">
                
                {/* Header Block */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-4 border-b border-slate-200/80">
                    <div className="max-w-2xl space-y-3">
                        <div className="inline-flex items-center gap-2 text-[#08B36A] font-black text-[11px] uppercase tracking-wider bg-emerald-50/80 px-3.5 py-1.5 rounded-full border border-emerald-200/70 shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-[#08B36A] animate-ping" />
                            <FaUserNurse className="text-[#08B36A]" size={13} />
                            Professional Clinical Home Care
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                            Certified In-Home <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#08B36A] via-emerald-600 to-teal-700">Nursing Services.</span>
                        </h2>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
                            Choose from our verified clinical procedures below to compare certified nursing providers, caregiver ratings, and hourly/day rates directly.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleSeeAllRedirection}
                        className="flex items-center gap-3 font-black text-slate-900 hover:text-[#08B36A] transition-all text-xs sm:text-sm group shrink-0 cursor-pointer"
                    >
                        <span className="uppercase tracking-wider">Explore All Services</span>
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-slate-900 group-hover:border-[#08B36A] flex items-center justify-center group-hover:bg-[#08B36A] group-hover:text-white transition-all shadow-xs">
                            <FaArrowRight className="text-xs sm:text-sm group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </button>
                </div>

                {/* Grid Section (Max 6 Items) */}
                {displayedServices.length > 0 ? (
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                            {displayedServices.map((service) => {
                                const serviceTitle = service.subCategory || service.title || "Clinical Nursing Care";
                                const serviceCategory = service.category || service.servicesOffered || "General";
                                const startingPrice = service.minPrice ?? service.defaultOneDayPrice ?? service.startingPrice ?? 0;
                                const providerCount = service.providerCount ?? 0;
                                const hasActive = service.hasActiveVendors || providerCount > 0;
                                const iconElement = SERVICE_ICONS[serviceCategory] || <FaStethoscope className="text-[#08B36A]" />;

                                return (
                                    <div
                                        key={service._id}
                                        onClick={() => handleServiceClick(service)}
                                        className="group relative cursor-pointer bg-white border border-slate-200/80 hover:border-[#08B36A] rounded-[2.25rem] p-6.5 pl-7.5 shadow-sm hover:shadow-2xl hover:shadow-emerald-950/10 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1"
                                    >
                                        {/* 🟢 SOLID BRAND COLOR ACCENT LINE ON THE LEFT */}
                                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#08B36A] rounded-l-[2.25rem] group-hover:w-2.5 transition-all duration-300" />

                                        {/* Ambient Top Right Glow */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />

                                        <div className="space-y-4 relative z-10">
                                            {/* Card Top Row: Icon + Category Badge */}
                                            <div className="flex items-center justify-between">
                                                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 border border-emerald-100 flex items-center justify-center text-xl shrink-0 text-[#08B36A] shadow-xs group-hover:scale-105 group-hover:bg-[#08B36A] group-hover:text-white transition-all duration-300 ring-2 ring-emerald-50">
                                                    {iconElement}
                                                </div>

                                                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100/80 group-hover:bg-emerald-50 group-hover:text-[#08B36A] text-slate-600 px-3 py-1 rounded-full border border-slate-200/60 transition-colors">
                                                    {serviceCategory}
                                                </span>
                                            </div>

                                            {/* Service Title & Description */}
                                            <div>
                                                <h3 className="font-black text-base text-slate-900 group-hover:text-[#08B36A] transition-colors line-clamp-2 leading-snug">
                                                    {serviceTitle}
                                                </h3>
                                                <p className="text-slate-500 text-xs font-medium line-clamp-2 leading-relaxed mt-2">
                                                    {service.description || service.procedureIncluded || "Certified clinical procedure with sanitized supplies and licensed nursing care."}
                                                </p>
                                            </div>

                                            {/* Feature Pills */}
                                            <div className="flex items-center gap-2 pt-1 flex-wrap">
                                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-100">
                                                    <FaCheckCircle className="text-[#08B36A] text-[10px]" /> Verified
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-100">
                                                    <FaRegHospital className="text-slate-400 text-[10px]" /> Home & Hospital
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Footer: Starting Price & Provider CTA */}
                                        <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between relative z-10">
                                            <div>
                                                <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                                                    <span>Starts From</span>
                                                    {hasActive ? (
                                                        <span className="text-[#08B36A] bg-emerald-50 px-1.5 py-0.5 rounded font-black flex items-center gap-1">
                                                            <FaUsers size={9} /> {providerCount} Providers Available
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded font-bold">
                                                            Standard Rate
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-black text-slate-900 group-hover:text-[#08B36A] transition-colors">
                                                        ₹{startingPrice}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase">/ visit</span>
                                                </div>
                                            </div>

                                            {/* Explore Button */}
                                            <div className="h-10 px-4 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-[#08B36A] group-hover:text-white flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-xs shrink-0 group-hover:shadow-md group-hover:shadow-[#08B36A]/20">
                                                <span>Providers</span>
                                                <FaArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Bottom Redirect Button */}
                        <div className="flex justify-center pt-4">
                            <button
                                type="button"
                                onClick={handleSeeAllRedirection}
                                className="px-8 sm:px-10 py-4 bg-white hover:bg-[#08B36A] text-slate-900 hover:text-white border-2 border-slate-200 hover:border-[#08B36A] rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-[#08B36A]/20 flex items-center gap-3 active:scale-95 cursor-pointer"
                            >
                                <FaThLarge size={12} />
                                <span>See All {totalCount > 0 ? `(${totalCount})` : ""} Services</span>
                                <FaArrowRight size={11} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="py-24 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-xs">
                        <FaStethoscope className="text-slate-300 text-5xl mx-auto mb-3" />
                        <h3 className="text-slate-800 font-black text-sm tracking-wide">No Nursing Services Configured</h3>
                        <p className="text-slate-400 text-xs mt-1">There are no operational nursing categories available right now.</p>
                    </div>
                )}

                {/* Trust Signals */}
                <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-8 border-t border-slate-200/80">
                    <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                            <FaShieldAlt className="text-[#08B36A] text-lg" />
                        </div>
                        <div>
                            <h4 className="font-black text-xs text-slate-900 uppercase tracking-wide">Verified Nurse Providers</h4>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">100% Background-Checked & Licensed</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                            <FaUserCheck className="text-[#08B36A] text-lg" />
                        </div>
                        <div>
                            <h4 className="font-black text-xs text-slate-900 uppercase tracking-wide">Qualified Care Staff</h4>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Experienced & Trained Medical Personnel</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                            <FaClock className="text-[#08B36A] text-lg" />
                        </div>
                        <div>
                            <h4 className="font-black text-xs text-slate-900 uppercase tracking-wide">Flexible Schedules</h4>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Single Visit, Hourly, or Long-Term Care</p>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}