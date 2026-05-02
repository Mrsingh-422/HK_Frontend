"use client";

import React from "react";
import { FaArrowRight, FaHandshake, FaMedkit } from "react-icons/fa";

function FromHealthHospital() {
    return (
        <section className="bg-[#f8fafc] py-16 md:py-24 px-4 overflow-hidden font-sans">
            <div className="max-w-7xl mx-auto">
                
                {/* Main Action Container */}
                <div className="relative group">
                    
                    {/* Background Decorative Layer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#08B36A] to-emerald-400 md:skew-x-[-6deg] rounded-[2.5rem] md:rounded-[4rem] shadow-2xl shadow-emerald-200"></div>
                    
                    {/* Content Wrapper */}
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between px-8 py-10 md:px-20 md:py-14 gap-10">
                        
                        {/* LEFT CONTENT: Invitation */}
                        <div className="flex-1 text-center lg:text-left space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest">
                                <FaMedkit className="animate-pulse" /> Partnership Program
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-white leading-[1.1] tracking-tight italic">
                                Ready to deliver your <br />
                                <span className="text-slate-900">Hospital services?</span>
                            </h2>
                            <p className="text-emerald-50 text-sm md:text-lg font-medium max-w-sm leading-relaxed">
                                Join our network of excellence and reach thousands of patients instantly.
                            </p>
                        </div>

                        {/* MIDDLE: Branding Nest */}
                        <div className="flex-shrink-0 relative group-hover:scale-110 transition-transform duration-500">
                            {/* Animated Rings */}
                            <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20"></div>
                            <div className="w-32 h-32 md:w-44 md:h-44 bg-white rounded-full p-4 shadow-2xl flex items-center justify-center relative z-10 border-8 border-emerald-50/20">
                                {/* Replace logo.png with your actual file */}
                                <img
                                    src="logo.png" 
                                    alt="Health Kangaroo Logo"
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        e.target.src = "https://cdn-icons-png.flaticon.com/512/3063/3063176.png";
                                    }}
                                />
                            </div>
                        </div>

                        {/* RIGHT CONTENT: Brand & CTA */}
                        <div className="flex-1 text-center lg:text-left space-y-6 lg:pl-12">
                            <div className="space-y-1">
                                <h2 className="text-3xl md:text-5xl font-black text-white italic leading-none">
                                    From Health <br />
                                    <span className="text-slate-900">Kangaroo</span>
                                </h2>
                                <p className="text-emerald-50 font-black text-sm uppercase tracking-[0.2em] opacity-80 pt-2">
                                    Ready to grow with us?
                                </p>
                            </div>

                            <button className="group/btn relative overflow-hidden bg-white text-[#08B36A] font-black px-10 py-4 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-emerald-900/20 active:scale-95 flex items-center justify-center gap-3 mx-auto lg:mx-0">
                                <span className="relative z-10 uppercase tracking-widest text-xs">Let's Begin</span>
                                <FaArrowRight className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                                
                                {/* Button Hover Fill Effect */}
                                <div className="absolute inset-0 bg-slate-900 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                                <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover/btn:opacity-100 transition-opacity z-20 font-black uppercase tracking-widest text-xs">
                                    Apply Now
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Decorative Watermark */}
                    <div className="absolute bottom-4 right-10 text-white/5 font-black text-8xl pointer-events-none select-none italic hidden md:block">
                        JOIN US
                    </div>
                </div>

                {/* Sub-footer trust indicator */}
                <div className="mt-8 flex justify-center items-center gap-8 opacity-40">
                    <div className="flex items-center gap-2 grayscale">
                        <FaHandshake />
                        <span className="text-[10px] font-black uppercase tracking-widest">Verified Partners</span>
                    </div>
                    <div className="h-4 w-px bg-slate-300"></div>
                    <div className="flex items-center gap-2 grayscale">
                        <FaMedkit />
                        <span className="text-[10px] font-black uppercase tracking-widest">24/7 Support</span>
                    </div>
                </div>

            </div>
        </section>
    );
}

export default FromHealthHospital;