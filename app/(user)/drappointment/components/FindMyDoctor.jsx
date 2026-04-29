"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaSearch, FaCheckCircle } from "react-icons/fa";

export default function LandingFindDoctor() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    // Navigate to see all doctors with a query if needed, or just see all
    router.push("/drappointment/seealldoctors");
  };

  return (
    <div className="min-h-[70vh] bg-white text-slate-900 font-sans selection:bg-emerald-100 flex items-center">
      
      {/* HERO SECTION ONLY */}
      <section className="relative w-full py-24 px-6 overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-50/40 via-white to-white">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-8 border border-emerald-100">
            <FaCheckCircle className="animate-pulse" /> Verified Medical Network
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]">
            Your health journey <br />
            <span className="text-emerald-600">starts with the right expert.</span>
          </h1>

          {/* Sub-description */}
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            Connect with India's top-rated certified specialists for video consultations 
            or in-person clinic visits. Secure, fast, and reliable.
          </p>

          {/* SEARCH BOX */}
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-2 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col md:flex-row items-center gap-2 transition-all">
            <div className="relative flex-1 w-full group">
              <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search by specialty (e.g. Cardiologist)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-transparent outline-none font-medium text-slate-700"
              />
            </div>
            <button 
              onClick={handleSearch}
              className="w-full md:w-auto bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold hover:bg-emerald-600 transition-all active:scale-95 shadow-lg uppercase tracking-widest text-xs"
            >
              Search Doctors
            </button>
          </div>
        </div>

        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[100px] rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 blur-[100px] rounded-full -ml-48 -mb-48"></div>
      </section>
      
    </div>
  );
}