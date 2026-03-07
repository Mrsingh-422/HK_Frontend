import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const partnersData = [
    {
        id: 1,
        name: "Chandni",
        desc: "dyxyrc",
        image: "https://cdn-icons-png.flaticon.com/512/1047/1047293.png", // Signature style placeholder
    },
    {
        id: 2,
        name: "Nitish",
        desc: "Medical Specialist",
        image: "https://images.unsplash.com/photo-1511174511562-5f7f185854c8?auto=format&fit=crop&w=400&q=80",
    },
    {
        id: 3,
        name: "Dr. Praveen",
        desc: "Certified Partner",
        image: "https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg", // QR placeholder from screen
    },
    {
        id: 4,
        name: "Hey",
        desc: "Affiliate Lab",
        image: "https://images.unsplash.com/photo-1581595219315-a187dd40c322?auto=format&fit=crop&w=400&q=80",
    },
    {
        id: 5,
        name: "Harish",
        desc: "Nursing Head",
        image: "https://cdn-icons-png.flaticon.com/512/3063/3063176.png", // Signature style placeholder
    },
];

// Double the array for seamless infinite loop
const displayPartners = [...partnersData, ...partnersData];

function OurNursingPartners() {
    const [isPaused, setIsPaused] = useState(false);

    return (
        <div className="py-12 md:py-15 bg-[#f8fafc] overflow-hidden font-sans">
            <div className="max-w-7xl mx-auto px-4 text-center mb-10 md:mb-20">

                {/* Header with Arrows */}
                <div className="flex items-center justify-center gap-4 mb-2">
                    <FaArrowLeft className="text-[#08B36A] cursor-pointer hover:scale-110 transition-transform text-sm md:text-base" />
                    <span className="text-[#08B36A] font-bold text-sm md:text-xl tracking-wide uppercase">
                        Our Affiliates
                    </span>
                    <FaArrowRight className="text-[#08B36A] cursor-pointer hover:scale-110 transition-transform text-sm md:text-base" />
                </div>

                {/* Main Title */}
                <h2 className="text-3xl md:text-6xl font-black text-slate-800 tracking-tight">
                    Our Nursing Partners
                </h2>
            </div>

            {/* Marquee Wrapper */}
            <div
                className="relative w-full cursor-pointer touch-pan-y"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
            >
                <div
                    className="flex gap-4 md:gap-8 animate-partner-marquee"
                    style={{
                        animationPlayState: isPaused ? 'paused' : 'running',
                        width: 'max-content'
                    }}
                >
                    {displayPartners.map((partner, index) => (
                        <div
                            key={`${partner.id}-${index}`}
                            className="w-[180px] sm:w-[240px] md:w-[300px] flex-shrink-0 bg-white border border-slate-100 rounded-xl md:rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
                        >
                            {/* Partner Logo/Image Area */}
                            <div className="h-28 sm:h-40 md:h-48 bg-slate-50 flex items-center justify-center p-4 overflow-hidden">
                                <img
                                    src={partner.image}
                                    alt={partner.name}
                                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 mix-blend-multiply"
                                />
                            </div>

                            {/* Partner Details */}
                            <div className="p-4 md:p-8 text-center flex flex-col items-center justify-center min-h-[100px] md:min-h-[140px] border-t border-slate-50">
                                <h3 className="text-[#08B36A] font-black text-sm md:text-xl uppercase tracking-tight mb-1">
                                    {partner.name}
                                </h3>
                                {partner.desc && (
                                    <p className="text-slate-400 text-[10px] md:text-sm leading-relaxed max-w-[150px] md:max-w-[220px]">
                                        {partner.desc}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Optimized CSS Animation */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes partner-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-partner-marquee {
          animation: partner-marquee 30s linear infinite;
        }
        /* Faster on mobile for a smoother feel on small widths */
        @media (max-width: 768px) {
          .animate-partner-marquee {
            animation: partner-marquee 18s linear infinite;
          }
        }
      `}} />
        </div>
    );
}

export default OurNursingPartners;