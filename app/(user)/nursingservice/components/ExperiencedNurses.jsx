"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { FaUserNurse, FaChevronRight } from "react-icons/fa";
import { useGlobalContext } from "@/app/context/GlobalContext";

// --- FALLBACK STATIC DATA ---
const STATIC_DATA = {
    title: "We Have Experienced Nurses",
    description: "Our team consists of highly qualified and compassionate nursing professionals dedicated to providing the highest standard of medical care. With years of experience in various specialties, they ensure that every patient receives personalized attention.",
    buttonText: "Hire Now",
    footerNote: "Available 24/7 for Emergency Support"
};
    
function ExperiencedNurses() {
    const router = useRouter();
    const { getExperiencedNursesData } = useGlobalContext();
    const [data, setData] = useState(STATIC_DATA);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await getExperiencedNursesData();
                if (res?.success && res?.data) {
                    setData(res.data);
                }
            } catch (err) {
                console.error("Backend fetch failed, using static fallback.");
            }
        };
        fetchContent();
    }, [getExperiencedNursesData]);

    // Logic to highlight the word "Experienced" in the title
    const renderTitle = (title) => {
        const parts = title.split(/(Experienced)/gi);
        return parts.map((part, i) =>
            part.toLowerCase() === "experienced"
                ? <span key={i} className="text-[#08B36A]">{part}</span>
                : part
        );
    };

    return (
        <section className="py-12 md:py-20 lg:py-24 bg-white relative overflow-hidden font-sans">
            {/* Subtle Background Decoration */}
            <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-[#08B36A]/5 rounded-full -mr-24 -mt-24 md:-mr-32 md:-mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-[#08B36A]/5 rounded-full -ml-24 -mb-24 md:-ml-32 md:-mb-32 blur-3xl"></div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

                {/* Header Section */}
                <div className="space-y-3 md:space-y-4 mb-8 md:mb-12">
                    <div className="flex justify-center">
                        <span className="bg-[#08B36A]/10 text-[#08B36A] p-2.5 md:p-3 rounded-xl md:rounded-2xl">
                            <FaUserNurse className="text-xl md:text-3xl" />
                        </span>
                    </div>
                    {/* Heading size adjusted: text-2xl on mobile, 4xl on tablet, 5xl on laptop/desktop */}
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                        {renderTitle(data.title)}
                    </h2>
                    <div className="w-12 md:w-20 h-1 md:h-1.5 bg-[#08B36A] mx-auto rounded-full opacity-30"></div>
                </div>

                {/* Content Section */}
                <div className="relative max-w-3xl mx-auto px-2 md:px-0">
                    {/* Vertical accent bar - hidden on very small screens for better readability, visible from sm up */}
                    <div className="hidden sm:block absolute -right-4 md:-right-8 top-0 bottom-0 w-1 md:w-1.5 bg-[#08B36A] rounded-full opacity-60"></div>

                    <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed md:leading-loose font-medium">
                        {data.description}
                    </p>
                </div>

                {/* Action Button */}
                <div className="mt-8 md:mt-14">
                    <button
                        onClick={() => router.push('/nursingservice/seeallnurses')}
                        className="cursor-pointer group bg-[#08B36A] hover:bg-slate-900 text-white font-black px-8 md:px-10 py-3.5 md:py-4 rounded-xl shadow-xl shadow-[#08B36A]/20 transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 mx-auto uppercase tracking-widest text-[12px] md:text-sm w-full sm:w-auto">
                        {data.buttonText}
                        <FaChevronRight className="text-[10px] md:text-xs group-hover:translate-x-1 transition-transform" />
                    </button>

                    <p className="mt-6 text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest px-4">
                        {data.footerNote}
                    </p>
                </div>

            </div>
        </section>
    );
}

export default ExperiencedNurses;