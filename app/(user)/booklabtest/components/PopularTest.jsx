import React, { useState } from "react";
import { FaArrowRight } from "react-icons/fa";

const popularTests = [
  {
    id: 1,
    name: "ANTI THYROGLOBULIN",
    price: "1300",
    image: "https://images.unsplash.com/photo-1579152276503-6058d9488e9d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    name: "ABSOLUTE",
    price: "152",
    image: "https://images.unsplash.com/photo-1583946099379-f9c9cb8bc030?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    name: "5-AMINOLEVULINIC",
    price: "2.0",
    image: "https://images.unsplash.com/photo-1614944034234-41da077af0d9?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    name: "ALLERGY OAT",
    price: "83602.0",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 5,
    name: "ALLERGY ONION",
    price: "0",
    image: "https://images.unsplash.com/photo-1579152276503-6058d9488e9d?auto=format&fit=crop&w=400&q=80",
  },
];

// Double the items for a seamless loop
const displayTests = [...popularTests, ...popularTests];

function PopularTest() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="py-12 md:py-20 bg-white overflow-hidden">
      {/* Responsive Header */}
      <div className="max-w-7xl mx-auto px-4 mb-8 md:mb-16 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-800 tracking-tight">
          Popular Test
        </h2>
        <div className="flex justify-center gap-1 mt-3 md:mt-4">
          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
          <span className="w-10 md:w-16 h-2 bg-emerald-500 rounded-full"></span>
        </div>
      </div>

      {/* Marquee Wrapper */}
      <div
        className="relative w-full cursor-pointer touch-pan-y"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        // For mobile "tap to pause"
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div
          className="flex gap-4 md:gap-8 animate-popular-marquee"
          style={{
            animationPlayState: isPaused ? "paused" : "running",
            width: "max-content",
          }}
        >
          {displayTests.map((test, index) => (
            <div
              key={`${test.id}-${index}`}
              className="w-[240px] sm:w-[280px] md:w-[320px] flex-shrink-0 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden"
            >
              {/* Product Image Container */}
              <div className="h-40 sm:h-48 md:h-56 p-4 bg-slate-50/50 flex items-center justify-center">
                <img
                  src={test.image}
                  alt={test.name}
                  className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Product Details */}
              <div className="p-4 sm:p-6 text-center">
                <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-[#10b981] mb-4 sm:mb-6 min-h-[40px] sm:min-h-[50px] leading-tight uppercase tracking-tight">
                  {test.name}
                </h3>

                {/* Yellow Price Box */}
                <div className="bg-[#fde047] hover:bg-[#facc15] transition-colors py-2.5 sm:py-3 px-4 sm:px-5 rounded-lg flex items-center justify-between mb-3 sm:mb-4 group/price cursor-pointer">
                  <span className="text-sm sm:text-base md:text-lg font-black text-slate-900">
                    ₹{test.price}
                  </span>
                  <FaArrowRight className="text-slate-900 text-xs sm:text-sm group-hover/price:translate-x-1 transition-transform" />
                </div>

                {/* Action Button */}
                <button className="w-full bg-[#10b981] hover:bg-slate-900 text-white font-bold py-2 sm:py-3 rounded-lg transition-all shadow-md active:scale-95 text-[10px] sm:text-xs md:text-sm uppercase tracking-wider">
                  Book A Test
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimized CSS Animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes popular-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-popular-marquee {
          animation: popular-marquee 25s linear infinite;
        }
        /* Faster animation on smaller screens to keep it engaging */
        @media (max-width: 768px) {
          .animate-popular-marquee {
            animation: popular-marquee 18s linear infinite;
          }
        }
      `}} />
    </div>
  );
}

export default PopularTest;