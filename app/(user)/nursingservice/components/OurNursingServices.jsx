"use client";

import React, { useState, useEffect } from "react";
import { FaCheck, FaArrowRight } from "react-icons/fa";
import { useGlobalContext } from "@/app/context/GlobalContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const STATIC_DATA = {
    title: "Professional Care",
    description: "Compassionate, professional nursing care at your doorstep. Our team ensures safety and personalized medical plans for your loved ones.",
    services: ["Personal Caring", "Home Nursing", "Home Therapy", "Medication"],
    carouselImages: [
      "https://images.unsplash.com/photo-1576765608598-0735df749e43?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1584820923423-9983e9a8c982?auto=format&fit=crop&w=1000&q=80"
    ]
};

function OurNursingServices() {
  const { getOurNursingServicesContent } = useGlobalContext();
  const [currentImg, setCurrentImg] = useState(0);
  const [data, setData] = useState(STATIC_DATA);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await getOurNursingServicesContent();
        if (res?.success && res?.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Backend failed, using fallback.");
      }
    };
    fetchContent();
  }, [getOurNursingServicesContent]);

  useEffect(() => {
    const images = data.carouselImages || [];
    if (images.length > 1) {
        const timer = setInterval(() => {
            setCurrentImg((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        }, 3000);
        return () => clearInterval(timer);
    }
  }, [data.carouselImages]);

  return (
    <section className="py-6 md:py-10 bg-[#f8fafc] font-sans flex items-center min-h-[500px]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 w-full">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch bg-white rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] border border-slate-100">
          
          {/* LEFT: COMPACT CAROUSEL - HIDDEN ON MOBILE */}
          <div className="hidden lg:block lg:col-span-5 relative h-[450px] xl:h-[500px] overflow-hidden">
            {data.carouselImages?.map((img, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  index === currentImg ? "opacity-100 scale-100" : "opacity-0 scale-105"
                }`}
              >
                <img 
                  src={img.startsWith('http') ? img : `${API_URL}${img}`} 
                  alt="Service" 
                  className="h-full w-full object-cover" 
                  onError={(e) => { e.target.src = "https://via.placeholder.com/800x600"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#08B36A]/20 to-transparent"></div>
              </div>
            ))}
            
            {/* Pagination Dots */}
            <div className="absolute bottom-6 left-6 z-20 flex gap-1.5">
               {data.carouselImages?.map((_, i) => (
                 <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === currentImg ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}></div>
               ))}
            </div>
          </div>

          {/* RIGHT: CONTENT SECTION - OPTIMIZED FOR HEIGHT */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-14 flex flex-col justify-center relative">
            
            <div className="relative z-10 space-y-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-[#08B36A] animate-pulse"></span>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#08B36A]">Premium Service</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
                  {data.title}
                </h2>
              </div>

              <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-xl">
                {data.description}
              </p>

              {/* Grid of services - Compact 2-column */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {data.services?.map((service, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group">
                    <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[#08B36A] shadow-sm group-hover:bg-[#08B36A] group-hover:text-white transition-colors">
                      <FaCheck className="text-[10px]" />
                    </div>
                    <span className="font-bold text-[10px] md:text-xs uppercase tracking-wider text-slate-700">
                      {service}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center gap-6">
                <button className="w-full sm:w-auto bg-slate-900 text-white font-black px-8 py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-[#08B36A] transition-all active:scale-95 flex items-center justify-center gap-3">
                  Learn More <FaArrowRight className="text-[10px]" />
                </button>
                
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <img key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-100" src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                        ))}
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Loved by 5k+ families
                    </p>
                </div>
              </div>
            </div>

            {/* Decorative BG element */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#08B36A]/5 rounded-bl-full pointer-events-none"></div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default OurNursingServices;