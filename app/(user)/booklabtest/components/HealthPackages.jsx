"use client";

import React, { useState } from "react";
import {
    FaArrowRight,
    FaCheckCircle,
    FaRegClock,
    FaRegHospital,
    FaTag,
    FaShoppingCart,
    FaShieldAlt,
    FaStar,
    FaPlus
} from "react-icons/fa";
import { INITIAL_PACKAGES } from "../../../constants/constants";
import { useRouter } from "next/navigation";
import TestDetailsModal from "./otherComponents/TestDetailsModal";

export default function HealthPackagesLanding() {
    const router = useRouter();
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Show only the first 3 or 4 top packages for the landing page
    const featuredPackages = INITIAL_PACKAGES.slice(0, 3);

    const handleBookClick = (pkg) => {
        setSelectedPackage(pkg);
        setIsModalOpen(true);
    };

    return (
        <section className="py-24 bg-[#FDFDFD]">
            <TestDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                pkg={selectedPackage}
            />

            <div className="max-w-7xl mx-auto px-6">
                
                {/* --- SECTION HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="h-1.5 w-12 bg-emerald-500 rounded-full"></span>
                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-600">Premium Diagnostics</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight mb-6">
                            Best-Selling <span className="text-emerald-500">Health</span> Packages.
                        </h2>
                        <p className="text-slate-500 text-base md:text-lg font-medium">
                            Skip the clinic queues. Book comprehensive health checkups with 
                            safe home sample collection and digital reports.
                        </p>
                    </div>
                    
                    {/* TOP CTA */}
                    <button 
                        onClick={() => router.push("/booklabtest/seealltests")}
                        className="group flex items-center gap-3 text-sm font-black uppercase tracking-widest text-slate-900 hover:text-emerald-600 transition-all"
                    >
                        View Full Catalog <FaArrowRight className="group-hover:translate-x-2 transition-transform"/>
                    </button>
                </div>

                {/* --- STATIC E-COMMERCE GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {featuredPackages.map((pkg) => (
                        <div 
                            key={pkg.id}
                            className="group bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-emerald-200/30 transition-all duration-500 flex flex-col overflow-hidden"
                        >
                            {/* Image & Badges */}
                            <div className="relative h-60 overflow-hidden m-4 rounded-[2.2rem]">
                                <img 
                                    src={pkg.image} 
                                    alt={pkg.name} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                                
                                {/* Floating Badges */}
                                <div className="absolute top-5 left-5 flex flex-col gap-2">
                                    <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[9px] font-black px-3 py-1.5 rounded-xl shadow-sm uppercase tracking-widest">
                                        {pkg.testCount || "60+"} Parameters
                                    </span>
                                </div>

                                <div className="absolute top-5 right-5">
                                    <div className="bg-orange-500 text-white text-[9px] font-black px-3 py-1.5 rounded-xl shadow-lg uppercase tracking-widest flex items-center gap-1">
                                        <FaStar size={8}/> Bestseller
                                    </div>
                                </div>

                                <div className="absolute bottom-5 left-5 flex items-center gap-2 text-white">
                                    <div className="h-8 w-8 rounded-full bg-[#08B36A] flex items-center justify-center">
                                        <FaCheckCircle size={14}/>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">NABL Accredited</span>
                                </div>
                            </div>

                            {/* Package Content */}
                            <div className="px-8 pb-8 flex-1 flex flex-col">
                                <h3 className="text-2xl font-black text-slate-900 leading-tight mb-4 group-hover:text-emerald-600 transition-colors line-clamp-2">
                                    {pkg.name}
                                </h3>

                                {/* Feature Pills */}
                                <div className="flex flex-wrap gap-2 mb-8">
                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        <FaRegClock className="text-emerald-500" /> 24h Reports
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        <FaRegHospital className="text-emerald-500" /> Home Pickup
                                    </div>
                                </div>

                                {/* PRICE & ACTION SECTION */}
                                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs text-slate-400 line-through font-bold">₹2,999</span>
                                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">Save 60%</span>
                                        </div>
                                        <span className="text-3xl font-black text-slate-900 tracking-tighter">
                                            {pkg.price}
                                        </span>
                                    </div>

                                    <button 
                                        onClick={() => handleBookClick(pkg)}
                                        className="h-16 w-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center hover:bg-emerald-500 transition-all duration-300 shadow-xl shadow-slate-200 group/btn"
                                    >
                                        <FaPlus className="group-hover:rotate-90 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- BOTTOM TRUST BAR --- */}
                <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-t border-slate-100">
                    <TrustItem icon={<FaShieldAlt/>} title="ISO Certified" desc="Quality Assured" />
                    <TrustItem icon={<FaRegHospital/>} title="50+ Labs" desc="Verified Partners" />
                    <TrustItem icon={<FaCheckCircle/>} title="Home Collection" desc="Safe & Hygienic" />
                    <TrustItem icon={<FaStar/>} title="4.9/5 Rating" desc="Happy Customers" />
                </div>

                {/* FINAL SECTION CTA */}
                <div className="mt-12 text-center">
                    <button 
                        onClick={() => router.push("/booklabtest/seealltests")}
                        className="bg-emerald-500 text-white px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-200 hover:bg-slate-900 transition-all"
                    >
                        Browse All 50+ Packages
                    </button>
                </div>
            </div>
        </section>
    );
}

// Sub-component for Trust Items
const TrustItem = ({ icon, title, desc }) => (
    <div className="flex flex-col items-center text-center">
        <div className="text-emerald-500 text-2xl mb-3">{icon}</div>
        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-1">{title}</h4>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{desc}</p>
    </div>
);