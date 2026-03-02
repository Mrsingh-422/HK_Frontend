import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const ambulancePartners = [
    {
        id: 1,
        name: "City Rescue",
        desc: "24/7 ALS/BLS emergency response partner.",
        image: "https://images.unsplash.com/photo-1587748801476-6218d60ad48c?auto=format&fit=crop&w=400&q=80",
    },
    {
        id: 2,
        name: "LifeLine Transit",
        desc: "Specialized in inter-city referral transport.",
        image: "https://images.unsplash.com/photo-1599700403969-f77b3aa74837?auto=format&fit=crop&w=400&q=80",
    },
    {
        id: 3,
        name: "Metro Medics",
        desc: "Critical care neonatal transport specialists.",
        image: "https://images.unsplash.com/photo-1612994370726-5d4d609fca1b?auto=format&fit=crop&w=400&q=80",
    },
    {
        id: 4,
        name: "SafeRide Medical",
        desc: "Affordable patient transport services.",
        image: "https://images.unsplash.com/photo-1516703094088-08208387bbb1?auto=format&fit=crop&w=400&q=80",
    },
    {
        id: 5,
        name: "Apex Ambulance",
        desc: "High-speed cardiac care emergency units.",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400&q=80",
    },
];

// Double the array for a seamless loop
const displayPartners = [...ambulancePartners, ...ambulancePartners];

function AmbulancePartners() {
    const [isPaused, setIsPaused] = useState(false);

    return (
        <div className="py-12 md:py-24 bg-white overflow-hidden font-sans">
            <div className="max-w-7xl mx-auto px-4 text-center mb-10 md:mb-16">

                {/* Header with Arrows */}
                <div className="flex items-center justify-center gap-4 mb-2">
                    <FaArrowLeft className="text-[#08B36A] cursor-pointer hover:scale-110 transition-transform text-sm md:text-base" />
                    <span className="text-[#08B36A] font-bold text-sm md:text-xl tracking-widest uppercase">
                        Ambulance's
                    </span>
                    <FaArrowRight className="text-[#08B36A] cursor-pointer hover:scale-110 transition-transform text-sm md:text-base" />
                </div>

                {/* Main Title */}
                <h2 className="text-3xl md:text-6xl font-black text-slate-800 tracking-tight">
                    Our Partners Ambulance's
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
                    className="flex gap-4 md:gap-8 animate-ambulance-marquee"
                    style={{
                        animationPlayState: isPaused ? 'paused' : 'running',
                        width: 'max-content'
                    }}
                >
                    {displayPartners.map((partner, index) => (
                        <div
                            key={`${partner.id}-${index}`}
                            className="w-[190px] sm:w-[240px] md:w-[300px] flex-shrink-0 bg-white border border-slate-100 rounded-xl md:rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col group"
                        >
                            {/* Image Area */}
                            <div className="h-32 sm:h-40 md:h-48 overflow-hidden bg-slate-50 flex items-center justify-center">
                                <img
                                    src={partner.image}
                                    alt={partner.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            </div>

                            {/* Partner Details */}
                            <div className="p-4 md:p-8 text-center flex flex-col items-center justify-center min-h-[100px] md:min-h-[150px] border-t border-slate-50">
                                <h3 className="text-[#08B36A] font-black text-sm md:text-xl uppercase tracking-tight mb-2">
                                    {partner.name}
                                </h3>
                                {partner.desc && (
                                    <p className="text-slate-400 text-[10px] md:text-sm leading-relaxed max-w-[160px] md:max-w-[240px]">
                                        {partner.desc}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Optimized CSS Keyframes */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes ambulance-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ambulance-marquee {
          animation: ambulance-marquee 30s linear infinite;
        }
        /* Mobile adjustment: Move slightly faster on small width to feel smooth */
        @media (max-width: 768px) {
          .animate-ambulance-marquee {
            animation: ambulance-marquee 18s linear infinite;
          }
        }
      `}} />
        </div>
    );
}

export default AmbulancePartners;