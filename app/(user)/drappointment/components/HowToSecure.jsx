"use client";
import React, { useState, useEffect } from "react";
import {
    FaHeart, FaClipboardCheck, FaViruses,
    FaShieldAlt, FaArrowRight
} from "react-icons/fa";
import { useGlobalContext } from "@/app/context/GlobalContext";

// Helper to map string names from DB to actual Icons
const IconMap = {
    heart: <FaHeart className="text-red-500" />,
    clipboard: <FaClipboardCheck className="text-[#08B36A]" />,
    virus: <FaViruses className="text-amber-600" />,
};

// Helper for dynamic colors based on theme string
const ThemeMap = {
    red: { border: "border-red-100", bg: "bg-red-50/50" },
    emerald: { border: "border-emerald-100", bg: "bg-emerald-50/50" },
    amber: { border: "border-amber-100", bg: "bg-amber-50/50" },
};

function HowToSecure() {
    const { getHowToSecureContent } = useGlobalContext();

    const [pageContent, setPageContent] = useState({
        header: "Safety First",
        title: "How To Secure!",
        items: [
            {
                id: 1,
                title: "Helpful Test Tips",
                desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus hic, nobis mollitia eveniet molestias tempora est praesentium nesciunt reprehenderit.",
                iconType: "heart",
                theme: "red",
            },
            {
                id: 2,
                title: "Get Your Results in Few Hours",
                desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus hic, nobis mollitia eveniet molestias tempora est praesentium nesciunt reprehenderit.",
                iconType: "clipboard",
                theme: "emerald",
            },
            {
                id: 3,
                title: "Tests At Home",
                desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus hic, nobis mollitia eveniet molestias tempora est praesentium nesciunt reprehenderit.",
                iconType: "virus",
                theme: "amber",
            },
        ]
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getHowToSecureContent();
                if (res?.success && res?.data) {
                    setPageContent({
                        header: res.data.header || "Safety First",
                        title: res.data.title || "How To Secure!",
                        items: res.data.items || []
                    });
                }
            } catch (err) {
                console.error("Error fetching HowToSecure data", err);
            }
        };
        fetchData();
    }, []);

    return (
        <section className="py-12 sm:py-20 lg:py-28 bg-[#f8fafc] font-sans">
            <div className="max-w-7xl mx-auto px-5 sm:px-10">

                {/* HEADER SECTION */}
                <div className="text-center mb-12 sm:mb-20">
                    <h4 className="text-[#08B36A] font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs mb-3">
                        {pageContent.header}
                    </h4>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        {/* Splitting title to color the last word if it matches 'Secure!' */}
                        {pageContent.title.includes("Secure!") ? (
                            <>How To <span className="text-[#08B36A]">Secure!</span></>
                        ) : pageContent.title}
                    </h2>
                    <div className="w-12 sm:w-20 h-1.5 bg-[#08B36A] mx-auto mt-6 rounded-full opacity-20"></div>
                </div>

                {/* STEPS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 lg:gap-12">
                    {pageContent.items.map((item, index) => {
                        const theme = ThemeMap[item.theme] || ThemeMap.emerald;
                        return (
                            <div
                                key={item.id || index}
                                className={`group relative p-8 sm:p-10 rounded-[2.5rem] border-2 transition-all duration-500 hover:shadow-2xl hover:shadow-[#08B36A]/10 flex flex-col items-center text-center
                                ${theme.border} ${theme.bg} hover:bg-white hover:border-[#08B36A]
                                ${index === 2 ? 'sm:col-span-2 lg:col-span-1 sm:max-w-md sm:mx-auto lg:max-w-none' : ''}
                            `}
                            >
                                <div className="relative mb-8">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center text-3xl sm:text-4xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                                        {IconMap[item.iconType] || <FaShieldAlt />}
                                    </div>
                                    <div className="absolute -top-2 -right-2 bg-[#08B36A] text-white p-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100">
                                        <FaShieldAlt className="text-[10px]" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-800 transition-colors group-hover:text-[#08B36A]">
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-[280px] mx-auto">
                                        {item.desc}
                                    </p>
                                </div>

                                <div className="mt-8 pt-4">
                                    <button className="flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-[#08B36A] transition-colors">
                                        Check Security <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-16 sm:mt-10 text-center">
                    <p className="inline-flex items-center gap-2 px-6 py-3 bg-slate-50 rounded-full text-slate-500 text-[10px] sm:text-xs font-bold border border-slate-100">
                        <span className="w-2 h-2 bg-[#08B36A] rounded-full animate-pulse"></span>
                        Trusted by 10,000+ patients for secure laboratory testing
                    </p>
                </div>

            </div>
        </section>
    );
}

export default HowToSecure;