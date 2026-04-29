"use client";

import React, { useState, useRef } from "react";
// ERROR FIXED: Changed from "next/router" to "next/navigation"
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
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="py-24 bg-[#FDFDFD] relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-slate-50 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* --- Header with Modern Typography --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Lifecycle Specialized</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter">
              Lifecycle <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">Disorders.</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => scroll('left')}
              className="w-14 h-14 rounded-2xl border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100 transition-all active:scale-90"
            >
              <FaArrowLeft size={14} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-14 h-14 rounded-2xl border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100 transition-all active:scale-90"
            >
              <FaArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* --- Horizontal Interaction Area --- */}
        <div 
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto pb-12 pt-4 no-scrollbar snap-x"
        >
          {disorders.map((item) => (
            <div 
              key={item.id}
              className="min-w-[300px] md:min-w-[380px] snap-center group relative bg-white rounded-[2.5rem] p-10 border border-slate-50 shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_80px_rgba(16,185,129,0.1)] transition-all duration-500"
            >
              {/* Category Tag */}
              <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-[#059669] text-[9px] font-black uppercase tracking-widest mb-8">
                {item.tag}
              </span>

              {/* Icon with Glass Effect */}
              <div className="relative w-20 h-20 mb-10">
                <div className="absolute inset-0 bg-emerald-500/10 rounded-3xl rotate-6 group-hover:rotate-12 transition-transform duration-500" />
                <div className="absolute inset-0 bg-white border border-emerald-100 rounded-3xl flex items-center justify-center text-3xl text-emerald-500 shadow-sm group-hover:-translate-y-2 transition-transform duration-500">
                  {item.icon}
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-4 mb-10">
                <h3 className="text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {/* Action Button */}
              <button className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-900 group-hover:text-emerald-500 transition-all">
                Learn More <FaLongArrowAltRight className="text-emerald-500 group-hover:translate-x-2 transition-transform" />
              </button>

              {/* Hover Decorative Line */}
              <div className="absolute bottom-0 left-10 right-10 h-1 bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-full" />
            </div>
          ))}
        </div>

        {/* --- Global CTA --- */}
        <div className="mt-16 flex flex-col items-center">
            <button
            onClick={() => router.push('/booklabtest/seealltests')}
            className="bg-slate-900 text-white px-14 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-emerald-500 transition-all active:scale-95">
                Book A Specialized Test
            </button>
            <p className="mt-8 text-slate-400 text-[9px] font-black uppercase tracking-[0.4em]">
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