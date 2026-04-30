"use client";

import React from "react";
import { FaArrowRight, FaUserNurse } from "react-icons/fa";

function FromHealthNursing() {
    return (
        <section className="bg-[#f8fafc] py-20 px-6 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                
                {/* Main Card Container */}
                <div className="relative group">
                    
                    {/* Background Glow Blobs */}
                    <div className="absolute -top-10 -left-10 w-64 h-64 bg-emerald-200 rounded-full blur-[100px] opacity-50 group-hover:opacity-80 transition-opacity duration-700"></div>
                    <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-emerald-100 rounded-full blur-[100px] opacity-50 group-hover:opacity-80 transition-opacity duration-700"></div>

                    {/* The Premium Card */}
                    <div className="relative z-10 bg-slate-900 rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl shadow-emerald-900/20">
                        
                        {/* Decorative Wave/Slant Element */}
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-600/10 skew-x-[-15deg] transform origin-top translate-x-20 hidden lg:block"></div>

                        <div className="flex flex-col lg:flex-row items-center p-8 md:p-16 lg:p-20 gap-10 lg:gap-16">
                            
                            {/* Left Side: Brand & Logo */}
                            <div className="flex-shrink-0 relative">
                                <div className="relative w-32 h-32 md:w-44 md:h-44 bg-white rounded-full p-6 shadow-2xl flex items-center justify-center animate-float">
                                    <img
                                        src="logo.png" // Replace with actual Kangaroo Logo
                                        alt="Health Kangaroo"
                                        className="w-full h-full object-contain"
                                    />
                                    {/* Pulse Effect */}
                                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500/30 animate-ping"></div>
                                </div>
                                
                                {/* Floating Badge */}
                                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-3 rounded-2xl shadow-xl">
                                    <FaUserNurse size={20} />
                                </div>
                            </div>

                            {/* Middle: Content */}
                            <div className="flex-1 text-center lg:text-left space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-emerald-400 font-black uppercase tracking-[0.3em] text-xs">
                                        Partner with Health Kangaroo
                                    </h3>
                                    <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                                        Ready to deliver <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200 italic">
                                            Premium Nursing?
                                        </span>
                                    </h2>
                                </div>
                                <p className="text-slate-400 text-base md:text-lg font-medium max-w-xl leading-relaxed">
                                    Join an elite network of healthcare professionals. We provide the platform, you provide the compassionate care our clients deserve.
                                </p>
                            </div>

                            {/* Right Side: CTA Button */}
                            <div className="flex-shrink-0 w-full lg:w-auto">
                                <button className="w-full lg:w-auto group/btn flex items-center justify-center gap-4 bg-emerald-500 hover:bg-white text-slate-900 px-10 py-6 rounded-3xl font-black text-sm uppercase tracking-widest transition-all duration-500 shadow-xl shadow-emerald-500/20 active:scale-95">
                                    Join Our Team
                                    <FaArrowRight className="group-hover/btn:translate-x-2 transition-transform duration-300" />
                                </button>
                                <p className="text-center mt-4 text-slate-500 text-[10px] font-bold uppercase tracking-tighter">
                                    Onboarding takes less than 24h
                                </p>
                            </div>

                        </div>
                    </div>
                </div>

            </div>

            {/* Custom Animations */}
            <style jsx>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
            `}</style>
        </section>
    );
}

export default FromHealthNursing;