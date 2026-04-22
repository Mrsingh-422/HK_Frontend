"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserAPI from "@/app/services/UserAPI";
import { FaMicroscope, FaVial, FaChevronRight, FaCalendarCheck } from "react-icons/fa";

export default function WomenTests() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchWomenTests = async () => {
            try {
                const response = await UserAPI.getWomensTests();
                if (response.success) {
                    setData(response.data || []);
                }
            } catch (err) {
                console.error("Error fetching women tests:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchWomenTests();
    }, []);

    if (loading) return <SkeletonGrid />;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
            {data.length > 0 ? (
                data.map((test) => (
                    <div
                        key={test._id}
                        onClick={() => router.push(`/booklabtest/testdetails/${test._id}`)}
                        className="group relative flex flex-col bg-white border border-slate-200 rounded-[2rem] p-5 hover:shadow-[0_20px_50px_rgba(16,185,129,0.1)] hover:border-emerald-200 transition-all duration-500 cursor-pointer overflow-hidden"
                    >
                        {/* Decorative background element on hover */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 blur-3xl" />

                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-sm">
                                <FaMicroscope size={22} />
                            </div>
                            <span className="bg-slate-50 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-tighter border border-slate-100">
                                {test.category || "General"}
                            </span>
                        </div>

                        <div className="flex-1">
                            <h4 className="font-extrabold text-slate-800 text-sm md:text-base leading-tight group-hover:text-emerald-700 transition-colors">
                                {test.testName}
                            </h4>
                            
                            <div className="flex items-center gap-4 mt-3">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                                        {test.sampleType === "NA" ? "No Sample" : test.sampleType}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <FaCalendarCheck size={12} className="text-slate-300" />
                                    <span className="text-[11px] font-medium uppercase tracking-wide">Reports: 24h</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-slate-50 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Price</p>
                                <p className="text-xl font-black text-slate-900 tracking-tight">
                                    ₹{test.minPrice || test.standardMRP}
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs group-hover:translate-x-1 transition-transform duration-300">
                                BOOK NOW
                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                    <FaChevronRight size={10} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium italic">No specialized women tests available right now.</p>
                </div>
            )}
        </div>
    );
}

const SkeletonGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-2">
        {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-50 border border-slate-100 rounded-[2rem] animate-pulse relative overflow-hidden">
                <div className="p-6 space-y-4">
                    <div className="flex justify-between">
                        <div className="w-14 h-14 bg-slate-200 rounded-2xl" />
                        <div className="w-20 h-6 bg-slate-200 rounded-full" />
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="absolute bottom-6 left-6 right-6 h-12 bg-slate-100 rounded-xl" />
                </div>
            </div>
        ))}
    </div>
);