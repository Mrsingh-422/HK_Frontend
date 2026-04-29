"use client";

import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight, FaAmbulance, FaStethoscope, FaHeartbeat, FaMicroscope, FaUserMd, FaPlus } from "react-icons/fa";

const specialities = [
  {
    id: 1,
    title: "Orthologist",
    desc: "Achieve your weight loss & health goals with our expert bone specialists.",
    icon: <FaStethoscope />,
    tag: "Bone Health"
  },
  {
    id: 2,
    title: "Endocrinologists",
    desc: "Focus on the care of hormonal functions, surgical patients and pain relief.",
    icon: <FaHeartbeat />,
    tag: "Hormones"
  },
  {
    id: 3,
    title: "Emergency Medicine",
    desc: "Specialist physicians trained and certified in handling specific urgent areas.",
    icon: <FaAmbulance />,
    tag: "24/7 Care"
  },
  {
    id: 4,
    title: "Diagnostic Specialist",
    desc: "Focus on the care of patients via advanced imaging and laboratory analysis.",
    icon: <FaMicroscope />,
    tag: "Diagnostics"
  },
  {
    id: 5,
    title: "General Surgeon",
    desc: "Our surgeons are highly trained to perform complex medical procedures safely.",
    icon: <FaUserMd />,
    tag: "Surgery"
  },
];

// Double the array for infinite scroll
const displayData = [...specialities, ...specialities];

function OurSpecialities() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="py-20 md:py-10 bg-[#FDFEFF] overflow-hidden font-sans relative">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-50 rounded-full blur-[120px] opacity-60" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-slate-50 rounded-full blur-[120px] opacity-60" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* --- Section Header --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-1.5 w-12 bg-[#08B36A] rounded-full"></span>
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#08B36A]">Medical Departments</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[1.1]">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#08B36A] to-emerald-800">Specialities.</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="w-14 h-14 rounded-2xl border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-[#08B36A] hover:border-[#08B36A] hover:shadow-xl hover:shadow-emerald-100 transition-all">
              <FaArrowLeft size={14} />
            </button>
            <button className="w-14 h-14 rounded-2xl border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-[#08B36A] hover:border-[#08B36A] hover:shadow-xl hover:shadow-emerald-100 transition-all">
              <FaArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Marquee Wrapper */}
      <div
        className="relative w-full cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div
          className="flex gap-8 md:gap-12 animate-speciality-marquee"
          style={{
            animationPlayState: isPaused ? 'paused' : 'running',
            width: 'max-content'
          }}
        >
          {displayData.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="w-[300px] sm:w-[350px] md:w-[420px] flex-shrink-0 bg-white border border-slate-100 rounded-[3rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_80px_rgba(8,179,106,0.1)] transition-all duration-700 flex flex-col group relative overflow-hidden"
            >
              {/* Editorial Index Number */}
              <span className="absolute top-10 right-10 text-5xl font-black text-gray-300 group-hover:text-emerald-50 transition-colors duration-500">
                0{(index % 5) + 1}
              </span>

              {/* Tag */}
              <div className="mb-8">
                <span className="bg-emerald-50 text-[#08B36A] text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-emerald-100">
                  {item.tag}
                </span>
              </div>

              {/* Icon Container with Floating Glass Effect */}
              <div className="relative w-20 h-20 mb-10">
                <div className="absolute inset-0 bg-[#08B36A]/10 rounded-3xl rotate-6 group-hover:rotate-12 transition-transform duration-500" />
                <div className="absolute inset-0 bg-white border border-emerald-50 rounded-3xl flex items-center justify-center text-3xl text-[#08B36A] shadow-sm group-hover:-translate-y-2 transition-transform duration-500">
                  {item.icon}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4 mb-12">
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 group-hover:text-[#08B36A] transition-colors duration-500 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {/* Action Area */}
              <div className="mt-auto flex items-center justify-between">
                <button className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 group-hover:text-[#08B36A] transition-all">
                  Consult Now <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
                </button>
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center transition-all duration-500 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-hover:bg-[#08B36A] shadow-lg">
                  <FaPlus size={12} />
                </div>
              </div>

              {/* Bottom Accent Line */}
              <div className="absolute bottom-0 left-0 h-1.5 bg-[#08B36A] transition-all duration-700 scale-x-0 group-hover:scale-x-100 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-20 flex flex-col items-center">
        <button className="bg-slate-900 text-white px-14 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-[#08B36A] transition-all active:scale-95">
          View All Specialized Panels
        </button>
        <p className="mt-8 text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
          Precision accuracy verified by NABL Experts
        </p>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes speciality-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-speciality-marquee {
          animation: speciality-marquee 45s linear infinite;
        }
        .animate-speciality-marquee:hover {
          animation-play-state: paused;
        }
        @media (max-width: 768px) {
          .animate-speciality-marquee {
            animation: speciality-marquee 30s linear infinite;
          }
        }
      `}} />
    </div>
  );
}

export default OurSpecialities;