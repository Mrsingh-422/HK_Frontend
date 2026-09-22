"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  FaArrowLeft, 
  FaArrowRight, 
  FaAmbulance, 
  FaStethoscope, 
  FaHeartbeat, 
  FaMicroscope, 
  FaUserMd, 
  FaChevronRight 
} from "react-icons/fa";

const specialities = [
  {
    id: 1,
    title: "Orthopedic",
    desc: "Achieve joint & bone mobility with certified bone specialists.",
    icon: <FaStethoscope size={18} />,
    tag: "Bone Health"
  },
  {
    id: 2,
    title: "Endocrinology",
    desc: "Expert hormone diagnostics, diabetes management and pain relief.",
    icon: <FaHeartbeat size={18} />,
    tag: "Hormones"
  },
  {
    id: 3,
    title: "Emergency Care",
    desc: "Specialist physicians trained for 24/7 critical & urgent care.",
    icon: <FaAmbulance size={18} />,
    tag: "24/7 Care"
  },
  {
    id: 4,
    title: "Diagnostics",
    desc: "Advanced clinical analysis, pathology & high-resolution imaging.",
    icon: <FaMicroscope size={18} />,
    tag: "Lab Tests"
  },
  {
    id: 5,
    title: "General Surgery",
    desc: "Top surgeons performing complex medical procedures with care.",
    icon: <FaUserMd size={18} />,
    tag: "Surgery"
  },
];

// Double the array for seamless infinite loop
const displayData = [...specialities, ...specialities];

function OurSpecialities() {
  const router = useRouter();
  const [isPaused, setIsPaused] = useState(false);

  const handleNavigate = () => {
    router.push('/drappointment/seealldoctors');
  };

  return (
    <div className="py-14 md:py-16 bg-[#FDFEFF] overflow-hidden font-sans relative">
      {/* Background Subtle Glows */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-emerald-50/70 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-50/70 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* --- Section Header --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-12">
          <div className="max-w-xl">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="h-1.5 w-10 bg-emerald-500 rounded-full"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-600">Medical Departments</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
              Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700">Specialities.</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleNavigate}
              className="w-11 h-11 rounded-2xl border border-slate-200/80 bg-white flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-500 hover:shadow-md transition-all active:scale-95"
            >
              <FaArrowLeft size={12} />
            </button>
            <button 
              onClick={handleNavigate}
              className="w-11 h-11 rounded-2xl border border-slate-200/80 bg-white flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-500 hover:shadow-md transition-all active:scale-95"
            >
              <FaArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Marquee Slider */}
      <div
        className="relative w-full cursor-pointer"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div
          className="flex gap-5 md:gap-6 animate-speciality-marquee"
          style={{
            animationPlayState: isPaused ? 'paused' : 'running',
            width: 'max-content'
          }}
        >
          {displayData.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              onClick={handleNavigate}
              className="w-[240px] sm:w-[260px] md:w-[280px] flex-shrink-0 bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col group relative overflow-hidden"
            >
              {/* Index Number */}
              <span className="absolute top-5 right-5 text-3xl font-black text-slate-100 group-hover:text-emerald-100/60 transition-colors duration-300 select-none">
                0{(index % 5) + 1}
              </span>

              {/* Tag */}
              <div className="mb-5">
                <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
                  {item.tag}
                </span>
              </div>

              {/* Icon Container */}
              <div className="w-12 h-12 mb-5 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                {item.icon}
              </div>

              {/* Content */}
              <div className="space-y-1.5 mb-6 flex-1">
                <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed line-clamp-2">
                  {item.desc}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-800 group-hover:text-emerald-600 transition-colors">
                  Consult Doctor
                </span>
                <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-all duration-300">
                  <FaChevronRight size={10} />
                </div>
              </div>

              {/* Subtle Bottom Accent */}
              <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-500 scale-x-0 group-hover:scale-x-100 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-12 flex flex-col items-center">
        <button 
          onClick={handleNavigate}
          className="bg-slate-900 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-900/10 transition-all active:scale-95 flex items-center gap-2"
        >
          <span>View All Specialists</span>
          <FaChevronRight size={10} />
        </button>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes speciality-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-speciality-marquee {
          animation: speciality-marquee 35s linear infinite;
        }
        .animate-speciality-marquee:hover {
          animation-play-state: paused;
        }
        @media (max-width: 768px) {
          .animate-speciality-marquee {
            animation: speciality-marquee 25s linear infinite;
          }
        }
      `}} />
    </div>
  );
}

export default OurSpecialities;