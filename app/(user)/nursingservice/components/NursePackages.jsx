import React, { useState } from "react";

const packagesData = [
  {
    id: 1,
    name: "complete care nurse",
    price: "400",
    desc: "Aims at satisfying the nursing needs of the patient at home.",
    image: "https://images.unsplash.com/photo-1576765608598-0735df749e43?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    name: "home care nurse",
    price: "700",
    desc: "Professional health monitoring in your own environment.",
    image: "https://images.unsplash.com/photo-1584820923423-9983e9a8c982?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    name: "cancer care nurse",
    price: "400",
    desc: "Specialized support for patients with serious medical needs.",
    image: "https://images.unsplash.com/photo-1516703094088-08208387bbb1?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    name: "icu care nurse",
    price: "300",
    desc: "Critical monitoring and life-support assistance at home.",
    image: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=400&q=80",
  },
];

// Double the list for seamless infinite loop
const displayPackages = [...packagesData, ...packagesData];

function NursePackages() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="py-10 md:py-20 bg-white overflow-hidden font-sans">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 text-center mb-8 md:mb-16">
        <h2 className="text-2xl md:text-5xl font-black text-slate-800 tracking-tight">
          Nurse Packages
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
          className="flex gap-3 md:gap-8 animate-package-marquee"
          style={{ 
            animationPlayState: isPaused ? 'paused' : 'running',
            width: 'max-content'
          }}
        >
          {displayPackages.map((pkg, index) => (
            <div 
              key={`${pkg.id}-${index}`}
              className="w-[180px] sm:w-[240px] md:w-[320px] flex-shrink-0 bg-white border border-slate-100 rounded-xl md:rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
            >
              {/* Compact Image */}
              <div className="h-28 sm:h-40 md:h-52 overflow-hidden bg-slate-50">
                <img
                  src={pkg.image}
                  alt={pkg.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Compact Content */}
              <div className="p-3 sm:p-5 md:p-8 text-center flex flex-col items-center flex-grow">
                <h3 className="text-[11px] sm:text-base md:text-lg font-bold text-[#08B36A] mb-1.5 md:mb-3 capitalize line-clamp-1">
                  {pkg.name}
                </h3>
                
                <p className="text-slate-500 text-[10px] sm:text-xs md:text-sm leading-tight md:leading-relaxed mb-3 md:mb-6 line-clamp-2 md:line-clamp-3">
                  {pkg.desc}
                </p>

                {/* Price Display */}
                <p className="text-slate-900 font-black text-sm sm:text-lg md:text-xl mb-3 md:mb-6">
                  ₹{pkg.price}
                </p>

                {/* Responsive Button */}
                <button className="w-full bg-[#08B36A] hover:bg-slate-900 text-white font-bold py-1.5 md:py-3 rounded-lg md:rounded-xl transition-all shadow-md active:scale-95 text-[10px] sm:text-xs uppercase tracking-widest mt-auto">
                  Hire Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimized CSS Keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes package-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-package-marquee {
          animation: package-marquee 25s linear infinite;
        }
        @media (max-width: 768px) {
          .animate-package-marquee {
            animation: package-marquee 15s linear infinite;
          }
        }
      `}} />
    </div>
  );
}

export default NursePackages;