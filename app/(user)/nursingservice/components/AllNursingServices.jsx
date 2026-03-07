import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const nursingServices = [
  {
    id: 1,
    title: "Home ICU Care",
    desc: "Aims at satisfying the nursing needs of the patient at home.",
    image: "https://images.unsplash.com/photo-1516703094088-08208387bbb1?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 2,
    title: "Critical Nursing",
    desc: "Specialized care for patients with life-threatening conditions.",
    image: "https://images.unsplash.com/photo-1584820923423-9983e9a8c982?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 3,
    title: "Emergency Care",
    desc: "Immediate medical response for urgent health situations.",
    image: "https://images.unsplash.com/photo-1576765608598-0735df749e43?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 4,
    title: "Home Health",
    desc: "Professional health monitoring in your own environment.",
    image: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 5,
    title: "Infection Control",
    desc: "Preventing and managing infections for patient safety.",
    image: "https://images.unsplash.com/photo-1581595219315-a187dd40c322?auto=format&fit=crop&w=500&q=80",
  },
];

const displayServices = [...nursingServices, ...nursingServices];

function AllNursingServices() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="py-10 md:py-20 bg-[#f8fafc] overflow-hidden font-sans">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 text-center mb-8 md:mb-16">
        <div className="flex items-center justify-center gap-3 mb-2">
          <FaArrowLeft className="text-[#08B36A] text-xs md:text-base cursor-pointer hover:scale-110 transition-transform" />
          <span className="text-[#08B36A] font-bold text-sm md:text-xl tracking-wide">
            Nursing
          </span>
          <FaArrowRight className="text-[#08B36A] text-xs md:text-base cursor-pointer hover:scale-110 transition-transform" />
        </div>

        <h2 className="text-2xl md:text-6xl font-black text-slate-800 tracking-tight">
          All Services
        </h2>
      </div>

      {/* Compact Marquee Wrapper */}
      <div 
        className="relative w-full cursor-pointer"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div 
          className="flex gap-4 md:gap-8 animate-nursing-marquee"
          style={{ 
            animationPlayState: isPaused ? 'paused' : 'running',
            width: 'max-content'
          }}
        >
          {displayServices.map((service, index) => (
            <div 
              key={`${service.id}-${index}`}
              className="w-[190px] sm:w-[240px] md:w-[320px] flex-shrink-0 bg-white border border-slate-100 rounded-xl md:rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
            >
              {/* Scaled Image */}
              <div className="h-28 sm:h-36 md:h-48 overflow-hidden bg-slate-100">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Compact Content */}
              <div className="p-4 md:p-8 text-center flex flex-col items-center flex-grow">
                <h3 className="text-[#08B36A] font-black text-sm md:text-xl tracking-tight mb-2 md:mb-4 h-10 md:h-12 flex items-center line-clamp-2">
                  {service.title}
                </h3>
                
                <p className="text-slate-500 text-[10px] md:text-base leading-snug md:leading-relaxed mb-4 md:mb-8 line-clamp-2 md:line-clamp-4">
                  {service.desc}
                </p>

                {/* Smaller Button for Mobile */}
                <button className="bg-[#08B36A] hover:bg-slate-900 text-white font-bold py-1.5 md:py-2.5 px-4 md:px-8 rounded-lg transition-all shadow-md active:scale-95 text-[10px] md:text-xs uppercase tracking-widest mt-auto whitespace-nowrap">
                  Hire Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes nursing-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-nursing-marquee {
          animation: nursing-marquee 30s linear infinite;
        }
        @media (max-width: 768px) {
          .animate-nursing-marquee {
            animation: nursing-marquee 15s linear infinite;
          }
        }
      `}} />
    </div>
  );
}

export default AllNursingServices;