import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const partners = [
  {
    id: 1,
    name: "HkPharmacy",
    desc: "",
    image: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    name: "PharmacyHk",
    desc: "",
    image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    name: "new pharmacy",
    desc: "Hi there, We are a distributor of Generic medicines.",
    image: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    name: "Nitish",
    desc: "Hk Vendor",
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 5,
    name: "karan",
    desc: "",
    image: "https://images.unsplash.com/photo-1579152276503-6058d9488e9d?auto=format&fit=crop&w=400&q=80",
  },
];

// Double the list for seamless infinite loop
const displayPartners = [...partners, ...partners];

function OurPharmacyPartners() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="py-12 md:py-20 bg-white overflow-hidden font-sans">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 text-center mb-10 md:mb-16">
        <div className="flex items-center justify-center gap-4 mb-2">
          <FaArrowLeft className="text-[#08B36A] cursor-pointer hover:scale-110 transition-transform" />
          <span className="text-[#08B36A] font-bold text-lg md:text-xl tracking-wide">
            Our Affiliates
          </span>
          <FaArrowRight className="text-[#08B36A] cursor-pointer hover:scale-110 transition-transform" />
        </div>
        <h2 className="text-3xl md:text-6xl font-black text-slate-800 tracking-tight">
          Our Pharmacy Partners
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
          className="flex gap-4 md:gap-8 animate-pharmacy-marquee"
          style={{ 
            animationPlayState: isPaused ? 'paused' : 'running',
            width: 'max-content'
          }}
        >
          {displayPartners.map((partner, index) => (
            <div 
              key={`${partner.id}-${index}`}
              className="w-[220px] sm:w-[260px] md:w-[300px] flex-shrink-0 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
            >
              {/* Partner Image / Logo Area */}
              <div className="h-32 sm:h-40 md:h-48 bg-slate-50 overflow-hidden">
                <img
                  src={partner.image}
                  alt={partner.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Partner Details */}
              <div className="p-4 md:p-6 text-center flex flex-col items-center justify-center min-h-[130px] border-t border-slate-50">
                <h3 className="text-[#08B36A] font-black text-lg md:text-xl tracking-tight mb-2">
                  {partner.name}
                </h3>
                {partner.desc && (
                  <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-[220px]">
                    {partner.desc}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimized Marquee CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pharmacy-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-pharmacy-marquee {
          animation: pharmacy-marquee 25s linear infinite;
        }
        /* Mobile speed optimization */
        @media (max-width: 768px) {
          .animate-pharmacy-marquee {
            animation: pharmacy-marquee 15s linear infinite;
          }
        }
      `}} />
    </div>
  );
}

export default OurPharmacyPartners;