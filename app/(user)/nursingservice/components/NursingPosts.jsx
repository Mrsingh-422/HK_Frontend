"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { FaUserNurse, FaClipboardList, FaHeartbeat } from "react-icons/fa";
import { useGlobalContext } from "@/app/context/GlobalContext";

// --- STATIC ICON CONFIG ---
const stepStyles = [
  { id: 1, icon: <FaUserNurse />, color: "#08B36A", bgColor: "bg-emerald-50" },
  { id: 2, icon: <FaClipboardList />, color: "#3b82f6", bgColor: "bg-blue-50" },
  { id: 3, icon: <FaHeartbeat />, color: "#ef4444", bgColor: "bg-red-50" },
];

// --- FALLBACK STATIC CONTENT ---
const STATIC_DATA = {
    headerTag: "Step-By-Step",
    mainTitle: "How It Works",
    steps: [
      { title: "Speak To care Advisor", desc: "Our expert advisors are ready to listen and understand your specific home nursing requirements." },
      { title: "Make a Care Plan together", desc: "We collaborate with your family and doctors to create a customized medical roadmap." },
      { title: "Your personalised care begins", desc: "Experience professional, compassionate medical care in the comfort of your home." },
    ]
};

function NursingPosts() {
  const router = useRouter();
  const { getNursingStepsData } = useGlobalContext();
  const [data, setData] = useState(STATIC_DATA);

  useEffect(() => {
    const fetchContent = async () => {
        try {
            const res = await getNursingStepsData();
            if (res?.success && res?.data) {
                setData(res.data);
            }
        } catch (err) {
            console.error("Backend fetch failed, using static data.");
        }
    };
    fetchContent();
  }, [getNursingStepsData]);

  return (
    <section className="py-8 sm:py-10 lg:py-28 bg-[#f8fafc] font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-10">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-16 md:mb-24">
          <h4 className="text-[#08B36A] font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs mb-4">
            {data.headerTag}
          </h4>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
            {/* Logic to color 'Works' if title contains it, or just display dynamic title */}
            {data.mainTitle.includes("Works") ? (
                <>How It <span className="text-[#08B36A]">Works</span></>
            ) : data.mainTitle}
          </h2>
          <div className="w-12 sm:w-20 h-1.5 bg-[#08B36A] mx-auto mt-6 rounded-full opacity-20"></div>
        </div>

        {/* STEPS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-10 xl:gap-20">
          {data.steps.map((step, index) => (
            <div 
              key={index} 
              className="group relative flex flex-col items-center text-center"
            >
              {/* CONNECTING LINE (Desktop Only) */}
              {index !== data.steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-1/2 w-full h-[2px] bg-slate-100 -z-10">
                  <div className="h-full bg-[#08B36A] w-0 group-hover:w-full transition-all duration-700"></div>
                </div>
              )}

              {/* ICON BLOCK */}
              <div className="relative mb-8 md:mb-10">
                {/* Step Number */}
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center z-20 border border-slate-50">
                  <span className="text-[#08B36A] font-black text-sm">0{index + 1}</span>
                </div>
                
                {/* Main Icon Container - Merged from STATIC icon config */}
                <div 
                  className={`w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 ${stepStyles[index]?.bgColor || 'bg-slate-50'} rounded-[2.5rem] md:rounded-[3rem] flex items-center justify-center text-4xl sm:text-5xl md:text-6xl transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 shadow-sm group-hover:shadow-2xl group-hover:shadow-[#08B36A]/20`}
                  style={{ color: stepStyles[index]?.color || '#08B36A' }}
                >
                  {stepStyles[index]?.icon || <FaUserNurse />}
                </div>
              </div>

              {/* TEXT CONTENT */}
              <div className="space-y-4 md:space-y-5 px-4">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 transition-colors group-hover:text-[#08B36A]">
                  {step.title}
                </h3>
                <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-[320px] md:max-w-sm mx-auto">
                  {step.desc}
                </p>
              </div>

              {/* MOBILE DIVIDER */}
              {index !== data.steps.length - 1 && (
                <div className="lg:hidden w-px h-12 bg-gradient-to-b from-[#08B36A] to-transparent mt-12 opacity-30"></div>
              )}
            </div>
          ))}
        </div>

        {/* FOOTER ACTION */}
        <div className="mt-10 md:mt-16 text-center">
            <button 
            onClick={() => router.push('/nursingservice/seeallnurses')}
            className="cursor-pointer bg-[#08B36A] hover:bg-slate-900 text-white font-black px-10 py-4 rounded-2xl shadow-xl shadow-[#08B36A]/20 transition-all active:scale-95 uppercase tracking-widest text-xs md:text-sm">
                Get Started Now
            </button>
        </div>

      </div>
    </section>
  );
}

export default NursingPosts;