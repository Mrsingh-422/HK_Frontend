"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft, FaArrowRight, FaStethoscope, FaSyringe,
  FaMicroscope, FaDna, FaHeartbeat, FaLongArrowAltRight
} from "react-icons/fa";

const disorders = [
  {
    id: 1,
    title: "Gynecological Disorders",
    desc: "Promote your healthy eating habits with specialized screenings.",
    icon: <FaStethoscope />,
    tag: "Women Health"
  },
  {
    id: 2,
    title: "Myasthenia Gravis",
    desc: "Comprehensive diagnostic testing for neuromuscular health.",
    icon: <FaSyringe />,
    tag: "Neuromuscular"
  },
  {
    id: 3,
    title: "Endocrine System",
    desc: "Advanced analysis of hormonal and metabolic functions.",
    icon: <FaMicroscope />,
    tag: "Hormonal"
  },
  {
    id: 4,
    title: "Pharmacogenomics",
    desc: "Analyze how your genes affect your response to drugs.",
    icon: <FaDna />,
    tag: "Genetics"
  },
  {
    id: 5,
    title: "Autoimmune Disorders",
    desc: "Advanced screening for systemic immune responses.",
    icon: <FaHeartbeat />,
    tag: "Immunity"
  },
];

function YourLifecycleDisorders() {
  const scrollRef = useRef(null);
  const router = useRouter();

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 1.5 : scrollLeft + clientWidth / 1.5;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="py-12 md:py-24 bg-[#FDFDFD] relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-10 md:top-20 left-5 md:left-10 w-48 md:w-64 h-48 md:h-64 bg-emerald-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-10 md:bottom-20 right-5 md:right-10 w-64 md:w-96 h-64 md:h-96 bg-slate-50 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">

        {/* --- Header with Modern Typography --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-10 mb-10 md:mb-16">
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-400">Lifecycle Specialized</span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-tight">
              Lifecycle <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">Disorders.</span>
            </h2>
          </div>
        </div>

        {/* --- Horizontal Interaction Area --- */}
        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-8 overflow-x-auto pb-8 md:pb-12 pt-2 md:pt-4 no-scrollbar snap-x -mx-4 px-4 md:mx-0 md:px-0"
        >
          {disorders.map((item) => (
            <div
              key={item.id}
              className="min-w-[280px] sm:min-w-[320px] md:min-w-[380px] snap-center group relative bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-50 shadow-[0_15px_35px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_80px_rgba(16,185,129,0.1)] transition-all duration-500"
            >
              {/* Category Tag */}
              <span className="inline-block px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-emerald-50 text-[#059669] text-[8px] md:text-[9px] font-black uppercase tracking-widest mb-6 md:mb-8">
                {item.tag}
              </span>

              {/* Icon with Glass Effect */}
              <div className="relative w-14 h-14 md:w-20 md:h-20 mb-6 md:mb-10">
                <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl md:rounded-3xl rotate-6 group-hover:rotate-12 transition-transform duration-500" />
                <div className="absolute inset-0 bg-white border border-emerald-100 rounded-2xl md:rounded-3xl flex items-center justify-center text-2xl md:text-3xl text-emerald-500 shadow-sm group-hover:-translate-y-2 transition-transform duration-500">
                  {item.icon}
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-2 md:space-y-4 mb-8 md:mb-10">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-xs md:text-base font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {/* Action Button */}
              <button className="flex items-center gap-2 md:gap-3 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-900 group-hover:text-emerald-500 transition-all">
                Learn More <FaLongArrowAltRight className="text-emerald-500 group-hover:translate-x-2 transition-transform" />
              </button>

              {/* Hover Decorative Line */}
              <div className="absolute bottom-0 left-6 md:left-10 right-6 md:right-10 h-1 bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-full" />
            </div>
          ))}
        </div>

        {/* --- Global CTA --- */}
        <div className="mt-10 md:mt-16 flex flex-col items-center px-4">
          <button
            onClick={() => router.push('/booklabtest/seealltests')}
            className="w-full sm:w-auto bg-slate-900 text-white px-8 md:px-14 py-4 md:py-6 rounded-xl md:rounded-[2rem] font-black text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] shadow-2xl hover:bg-emerald-500 transition-all active:scale-95">
            Book A Specialized Test
          </button>
          <p className="mt-6 md:mt-8 text-slate-400 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-center">
            Diagnostic accuracy verified by NABL Experts
          </p>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default YourLifecycleDisorders;