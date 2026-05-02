import React from "react";
import { FaArrowLeft, FaArrowRight, FaPhoneAlt, FaShieldAlt, FaClock, FaPlusCircle, FaAmbulance } from "react-icons/fa";

function EmergencyAmbulanceFacility() {
    // Data object for easy content management
    const facilityData = {
        tagline: "EMERGENCY AMBULANCE FACILITY",
        title: "24*7 Service Available",
        description: "Keep emergency phone numbers posted in your home where you can easily access them. Also enter the numbers into your cell phone. Everyone in your household, including children, should know when and how to call these numbers. These numbers include: fire department, police department, poison control center, ambulance center, your doctors' phone numbers, contact numbers of neighbors or nearby friends or relatives, and work phone numbers.",
        brandColor: "#08B36A"
    };

    return (
        <section className="py-0 md:py-10 bg-white font-sans overflow-hidden relative">
            
            {/* Artistic Watermark Background */}
            <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none select-none">
                <h1 className="text-[25rem] font-black leading-none text-slate-900">24/7</h1>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
                    
                    {/* LEFT SIDE: BRANDING & NAVIGATION */}
                    <div className="lg:col-span-5 space-y-10">
                        
                        <div className="space-y-6">
                            {/* Animated Tagline */}
                            <div className="flex items-center gap-4">
                                <span className="h-px w-12 bg-[#08B36A]"></span>
                                <span className="text-[#08B36A] font-black uppercase tracking-[0.3em] text-[10px] md:text-xs">
                                    {facilityData.tagline}
                                </span>
                            </div>

                            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter">
                                {facilityData.title.split(' ')[0]} <br/>
                                <span className="text-[#08B36A]">{facilityData.title.split(' ').slice(1).join(' ')}</span>
                            </h2>
                        </div>

                        {/* Navigation Controllers */}
                        <div className="flex items-center gap-6">
                            <div className="flex gap-2">
                                <button className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-[#08B36A] transition-all group shadow-xl shadow-slate-200">
                                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                                </button>
                                <button className="w-14 h-14 rounded-2xl border-2 border-slate-100 text-slate-400 flex items-center justify-center hover:border-[#08B36A] hover:text-[#08B36A] transition-all group">
                                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                            <div className="h-px flex-1 bg-slate-100"></div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-slate-50 rounded-[2rem] space-y-3">
                                <FaClock className="text-[#08B36A] text-2xl" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Response</p>
                                <p className="text-sm font-bold text-slate-900">Immediate Action</p>
                            </div>
                            <div className="p-6 bg-[#08B36A]/5 rounded-[2rem] border border-[#08B36A]/10 space-y-3">
                                <FaAmbulance className="text-[#08B36A] text-2xl" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coverage</p>
                                <p className="text-sm font-bold text-slate-900">City-Wide Units</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: THE PROTOCOL CARD */}
                    <div className="lg:col-span-7">
                        <div className="relative group">
                            {/* Decorative Accent */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#08B36A]/5 rounded-full blur-3xl group-hover:bg-[#08B36A]/10 transition-colors"></div>
                            
                            {/* Main Information Board */}
                            <div className="relative bg-white border border-slate-100 p-8 md:p-14 rounded-[3rem] shadow-2xl shadow-slate-200/60">
                                
                                <div className="flex flex-col gap-8 md:gap-12">
                                    
                                    {/* Quote and Icon Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-[#08B36A]">
                                            <FaPlusCircle className="text-xl" />
                                        </div>
                                        <div className="px-4 py-1 bg-emerald-50 rounded-full text-[10px] font-black text-[#08B36A] uppercase tracking-widest">
                                            Public Safety Notice
                                        </div>
                                    </div>

                                    {/* Description Text */}
                                    <p className="text-slate-600 text-lg md:text-2xl leading-relaxed md:leading-[1.8] font-medium border-l-4 border-slate-100 pl-6 md:pl-10">
                                        {facilityData.description}
                                    </p>

                                    {/* Feature Summary Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-50">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-[#08B36A] flex-shrink-0">
                                                <FaPhoneAlt className="text-sm" />
                                            </div>
                                            <div>
                                                <h5 className="font-black text-slate-900 text-xs uppercase tracking-widest mb-1">Accessibility</h5>
                                                <p className="text-slate-400 text-xs leading-relaxed">Save primary emergency contacts into your mobile speed-dial.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-[#08B36A] flex-shrink-0">
                                                <FaShieldAlt className="text-sm" />
                                            </div>
                                            <div>
                                                <h5 className="font-black text-slate-900 text-xs uppercase tracking-widest mb-1">Safety First</h5>
                                                <p className="text-slate-400 text-xs leading-relaxed">Educate all family members on location-sharing protocols.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Floating Tag */}
                            <div className="absolute -bottom-6 left-10 md:left-20 bg-[#08B36A] text-white px-8 py-4 rounded-2xl shadow-xl flex items-center gap-3">
                                <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                                <span className="text-[10px] font-black uppercase tracking-widest">Emergency Ready System</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

export default EmergencyAmbulanceFacility;