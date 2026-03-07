import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight, FaAmbulance, FaStethoscope, FaHeartbeat, FaMicroscope, FaUserMd } from "react-icons/fa";

const specialities = [
  {
    id: 1,
    title: "Orthologist",
    desc: "Achieve your weight loss & health goals with our expert bone specialists.",
    icon: <FaStethoscope className="text-4xl text-white" />,
  },
  {
    id: 2,
    title: "Endocrinologists",
    desc: "Anesthesiologists focus on the care of surgical patients and pain relief.",
    icon: <FaHeartbeat className="text-4xl text-white" />,
  },
  {
    id: 3,
    title: "Emergency Medicine",
    desc: "Specialist physicians are doctors who are trained and certified in specific areas.",
    icon: <FaAmbulance className="text-4xl text-white" />,
  },
  {
    id: 4,
    title: "Diagnostic Specialist",
    desc: "Anesthesiologists focus on the care of surgical patients and pain relief.",
    icon: <FaMicroscope className="text-4xl text-white" />,
  },
  {
    id: 5,
    title: "General Surgeon",
    desc: "Our surgeons are highly trained to perform complex medical procedures.",
    icon: <FaUserMd className="text-4xl text-white" />,
  },
];

// Double the array for infinite scroll
const displayData = [...specialities, ...specialities];

function OurSpecialities() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="py-12 md:py-20 bg-[#f8fafc] overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 text-center mb-10 md:mb-16">
        {/* Header with Arrows */}
        <div className="flex items-center justify-center gap-4 mb-2">
          <FaArrowLeft className="text-[#08B36A] cursor-pointer hover:scale-110 transition-transform" />
          <span className="text-[#08B36A] font-bold text-lg md:text-xl tracking-wide uppercase">
            Our Specialities
          </span>
          <FaArrowRight className="text-[#08B36A] cursor-pointer hover:scale-110 transition-transform" />
        </div>
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
          className="flex gap-4 md:gap-8 animate-speciality-marquee"
          style={{ 
            animationPlayState: isPaused ? 'paused' : 'running',
            width: 'max-content'
          }}
        >
          {displayData.map((item, index) => (
            <div 
              key={`${item.id}-${index}`}
              className="w-[260px] sm:w-[280px] md:w-[320px] flex-shrink-0 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col group"
            >
              {/* Green Header Area */}
              <div className="h-28 md:h-32 bg-[#08B36A] flex items-center justify-center relative overflow-hidden">
                {/* Visual Circle decoration behind icon */}
                <div className="absolute w-20 h-20 bg-white/10 rounded-full -top-5 -right-5"></div>
                
                <div className="z-10 transition-transform duration-500 group-hover:scale-110">
                    {item.icon}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 text-center flex flex-col items-center flex-grow">
                <h3 className="text-xl font-black text-slate-800 mb-4 h-8">
                  {item.title}
                </h3>

                <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-8 min-h-[72px]">
                  {item.desc}
                </p>

                {/* Circular Green Arrow Button */}
                <button className="w-12 h-12 bg-[#08B36A] text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:bg-slate-900 group-hover:scale-110 active:scale-90">
                  <FaArrowRight className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global CSS for seamless marquee */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes speciality-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-speciality-marquee {
          animation: speciality-marquee 30s linear infinite;
        }
        /* Mobile speed optimization */
        @media (max-width: 768px) {
          .animate-speciality-marquee {
            animation: speciality-marquee 20s linear infinite;
          }
        }
      `}} />
    </div>
  );
}

export default OurSpecialities;