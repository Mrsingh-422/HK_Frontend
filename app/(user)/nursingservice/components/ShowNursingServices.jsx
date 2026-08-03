"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
    FaClock, 
    FaShoppingCart, 
    FaSyringe, 
    FaHeartbeat, 
    FaChevronRight, 
    FaArrowLeft, 
    FaShieldAlt, 
    FaUserCheck, 
    FaStethoscope 
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

// Fallback configuration mapping icons to global service titles [2]
const SERVICE_ICONS = {
    "Medication Reminder": <FaClock className="text-teal-600" />,
    "Grocery Shopping": <FaShoppingCart className="text-teal-600" />,
    "Medical Administration": <FaSyringe className="text-teal-600" />,
    "Critical Monitoring": <FaHeartbeat className="text-teal-600" />
};

export default function ShowNursingServices() {
    const router = useRouter();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGlobalServices = async () => {
            try {
                setLoading(true);
                const res = await UserAPI.getGlobalNursingServices();
                if (res?.success) {
                    setServices(res.data || []);
                }
            } catch (error) {
                console.error("Error fetching global nursing services:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGlobalServices();
    }, []);

    const handleServiceClick = (title) => {
        // Navigates to the provider listing screen with the clicked service title
        router.push(`/nursingservice/providers?title=${encodeURIComponent(title)}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAFBFD]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFBFD] font-sans text-slate-900 pb-20 overflow-x-hidden">
            <main className="max-w-7xl mx-auto px-6 mt-12 space-y-16">
                
                {/* Hero / Introduction Block */}
                <div className="max-w-2xl space-y-4">
                    <div className="inline-flex items-center gap-1.5 text-teal-700 font-bold text-xs uppercase tracking-wider bg-white px-3.5 py-1.5 rounded-full shadow-sm border border-teal-100/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span> Professional Care at Home
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none">
                        Certified Clinical <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-600">Bureaus.</span>
                    </h2>
                    <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed">
                        Select a home care treatment category below to discover and compare localized certified nursing services matching your clinical needs.
                    </p>
                </div>

                {/* Grid Section */}
                {services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service) => {
                            const iconElement = SERVICE_ICONS[service.title] || <FaStethoscope className="text-teal-600" />;
                            return (
                                <div
                                    key={service._id}
                                    onClick={() => handleServiceClick(service.title)}
                                    className="group cursor-pointer bg-white border border-slate-100/80 rounded-[2rem] p-6 shadow-sm hover:shadow-2xl hover:shadow-teal-500/5 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-[230px]"
                                >
                                    <div className="space-y-4">
                                        <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-lg shrink-0">
                                            {iconElement}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-lg text-slate-800 group-hover:text-teal-600 transition-colors uppercase tracking-tight">
                                                {service.title}
                                            </h3>
                                            <p className="text-slate-400 text-xs mt-1 font-medium line-clamp-2 leading-relaxed">
                                                {service.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Footing Metrics */}
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-0.5">Starts From</span>
                                            <span className="text-base font-black text-teal-600">₹{service.startingPrice}</span>
                                        </div>
                                        <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-teal-500 group-hover:text-white flex items-center justify-center transition-all duration-300">
                                            <FaChevronRight size={10} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
                        <FaStethoscope className="text-slate-200 text-5xl mx-auto mb-3" />
                        <h3 className="text-slate-800 font-bold text-sm tracking-wide">No Services Configured</h3>
                        <p className="text-slate-400 text-xs mt-1">There are no operational nursing categories available right now.</p>
                    </div>
                )}

                {/* Trust Signals Banner */}
                <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                            <FaShieldAlt className="text-teal-600 text-base" />
                        </div>
                        <div>
                            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Verified Bureaus</h4>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">100% Inspected & Licensed</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                            <FaUserCheck className="text-teal-600 text-base" />
                        </div>
                        <div>
                            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Expert Clinicians</h4>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Experienced & Trained Nurses</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                            <FaClock className="text-teal-600 text-base" />
                        </div>
                        <div>
                            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Flexible Booking</h4>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Daily, Hourly, or Multi-Day</p>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}