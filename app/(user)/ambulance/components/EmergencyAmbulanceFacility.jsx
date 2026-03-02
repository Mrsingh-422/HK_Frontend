import React from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

function EmergencyAmbulanceFacility() {
    // Data object for easy content management
    const facilityData = {
        tagline: "EMERGENCY AMBULANCE FACILITY",
        title: "24*7 Service Available",
        description: "Keep emergency phone numbers posted in your home where you can easily access them. Also enter the numbers into your cell phone. Everyone in your household, including children, should know when and how to call these numbers. These numbers include: fire department, police department, poison control center, ambulance center, your doctors' phone numbers, contact numbers of neighbors or nearby friends or relatives, and work phone numbers.",
        brandColor: "#08B36A"
    };

    return (
        <section className="py-12 md:py-10 lg:py-10 bg-white font-sans overflow-hidden">
            <div className="max-w-6xl mx-auto px-6 lg:px-8">

                {/* HEADER AREA */}
                <div className="flex flex-col items-center text-center space-y-4 md:space-y-6">

                    {/* Top Tagline with Arrows */}
                    <div className="flex items-center justify-center gap-4 md:gap-8 group">
                        <FaArrowLeft className="text-[#08B36A] text-xs md:text-lg cursor-pointer transition-transform group-hover:-translate-x-2" />
                        <h4 className="text-[#08B36A] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-[10px] sm:text-xs md:text-sm lg:text-base">
                            {facilityData.tagline}
                        </h4>
                        <FaArrowRight className="text-[#08B36A] text-xs md:text-lg cursor-pointer transition-transform group-hover:translate-x-2" />
                    </div>

                    {/* Bold Title */}
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                        {facilityData.title}
                    </h2>

                    {/* Decorative Divider */}
                    <div className="w-16 md:w-24 h-1.5 bg-[#08B36A] rounded-full opacity-30 mt-2"></div>
                </div>

                {/* CONTENT AREA */}
                <div className="mt-5 md:mt-12 lg:mt-10 max-w-4xl mx-auto">
                    <div className="relative p-6 md:p-10 bg-slate-50 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-[#08B36A]/5 group">

                        {/* Visual Quote Accent (Subtle) */}
                        <div className="absolute top-0 right-0 p-8 opacity-5 text-9xl font-black select-none pointer-events-none group-hover:text-[#08B36A] transition-colors">
                            +
                        </div>

                        <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed md:leading-loose text-center md:text-left">
                            {facilityData.description}
                        </p>

                        {/* Bottom Status Badge for Mobile */}
                        <div className="mt-6 flex justify-center md:justify-start">
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-100 text-[10px] font-black text-[#08B36A] uppercase tracking-widest shadow-sm">
                                <span className="w-2 h-2 bg-[#08B36A] rounded-full animate-ping"></span>
                                Active Now
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}

export default EmergencyAmbulanceFacility;