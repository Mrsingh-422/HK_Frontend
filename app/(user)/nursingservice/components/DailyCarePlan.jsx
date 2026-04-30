"use client";

import React from 'react';

function DailyCarePlan() {
  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* LEFT SIDE: DECORATIVE IMAGE */}
          <div className="relative flex-shrink-0">
            {/* The Decorative Ring */}
            <div className="absolute inset-[-20px] rounded-full border-[15px] border-transparent border-l-emerald-500 border-b-emerald-600 border-t-emerald-100 opacity-20 rotate-[-45deg] hidden sm:block"></div>
            
            {/* Image Container */}
            <div className="relative w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-full overflow-hidden border-8 border-white shadow-2xl z-10">
              <img 
                src="https://media.istockphoto.com/id/1477483038/photo/doctors-nurse-or-laptop-in-night-healthcare-planning-research-or-surgery-teamwork-in-wellness.jpg?s=612x612&w=0&k=20&c=zl6vZU339QIPVzSV6wUTW3kXVNFfcyz9QXzrZ9FBsD8=" 
                alt="Comprehensive Healthcare"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Floating Graphic Element */}
            <div className="absolute bottom-4 right-4 w-24 h-24 bg-emerald-500 rounded-full z-20 flex items-center justify-center shadow-xl border-4 border-white hidden md:flex">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
            </div>
          </div>

          {/* RIGHT SIDE: CONTENT */}
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-emerald-500 rounded-full"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">
                    One stop health care solution
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Seamless Care for <span className="text-emerald-500">Every Stage of Life.</span>
              </h2>
            </div>

            <p className="text-slate-500 text-base md:text-lg leading-relaxed font-medium">
                We simplify your medical journey by bringing together <span className="text-slate-900 font-bold">expert doctors, certified nursing, and diagnostic labs</span> into a single, easy-to-use platform. No more juggling multiple apps or appointments; everything you need for your family's wellness is now right at your fingertips.
            </p>

            <p className="text-slate-500 text-base md:text-lg leading-relaxed font-medium">
                From chronic condition management to post-surgical recovery and routine wellness checks, our dedicated care coordinators ensure that you receive high-quality, personalized attention without ever leaving the comfort of your home.
            </p>

            <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <button className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 active:scale-95">
                    Explore Services
                </button>
            </div>
          </div>

        </div>
      </div>

      {/* Background Decorative Blur */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-[120px] -z-10 opacity-60"></div>
    </section>
  );
}

export default DailyCarePlan;