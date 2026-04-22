"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserAPI from "@/app/services/UserAPI";
import { FaVial, FaChevronRight, FaStar, FaBoxOpen, FaStethoscope } from "react-icons/fa";

export default function WomenTests() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setLoading(true);
                const response = await UserAPI.getWomensPackages();

                if (response.success) {
                    setPackages(response.data || []);
                }
            } catch (err) {
                console.error("Error fetching women packages:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPackages();
    }, []);

    if (loading) return <SkeletonGrid />;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
            {packages.length > 0 ? (
                packages.map((pkg) => (
                    <div
                        key={pkg._id}
                        // UPDATED ROUTE HERE: Navigates to packagedetails
                        onClick={() => router.push(`/booklabtest/packagedetails/${pkg._id}`)}
                        className="group relative bg-white rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:border-purple-200 hover:shadow-[0_20px_50px_rgba(139,92,246,0.15)] transition-all duration-500 cursor-pointer flex flex-col justify-between overflow-hidden hover:-translate-y-2"
                    >
                        {/* Soft Glow Background Decoration on Hover */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl" />

                        <div>
                            {/* Top Header: Icon & Badge */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-500 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition-all duration-500 shadow-inner">
                                    <FaBoxOpen size={24} />
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="bg-purple-100 text-purple-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                        Package
                                    </span>
                                    <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                                        <FaStar size={10} />
                                        <span className="text-[11px] font-bold">4.9</span>
                                    </div>
                                </div>
                            </div>

                            {/* Package Content */}
                            <h4 className="text-lg font-extrabold text-slate-800 leading-tight mb-2 group-hover:text-purple-700 transition-colors">
                                {pkg.packageName}
                            </h4>
                            <p className="text-slate-400 text-xs font-medium mb-4 line-clamp-1">
                                {pkg.shortDescription || "Comprehensive female wellness screening"}
                            </p>

                            {/* Tags/Attributes */}
                            <div className="flex flex-wrap gap-3 mb-6">
                                <div className="flex items-center gap-1.5 text-slate-500">
                                    <FaStethoscope size={12} className="text-purple-400" />
                                    <span className="text-[11px] font-bold uppercase tracking-tight">
                                        {pkg.tests?.length || 0} Tests Included
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-500">
                                    <FaVial size={12} className="text-purple-400" />
                                    <span className="text-[11px] font-bold uppercase tracking-tight">
                                        {pkg.sampleTypes?.[0] || "Blood"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer: Price & Action */}
                        <div className="mt-4 pt-5 border-t border-slate-50 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-0.5">Price starting from</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-slate-900">₹{pkg.offerPrice || pkg.minPrice || pkg.standardMRP}</span>
                                    {pkg.standardMRP > (pkg.offerPrice || pkg.minPrice) && (
                                        <span className="text-xs text-slate-400 line-through font-bold">₹{pkg.standardMRP}</span>
                                    )}
                                </div>
                            </div>

                            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-purple-600 group-hover:text-white group-hover:rotate-[-45deg] transition-all duration-500">
                                <FaChevronRight size={14} />
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4 text-slate-400">
                        <FaBoxOpen size={30} />
                    </div>
                    <h3 className="text-slate-500 font-bold">No Health Packages Found</h3>
                    <p className="text-slate-400 text-sm">Please check back later for new updates.</p>
                </div>
            )}
        </div>
    );
}

const SkeletonGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-4">
        {[1, 2, 3].map((n) => (
            <div key={n} className="h-[320px] bg-white border border-slate-100 rounded-[2.5rem] p-6 animate-pulse space-y-6">
                <div className="flex justify-between">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl" />
                    <div className="w-20 h-6 bg-slate-100 rounded-full" />
                </div>
                <div className="space-y-3">
                    <div className="h-5 bg-slate-100 rounded-full w-3/4" />
                    <div className="h-3 bg-slate-100 rounded-full w-1/2" />
                </div>
                <div className="flex gap-4">
                    <div className="h-6 w-20 bg-slate-50 rounded-lg" />
                    <div className="h-6 w-20 bg-slate-50 rounded-lg" />
                </div>
                <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                    <div className="h-8 w-24 bg-slate-100 rounded-lg" />
                    <div className="w-12 h-12 bg-slate-100 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);