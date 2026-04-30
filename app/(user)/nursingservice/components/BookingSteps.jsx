"use client";

import React from 'react';
import { 
  User, 
  ShieldCheck, 
  BriefcaseMedical, 
  ClipboardCheck, 
  Ambulance 
} from 'lucide-react';

const steps = [
  {
    title: "Daily Care Plan",
    desc: "Routine mapping",
    icon: <User className="w-6 h-6" />,
    isSpecial: true,
  },
  {
    title: "Security Check",
    desc: "Safety assessment",
    icon: <ShieldCheck className="w-6 h-6" />,
  },
  {
    title: "Health Profiling",
    icon: <BriefcaseMedical className="w-6 h-6" />,
    desc: "Clinical history",
  },
  {
    title: "Digital Records",
    icon: <ClipboardCheck className="w-6 h-6" />,
    desc: "Managed data",
  },
  {
    title: "Emergency Care",
    icon: <Ambulance className="w-6 h-6" />,
    desc: "24/7 Response",
  },
];

function BookingSteps() {
  return (
    <section className="py-12 md:py-16 bg-white font-sans overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* --- COMPACT HEADER --- */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 mb-3">
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600">Onboarding</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
            Your Simple <span className="text-emerald-500">Process</span>
          </h2>
          <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto font-medium opacity-80">
            We introduce you to a dedicated care companion who guides you through every step.
          </p>
        </div>

        {/* --- STEPS GRID --- */}
        <div className="relative">
          
          {/* Subtle Connecting Line (Aligned to center of smaller icons) */}
          <div className="hidden lg:block absolute top-[32px] left-0 w-full h-[1.5px] bg-slate-100 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-y-10 gap-x-4 relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center group">
                
                {/* SMALLER ICON CIRCLE */}
                <div className="relative mb-5">
                  <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500
                    ${step.isSpecial 
                      ? 'bg-white border-2 border-emerald-500 text-emerald-600 ring-4 ring-emerald-50 shadow-md' 
                      : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-200'
                    }
                  `}>
                    {step.icon}
                  </div>

                  {/* Decorative dot for the first item */}
                  {step.isSpecial && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>

                {/* REFINED TEXT */}
                <div className="space-y-1 px-2">
                  <h3 className="text-slate-800 font-black text-sm uppercase tracking-tight group-hover:text-emerald-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    {step.desc}
                  </p>
                </div>

                {/* Mobile Divider */}
                {index !== steps.length - 1 && (
                    <div className="lg:hidden mt-6 text-slate-100">
                         <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                        </svg>
                    </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* --- COMPACT CTA --- */}
        <div className="mt-16 text-center">
            <button className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-emerald-600 transition-all active:scale-95">
                Get Started
            </button>
        </div>

      </div>
    </section>
  );
}

export default BookingSteps;