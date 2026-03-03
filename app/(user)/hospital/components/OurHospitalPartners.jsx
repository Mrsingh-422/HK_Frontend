import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const hospitalPartners = [
  {
    id: 1,
    name: "Pgi Chandigarh",
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus hic, nobis mollitia.",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    name: "Radius Hospital",
    desc: "hello friends, providing advanced brain and heart care services.",
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    name: "piims",
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus hic, nobis mollitia.",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    name: "City Care Center",
    desc: "Dedicated to providing 24/7 emergency and surgical services.",
    image: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 5,
    name: "Silver Oaks",
    desc: "Multi-speciality healthcare facility with world-class infrastructure.",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80",
  },
];

// Double the array for a seamless loop
const displayHospitals = [...hospitalPartners, ...hospitalPartners];

function OurHospitalPartners() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="py-8 md:py-12 bg-white overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 text-center mb-10 md:mb-20">

        {/* Tagline Header */}
        <div className="flex items-center justify-center gap-4 mb-2">
          <FaArrowLeft className="text-[#08B36A] cursor-pointer hover:scale-110 transition-transform text-sm md:text-base" />
          <span className="text-[#08B36A] font-bold text-sm md:text-xl tracking-wide uppercase">
            Hospital's
          </span>
          <FaArrowRight className="text-[#08B36A] cursor-pointer hover:scale-110 transition-transform text-sm md:text-base" />
        </div>

        {/* Main Title */}
        <h2 className="text-3xl md:text-6xl font-black text-slate-800 tracking-tight">
          Our Hospital Partners
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
          className="flex gap-4 md:gap-8 animate-hospital-marquee"
          style={{
            animationPlayState: isPaused ? 'paused' : 'running',
            width: 'max-content'
          }}
        >
          {displayHospitals.map((hospital, index) => (
            <div
              key={`${hospital.id}-${index}`}
              className="w-[200px] sm:w-[260px] md:w-[320px] flex-shrink-0 bg-white border border-slate-100 rounded-xl md:rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col group"
            >
              {/* Hospital Image Area */}
              <div className="h-32 sm:h-44 md:h-56 bg-slate-50 overflow-hidden relative">
                <img
                  src={hospital.image}
                  alt={hospital.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
              </div>

              {/* Hospital Info Area */}
              <div className="p-4 md:p-8 text-center flex flex-col items-center justify-start min-h-[140px] md:min-h-[180px]">
                <h3 className="text-[#08B36A] font-black text-sm md:text-xl uppercase tracking-tight mb-3">
                  {hospital.name}
                </h3>
                <p className="text-slate-500 text-[10px] md:text-sm leading-relaxed line-clamp-3 md:line-clamp-4">
                  {hospital.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS Animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes hospital-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-hospital-marquee {
          animation: hospital-marquee 30s linear infinite;
        }
        /* Mobile adjustment: ensure smooth motion on small screens */
        @media (max-width: 768px) {
          .animate-hospital-marquee {
            animation: hospital-marquee 15s linear infinite;
          }
        }
      `}} />
    </div>
  );
}

export default OurHospitalPartners;