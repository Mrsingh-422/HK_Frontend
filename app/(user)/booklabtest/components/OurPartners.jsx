import React, { useState } from "react";

const partners = [
  {
    id: 1,
    name: "VendorHKLK",
    desc: "",
    image: "https://cdn-icons-png.flaticon.com/512/3063/3063176.png", // Using a placeholder for the signature/logo
  },
  {
    id: 2,
    name: "HkLab",
    desc: "",
    image: "https://images.unsplash.com/photo-1511174511562-5f7f185854c8?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    name: "newlab",
    desc: "about",
    image: "https://images.unsplash.com/photo-1581595219315-a187dd40c322?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    name: "Yash Lab",
    desc: "",
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 5,
    name: "Chandni",
    desc: "lab vendor available for service",
    image: "https://cdn-icons-png.flaticon.com/512/1047/1047293.png",
  },
];

// Double the array for seamless infinite looping
const displayPartners = [...partners, ...partners];

function OurPartners() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="py-12 md:py-15 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 text-center mb-10 md:mb-16">
        {/* Header with Arrows */}
        <div className="flex items-center justify-center gap-4 mb-2">
          <svg className="w-5 h-5 text-emerald-500 cursor-pointer" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          <span className="text-emerald-500 font-bold text-lg md:text-xl tracking-wide">Laboratories</span>
          <svg className="w-5 h-5 text-emerald-500 cursor-pointer" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </div>

        {/* Main Title */}
        <h2 className="text-3xl md:text-6xl font-black text-slate-800 tracking-tight">
          Our Partners Lab's
        </h2>

        {/* Decorative Bracket Icon */}
        <div className="flex justify-end max-w-5xl mx-auto mt-4 text-emerald-500 opacity-60">
           <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
             <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
           </svg>
        </div>
      </div>

      {/* Marquee Wrapper */}
      <div 
        className="relative w-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div 
          className="flex gap-4 md:gap-8 animate-partners-marquee"
          style={{ 
            animationPlayState: isPaused ? 'paused' : 'running',
            width: 'max-content'
          }}
        >
          {displayPartners.map((lab, index) => (
            <div 
              key={`${lab.id}-${index}`}
              className="w-[220px] sm:w-[260px] md:w-[300px] flex-shrink-0 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Lab Image/Logo */}
              <div className="h-32 sm:h-40 md:h-48 bg-slate-50 flex items-center justify-center overflow-hidden">
                <img
                  src={lab.image}
                  alt={lab.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>

              {/* Lab Content */}
              <div className="p-4 md:p-6 text-center flex flex-col items-center justify-center min-h-[120px]">
                <h3 className="text-emerald-500 font-black text-lg md:text-xl uppercase tracking-tight mb-2">
                  {lab.name}
                </h3>
                {lab.desc && (
                  <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-[200px]">
                    {lab.desc}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS Animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes partners-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-partners-marquee {
          animation: partners-marquee 25s linear infinite;
        }
        @media (max-width: 768px) {
          .animate-partners-marquee {
            animation: partners-marquee 15s linear infinite;
          }
        }
      `}} />
    </div>
  );
}

export default OurPartners;