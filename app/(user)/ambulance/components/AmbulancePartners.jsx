import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaShieldAlt } from "react-icons/fa";

const ambulancePartners = [
    {
        id: 1,
        name: "City Rescue",
        desc: "24/7 ALS/BLS emergency response partner.",
        image: "https://t3.ftcdn.net/jpg/02/88/95/14/360_F_288951431_c5ZNInuEZbN4BlYcHyZiVSuInIAy8zMa.jpg",
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
        image: "https://busesandvans.tatamotors.com/assets/buses/files/2024-02/Winger-Ambulance.jpg?VersionId=7YNVSKlohOLW7GuBsR0xBsmlp2cY6pv3",
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
        <div className="py-20 md:py-32 bg-[#F8FAFC] overflow-hidden font-sans relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: `radial-gradient(#08B36A 1px, transparent 1px)`, backgroundSize: '30px 30px' }}></div>

            <div className="max-w-7xl mx-auto px-4 text-center mb-16 relative z-10">

                {/* Header with Arrows */}
                <div className="flex items-center justify-center gap-6 mb-4 group">
                    <div className="w-10 h-10 rounded-full border border-[#08B36A]/20 flex items-center justify-center text-[#08B36A] cursor-pointer hover:bg-[#08B36A] hover:text-white transition-all">
                        <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" />
                    </div>
                    <span className="text-[#08B36A] font-black text-xs md:text-sm tracking-[0.4em] uppercase">
                        Ambulance Network
                    </span>
                    <div className="w-10 h-10 rounded-full border border-[#08B36A]/20 flex items-center justify-center text-[#08B36A] cursor-pointer hover:bg-[#08B36A] hover:text-white transition-all">
                        <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>

                {/* Main Title */}
                <h2 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-tight">
                    Trusted Fleet <span className="text-[#08B36A]">Partners</span>
                </h2>
                <p className="text-slate-400 text-sm md:text-base mt-4 max-w-lg mx-auto font-medium">
                    Collaborating with India's top-rated medical transport providers for rapid emergency response.
                </p>
            </div>

            {/* Marquee Wrapper */}
            <div
                className="relative w-full cursor-grab active:cursor-grabbing touch-pan-y"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
            >
                {/* Visual Gradient Fades for Smoothness */}
                <div className="absolute inset-y-0 left-0 w-20 md:w-40 bg-gradient-to-r from-[#F8FAFC] to-transparent z-20 pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-20 md:w-40 bg-gradient-to-l from-[#F8FAFC] to-transparent z-20 pointer-events-none"></div>

                <div
                    className="flex gap-6 md:gap-10 animate-ambulance-marquee"
                    style={{
                        animationPlayState: isPaused ? 'paused' : 'running',
                        width: 'max-content'
                    }}
                >
                    {displayPartners.map((partner, index) => (
                        <div
                            key={`${partner.id}-${index}`}
                            className="w-[260px] md:w-[380px] flex-shrink-0 bg-white rounded-[2.5rem] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-15px_rgba(8,179,106,0.15)] transition-all duration-500 overflow-hidden flex flex-col group border border-white hover:border-[#08B36A]/20"
                        >
                            {/* Image Area */}
                            <div className="relative h-40 md:h-56 overflow-hidden bg-slate-100">
                                <img
                                    src={partner.image}
                                    alt={partner.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                                    <FaCheckCircle className="text-[#08B36A] text-xs" />
                                    <span className="text-[10px] font-black uppercase text-slate-800 tracking-widest">Verified</span>
                                </div>
                            </div>

                            {/* Partner Details */}
                            <div className="p-6 md:p-10 text-center flex flex-col items-center relative">
                                {/* Floating Icon Accent */}
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#08B36A] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#08B36A]/30 border-4 border-white group-hover:rotate-12 transition-transform">
                                    <FaShieldAlt className="text-lg" />
                                </div>

                                <div className="mt-4">
                                    <h3 className="text-slate-900 font-black text-lg md:text-2xl uppercase tracking-tighter group-hover:text-[#08B36A] transition-colors">
                                        {partner.name}
                                    </h3>
                                    <div className="h-1 w-8 bg-[#08B36A]/20 mx-auto my-3 rounded-full group-hover:w-16 transition-all duration-500"></div>
                                    {partner.desc && (
                                        <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium">
                                            {partner.desc}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-50 w-full flex justify-center gap-4">
                                    <span className="text-[10px] font-black text-[#08B36A] uppercase bg-[#08B36A]/5 px-3 py-1 rounded-lg">Available 24/7</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-lg">Certified Fleet</span>
                                </div>
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
          animation: ambulance-marquee 40s linear infinite;
        }
        @media (max-width: 768px) {
          .animate-ambulance-marquee {
            animation: ambulance-marquee 25s linear infinite;
          }
        }
      `}} />
        </div>
    );
}

export default AmbulancePartners;