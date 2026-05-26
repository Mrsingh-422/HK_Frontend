"use client";

import React from "react";
import { FaArrowRight, FaMicroscope } from "react-icons/fa";

function FromHealth() {
    return (
        <section className="bg-slate-50 py-9 px-6 relative overflow-hidden">
            {/* Subtle light geometric background accents */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-teal-50/50 to-transparent rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-slate-100 to-transparent rounded-full blur-2xl pointer-events-none"></div>

            <div className="max-w-6xl mx-auto relative z-10">

                {/* Premium White Card with glass-like crisp borders */}
                <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_30px_70px_-20px_rgba(15,23,42,0.04)] relative overflow-hidden p-8 md:p-14 lg:p-16">

                    {/* Subtle top brand accent line */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 via-emerald-500 to-emerald-400"></div>

                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

                        {/* Left Side: Editorial Brand Showcase */}
                        <div className="flex-shrink-0 relative">
                            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-slate-50 border border-slate-100 p-6 flex items-center justify-center group-hover:scale-105 transition-transform duration-500 shadow-sm">
                                <img
                                    src="logo.png"
                                    alt="Health Kangaroo"
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            {/* Premium floating micro-badge */}
                            <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-slate-900 to-slate-800 text-teal-400 p-3 rounded-2xl shadow-lg border border-slate-700/50">
                                <FaMicroscope size={16} />
                            </div>
                        </div>

                        {/* Middle: Premium Typography & Structural Layout */}
                        <div className="flex-1 text-center lg:text-left space-y-5">
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    Enterprise Network
                                </div>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                                    Ready to deliver <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-600 to-emerald-500">
                                        Premium Lab Services?
                                    </span>
                                </h2>
                            </div>
                            <p className="text-slate-500 text-sm md:text-base max-w-xl leading-relaxed font-normal">
                                Partner with an elite diagnostic infrastructure. We manage the digital layer and complex logistics, letting your laboratory focus entirely on clinical precision.
                            </p>
                        </div>

                        {/* Right Side: High-End Interactive CTA */}
                        <div className="flex-shrink-0 w-full lg:w-auto flex flex-col items-center lg:items-end gap-4">
                            <button className="w-full lg:w-auto group flex items-center justify-center gap-4 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
                                Apply for Affiliation
                                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
                                    <FaArrowRight className="text-[10px] text-white" />
                                </div>
                            </button>

                            {/* Compliance Badging */}
                            <div className="flex items-center gap-2 text-slate-400 font-medium text-[11px] tracking-wider uppercase">
                                <span>NABL & ISO Labs Preferred</span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
}

export default FromHealth;