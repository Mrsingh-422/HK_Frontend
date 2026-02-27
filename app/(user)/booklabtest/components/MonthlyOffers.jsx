import React, { useState } from "react";
import { FaArrowRight } from "react-icons/fa";

const offers = [
  {
    id: 1,
    title: "Special Offer",
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam nulla libero et.",
    offer: "Save 10%",
  },
  {
    id: 2,
    title: "Monthly Coupon",
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam nulla libero et.",
    offer: "20% Off",
  },
  {
    id: 3,
    title: "Full Body Test",
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam nulla libero et.",
    offer: "Save Tax Upto",
  },
  {
    id: 4,
    title: "Special Offer",
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam nulla libero et.",
    offer: "Save 10%",
  },
  {
    id: 5,
    title: "Exclusive Deal",
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam nulla libero et.",
    offer: "Flat ₹500 Off",
  },
];

// Double the data for an infinite loop effect
const displayOffers = [...offers, ...offers];

function MonthlyOffers() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="py-8 md:py-12 overflow-hidden">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 mb-10 md:mb-16 text-center">
        <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">
          Monthly Offers
        </h2>
        <div className="flex justify-center mt-4 text-emerald-500 opacity-60">
           {/* Code icon visual from the screenshot */}
           <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
             <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
           </svg>
        </div>
      </div>

      {/* Marquee Wrapper */}
      <div 
        className="relative w-full cursor-pointer"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div 
          className="flex gap-4 md:gap-8 animate-offers-marquee"
          style={{ 
            animationPlayState: isPaused ? 'paused' : 'running',
            width: 'max-content'
          }}
        >
          {displayOffers.map((item, index) => (
            <div 
              key={`${item.id}-${index}`}
              className="w-[260px] sm:w-[280px] md:w-[320px] flex-shrink-0 bg-white border border-slate-100 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Header Title */}
              <div className="px-6 py-4">
                <h3 className="text-emerald-500 font-bold text-lg md:text-xl truncate">
                  {item.title}
                </h3>
              </div>

              {/* Separator Line */}
              <div className="w-full h-px bg-slate-100"></div>

              {/* Description Content */}
              <div className="px-6 py-8 flex-grow">
                <p className="text-slate-600 text-sm md:text-base leading-relaxed line-clamp-3">
                  {item.desc}
                </p>
              </div>

              {/* Yellow Footer Bar */}
              <div className="bg-[#fde047] hover:bg-[#facc15] transition-colors p-4 flex items-center justify-between group/offer">
                <span className="text-slate-900 font-black text-sm md:text-base uppercase tracking-wider">
                  {item.offer}
                </span>
                <FaArrowRight className="text-slate-900 transition-transform group-hover/offer:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Keyframes for the Marquee */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes offers-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-offers-marquee {
          animation: offers-marquee 20s linear infinite;
        }
        @media (max-width: 768px) {
          .animate-offers-marquee {
            animation: offers-marquee 15s linear infinite;
          }
        }
      `}} />
    </div>
  );
}

export default MonthlyOffers;