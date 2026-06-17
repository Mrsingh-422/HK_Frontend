"use client";

import { useGlobalContext } from "@/app/context/GlobalContext";
import React from "react";
import { FaArrowRight, FaHospital, FaCheckCircle, FaChartLine } from "react-icons/fa";

function FromHealthHospital() {

  const { openModal, modalType, closeModal } = useGlobalContext();
  return (
    <section className="bg-white py-12 md:py-24 px-4 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Main Partnership Card */}
        <div className="relative bg-[#F8FAFC] border border-slate-100 rounded-[2.5rem] md:rounded-[4rem] overflow-hidden p-8 md:p-16 lg:p-20 shadow-sm">

          {/* Subtle Background Decoration */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60"></div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">

            {/* Left Side: Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest border border-emerald-100">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Hospital Partnership 2024
                </div>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.05]">
                  Empower your <br />
                  <span className="text-emerald-600">Medical Facility.</span>
                </h2>
                <p className="text-slate-500 text-sm md:text-lg font-medium max-w-md mx-auto lg:mx-0 leading-relaxed">
                  Join India's leading digital healthcare ecosystem. Manage bookings, records, and patient growth with Health Kangaroo.
                </p>
              </div>

              {/* Trust Points */}
              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 md:gap-8 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-emerald-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Verified Network</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaChartLine className="text-emerald-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Growth Focused</span>
                </div>
              </div>
            </div>

            {/* Right Side: Visual & CTA */}
            <div className="flex flex-col items-center lg:items-end gap-10">

              {/* Logo Presentation */}
              <div className="relative group">
                {/* Decorative glow */}
                <div className="absolute inset-0 bg-white rounded-3xl blur-2xl group-hover:blur-3xl transition-all opacity-40"></div>

                <div className="w-32 h-32 md:w-48 md:h-48 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-50 flex items-center justify-center p-6 md:p-10 relative z-10 transition-transform duration-500 hover:rotate-3 hover:scale-105">
                  <img
                    src="logo.png"
                    alt="Health Kangaroo"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = "https://cdn-icons-png.flaticon.com/512/3063/3063176.png";
                    }}
                  />
                </div>

                {/* Floating Badge */}
                <div className="absolute -bottom-4 -left-4 bg-slate-900 text-white p-4 rounded-2xl shadow-xl hidden md:block">
                  <FaHospital size={20} />
                </div>
              </div>

              {/* Main Action */}
              <div className="w-full max-w-sm">
                <button 
                onClick={() => openModal("register")}
                className="w-full group bg-slate-900 text-white font-black px-8 py-5 rounded-2xl transition-all duration-300 shadow-xl shadow-slate-200 flex items-center justify-center gap-4 hover:bg-emerald-600 active:scale-95">
                  <span className="uppercase tracking-[0.2em] text-xs">Register your Hospital</span>
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-center lg:text-right mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Takes less than 5 minutes to apply
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Minimal Trust Bar */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-30 grayscale hover:opacity-60 transition-opacity">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">Privacy Secured</span>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">24/7 Provider Support</span>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">Cloud Integrated</span>
        </div>
      </div>
    </section>
  );
}

export default FromHealthHospital;