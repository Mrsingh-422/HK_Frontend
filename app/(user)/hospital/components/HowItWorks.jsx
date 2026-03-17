"use client";

import React, { useState, useEffect } from "react";
import { FaSyringe, FaStethoscope, FaPills, FaFlask, FaVials, FaHeartbeat } from "react-icons/fa";
import { useGlobalContext } from "@/app/context/GlobalContext";

// --- STATIC ICON CONFIG ---
const stepStyles = [
    { icon: <FaSyringe />, color: "#3b82f6", bgColor: "bg-blue-50" },
    { icon: <FaStethoscope />, color: "#08B36A", bgColor: "bg-emerald-50" },
    { icon: <FaPills />, color: "#ef4444", bgColor: "bg-red-50" }
];

const partnerIcons = [<FaFlask />, <FaVials />, <FaHeartbeat />, <FaStethoscope />, <FaPills />];

// --- FALLBACK STATIC DATA ---
const STATIC_DATA = {
    headerTitle: "How it Works",
    steps: [
        { title: "Helpful Test Tips", desc: "Our medical experts provide curated tips to ensure your laboratory tests are accurate." },
        { title: "Healthcare Solutions", desc: "We offer comprehensive diagnostics and nursing solutions tailored to your unique needs." },
        { title: "Relief Pain", desc: "Access fast-acting pharmacy solutions and professional care plans." }
    ],
    partners: [
        { name: "Health Lab" }, { name: "Bio Test" }, { name: "Care Plus" }, { name: "Med Pro" }, { name: "Clinic Co" }
    ]
};

function HowItWorks() {
    const { getMainHowItWorksData } = useGlobalContext();
    const [data, setData] = useState(STATIC_DATA);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await getMainHowItWorksData();
                if (res?.success && res?.data) {
                    setData(res.data);
                }
            } catch (err) {
                console.error("Backend fetch failed, using static fallback.");
            }
        };
        fetchContent();
    }, [getMainHowItWorksData]);

    return (
        <section className="py-10 md:py-16 bg-[#f8fafc] font-sans overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">

                {/* MAIN HEADER */}
                <div className="text-center mb-16 md:mb-24">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                        {data.headerTitle.includes("Works") ? (
                            <>How it <span className="text-[#08B36A]">Works</span></>
                        ) : data.headerTitle}
                    </h2>
                    <div className="w-16 h-1.5 bg-[#08B36A] mx-auto mt-6 rounded-full opacity-30"></div>
                </div>

                {/* STEPS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-10">
                    {data.steps?.map((step, index) => (
                        <div
                            key={index}
                            className="group flex flex-col items-center text-center space-y-6"
                        >
                            <div
                                className={`w-24 h-24 md:w-36 md:h-36 ${stepStyles[index]?.bgColor} rounded-[2.5rem] flex items-center justify-center text-4xl md:text-6xl transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 shadow-sm group-hover:shadow-xl group-hover:shadow-[#08B36A]/10`}
                                style={{ color: stepStyles[index]?.color }}
                            >
                                {stepStyles[index]?.icon}
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl md:text-2xl font-black text-slate-800 transition-colors group-hover:text-[#08B36A]">
                                    {step.title}
                                </h3>
                                <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-[280px] md:max-w-sm mx-auto">
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* PARTNERS SECTION */}
                <div className="mt-10 md:mt-16 pt-8 border-t border-slate-100">
                    <div className="text-center mb-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                            Our Trusted Partners & Labs
                        </p>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-5 gap-8 items-center justify-items-center opacity-40 grayscale hover:grayscale-0 transition-all duration-700 cursor-default">
                        {data.partners?.map((partner, index) => (
                            <div key={index} className="flex flex-col items-center gap-2 group/partner">
                                <div className="text-2xl md:text-3xl text-slate-600 group-hover/partner:text-[#08B36A] transition-colors">
                                    {partnerIcons[index]}
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    {partner.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}

export default HowItWorks;