import React from "react";
import { FaUserNurse, FaChevronRight } from "react-icons/fa";

function ExperiencedNurses() {
    return (
        <section className="py-16 md:py-15 bg-[#f8fafc] relative overflow-hidden font-sans">
            {/* Subtle Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#08B36A]/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#08B36A]/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>

            <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center relative z-10">

                {/* Header Section */}
                <div className="space-y-4 mb-8 md:mb-12">
                    <div className="flex justify-center">
                        <span className="bg-[#08B36A]/10 text-[#08B36A] p-3 rounded-2xl">
                            <FaUserNurse className="text-2xl md:text-3xl" />
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
                        We Have <span className="text-[#08B36A]">Experienced</span> Nurses
                    </h2>
                    <div className="w-20 h-1.5 bg-[#08B36A] mx-auto rounded-full opacity-30"></div>
                </div>

                {/* Content Section */}
                <div className="relative max-w-3xl mx-auto">
                    {/* Replicating the right-side accent bar from your screenshot */}
                    <div className="absolute -right-4 md:-right-8 top-0 bottom-0 w-1 md:w-1.5 bg-[#08B36A] rounded-full opacity-60"></div>

                    <p className="text-slate-600 text-sm md:text-lg leading-relaxed md:leading-loose">
                        Our team consists of highly qualified and compassionate nursing professionals
                        dedicated to providing the highest standard of medical care. With years of
                        experience in various specialties, they ensure that every patient receives
                        personalized attention, medical accuracy, and a path to faster recovery
                        in the comfort of their home.
                    </p>
                </div>

                {/* Action Button */}
                <div className="mt-10 md:mt-14">
                    <button className="group bg-[#08B36A] hover:bg-slate-900 text-white font-black px-10 py-4 rounded-xl shadow-xl shadow-[#08B36A]/20 transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 mx-auto uppercase tracking-widest text-sm">
                        Hire Now
                        <FaChevronRight className="text-xs group-hover:translate-x-1 transition-transform" />
                    </button>

                    <p className="mt-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
                        Available 24/7 for Emergency Support
                    </p>
                </div>

            </div>
        </section>
    );
}

export default ExperiencedNurses;