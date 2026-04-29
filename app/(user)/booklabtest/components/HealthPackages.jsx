"use client";

import React, { useState, useEffect } from "react";
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
import { useRouter } from "next/navigation";
import TestDetailsModal from "./otherComponents/TestDetailsModal";
import UserAPI from "@/app/services/UserAPI";

export default function HealthPackagesLanding() {
    const router = useRouter();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 3 Static images for the first three packages
    const STATIC_IMAGES = [
        "https://idronline.org/wp-content/uploads/2020/12/OGFB4B0.jpg.webp",
        "https://plus.unsplash.com/premium_photo-1673953509975-576678fa6710?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aGVhbHRofGVufDB8fDB8fHww",
        "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80"
    ];

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setLoading(true);
                const res = await UserAPI.getStandardPackageCatalog({ limit: 10 });
                if (res?.success) {
                    setPackages(res.data);
                }
            } catch (error) {
                console.error("Error fetching packages:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    const handleBookClick = (e, pkg) => {
        e.stopPropagation(); // Prevent navigation when clicking the book button
        setSelectedPackage(pkg);
        setIsModalOpen(true);
    };

    const handleNavigate = (id) => {
        router.push(`/booklabtest/packagedetails/${id}`);
    };

    // Slice to show only 3 packages as requested
    const featuredPackages = packages.slice(0, 3);

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

                {/* --- DYNAMIC E-COMMERCE GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {loading ? (
                        [1, 2, 3].map((i) => (
                            <div key={i} className="h-[500px] bg-slate-100 animate-pulse rounded-[3rem]"></div>
                        ))
                    ) : (
                        featuredPackages.map((pkg, index) => {
                            const discountPrice = pkg.minPrice || pkg.standardMRP;
                            const discountPercent = pkg.standardMRP > discountPrice 
                                ? Math.round(((pkg.standardMRP - discountPrice) / pkg.standardMRP) * 100) 
                                : 0;

                            return (
                                <div 
                                    key={pkg._id}
                                    onClick={() => handleNavigate(pkg._id)}
                                    className="group bg-white cursor-pointer rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-emerald-200/30 transition-all duration-500 flex flex-col overflow-hidden"
                                >
                                    {/* Image & Badges */}
                                    <div className="relative h-60 overflow-hidden m-4 rounded-[2.2rem]">
                                        <img 
                                            src={STATIC_IMAGES[index] || STATIC_IMAGES[0]} 
                                            alt={pkg.packageName} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                                        
                                        {/* Floating Badges */}
                                        <div className="absolute top-5 left-5 flex flex-col gap-2">
                                            <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[9px] font-black px-3 py-1.5 rounded-xl shadow-sm uppercase tracking-widest">
                                                {pkg.testCount || "0"} Parameters
                                            </span>
                                        </div>

                                        {pkg.tags?.includes("Best Seller") && (
                                            <div className="absolute top-5 right-5">
                                                <div className="bg-orange-500 text-white text-[9px] font-black px-3 py-1.5 rounded-xl shadow-lg uppercase tracking-widest flex items-center gap-1">
                                                    <FaStar size={8}/> Bestseller
                                                </div>
                                            </div>
                                        )}

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
                                            {pkg.packageName}
                                        </h3>

                                        {/* Feature Pills */}
                                        <div className="flex flex-wrap gap-2 mb-8">
                                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                <FaRegClock className="text-emerald-500" /> {pkg.reportTime}
                                            </div>
                                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                <FaRegHospital className="text-emerald-500" /> Home Pickup
                                            </div>
                                        </div>

                                        {/* PRICE & ACTION SECTION */}
                                        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    {pkg.standardMRP > discountPrice && (
                                                        <span className="text-xs text-slate-400 line-through font-bold">₹{pkg.standardMRP}</span>
                                                    )}
                                                    {discountPercent > 0 && (
                                                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">Save {discountPercent}%</span>
                                                    )}
                                                </div>
                                                <span className="text-3xl font-black text-slate-900 tracking-tighter">
                                                    ₹{discountPrice}
                                                </span>
                                            </div>

                                            <button 
                                                onClick={(e) => handleBookClick(e, pkg)}
                                                className="h-16 w-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center hover:bg-emerald-500 transition-all duration-300 shadow-xl shadow-slate-200 group/btn"
                                            >
                                                <FaPlus className="group-hover:rotate-90 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
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