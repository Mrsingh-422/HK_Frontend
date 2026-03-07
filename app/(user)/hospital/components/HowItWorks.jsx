import React from "react";
import { FaSyringe, FaStethoscope, FaPills, FaFlask, FaVials, FaHeartbeat } from "react-icons/fa";

function HowItWorks() {
    // 1. DATA OBJECTS
    const steps = [
        {
            id: 1,
            title: "Helpful Test Tips",
            desc: "Our medical experts provide curated tips to ensure your laboratory tests are accurate and stress-free. Simple guidance for better preparation.",
            icon: <FaSyringe />,
            color: "#3b82f6", // Blue
            bgColor: "bg-blue-50"
        },
        {
            id: 2,
            title: "Healthcare Solutions",
            desc: "We offer comprehensive diagnostics and nursing solutions tailored to your unique lifecycle disorders and emergency needs.",
            icon: <FaStethoscope />,
            color: "#08B36A", // Brand Green
            bgColor: "bg-emerald-50"
        },
        {
            id: 3,
            title: "Relief Pain",
            desc: "Access fast-acting pharmacy solutions and professional care plans designed to manage chronic pain and improve quality of life.",
            icon: <FaPills />,
            color: "#ef4444", // Red
            bgColor: "bg-red-50"
        }
    ];

    const partners = [
        { id: 1, name: "Health Lab", icon: <FaFlask /> },
        { id: 2, name: "Bio Test", icon: <FaVials /> },
        { id: 3, name: "Care Plus", icon: <FaHeartbeat /> },
        { id: 4, name: "Med Pro", icon: <FaStethoscope /> },
        { id: 5, name: "Clinic Co", icon: <FaPills /> },
    ];

    return (
        <section className="py-10 md:py-16 bg-[#f8fafc] font-sans overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">

                {/* MAIN HEADER */}
                <div className="text-center mb-16 md:mb-24">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                        How it <span className="text-[#08B36A]">Works</span>
                    </h2>
                    <div className="w-16 h-1.5 bg-[#08B36A] mx-auto mt-6 rounded-full opacity-30"></div>
                </div>

                {/* STEPS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-10">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className="group flex flex-col items-center text-center space-y-6"
                        >
                            {/* Animated Icon Container */}
                            <div
                                className={`w-24 h-24 md:w-36 md:h-36 ${step.bgColor} rounded-[2.5rem] flex items-center justify-center text-4xl md:text-6xl transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 shadow-sm group-hover:shadow-xl group-hover:shadow-[#08B36A]/10`}
                                style={{ color: step.color }}
                            >
                                {step.icon}
                            </div>

                            {/* Text Content */}
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

                {/* PARTNERS SECTION (Trust Bar) */}
                <div className="mt-10 md:mt-16 pt-8 border-t border-slate-100">
                    <div className="text-center mb-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                            Our Trusted Partners & Labs
                        </p>
                    </div>

                    {/* Responsive Partners List */}
                    {/* Mobile: Grid 3 | Tablet: Grid 5 */}
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-8 items-center justify-items-center opacity-40 grayscale hover:grayscale-0 transition-all duration-700 cursor-default">
                        {partners.map((partner) => (
                            <div key={partner.id} className="flex flex-col items-center gap-2 group/partner">
                                <div className="text-2xl md:text-3xl text-slate-600 group-hover/partner:text-[#08B36A] transition-colors">
                                    {partner.icon}
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{partner.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}

export default HowItWorks;