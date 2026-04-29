"use client";

import React, { useState, useEffect } from "react";
import { FaCheck, FaArrowRight } from "react-icons/fa";
import { useGlobalContext } from "@/app/context/GlobalContext";

// Ensure this matches your .env file
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// --- FALLBACK STATIC DATA ---
const STATIC_DATA = {
    title: "Our Services",
    description: "Compassionate, professional nursing care at your doorstep. Our team ensures safety and personalized medical plans.",
    services: ["Personal Caring", "Nursing In Our Home", "Therap At Your Home", "Home Medication"],
    carouselImages: [
      "https://images.unsplash.com/photo-1576765608598-0735df749e43?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1584820923423-9983e9a8c982?auto=format&fit=crop&w=1000&q=80"
    ]
};

function OurNursingServices() {
  const { getOurNursingServicesContent } = useGlobalContext();
  const [currentImg, setCurrentImg] = useState(0);
  const [data, setData] = useState(STATIC_DATA);

  // FETCH DYNAMIC CONTENT
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await getOurNursingServicesContent();
        if (res?.success && res?.data) {
          // Update state with backend data
          setData(res.data);
        }
      } catch (err) {
        console.error("Backend failed, using fallback.");
      }
    };
    fetchContent();
  }, [getOurNursingServicesContent]);

  // CAROUSEL LOGIC
  useEffect(() => {
    const images = data.carouselImages || [];
    if (images.length > 1) {
        const timer = setInterval(() => {
            setCurrentImg((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        }, 2500);
        return () => clearInterval(timer);
    }
  }, [data.carouselImages]);

  return (
    <section className="py-12 md:py-24 bg-[#FDFEFF] font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] rounded-[3.5rem] overflow-hidden bg-white">
          
          {/* LEFT: IMAGE CAROUSEL (Span 5 columns) */}
          <div className="lg:col-span-5 relative h-[350px] md:h-[500px] lg:h-auto overflow-hidden bg-slate-100">
            {data.carouselImages && data.carouselImages.length > 0 ? (
              data.carouselImages.map((img, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                    index === currentImg ? "opacity-100 scale-100 z-10" : "opacity-0 scale-110 z-0"
                  }`}
                >
                  <img 
                    src={img.startsWith('http') ? img : `${API_URL}${img}`} 
                    alt="Nursing Service" 
                    className="h-full w-full object-cover" 
                    onError={(e) => { e.target.src = "https://via.placeholder.com/800x600?text=Service+Image"; }}
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent"></div>
                </div>
              ))
            ) : (
                <div className="flex items-center justify-center h-full bg-slate-100 text-slate-400 font-bold uppercase tracking-widest text-xs">No Images Available</div>
            )}

            {/* Floating Navigation Dots */}
            <div className="absolute bottom-8 left-8 z-20 flex gap-2">
               {data.carouselImages?.map((_, i) => (
                 <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentImg ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}></div>
               ))}
            </div>
          </div>

          {/* RIGHT: CONTENT BOX (Span 7 columns) */}
          <div className="lg:col-span-7 bg-[#08B36A] p-8 sm:p-12 md:p-16 lg:p-20 text-white flex flex-col justify-center relative overflow-hidden group">
            
            {/* Background Decorative Elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-1000"></div>
            <div className="absolute top-1/2 -left-10 w-32 h-32 bg-black/5 rounded-full blur-2xl"></div>

            <div className="relative z-10 space-y-8">
              <div className="space-y-4">
                <div className="inline-block px-4 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
                    Premium Care
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.1]">
                  {data.title}
                </h2>
                <div className="w-16 h-1.5 bg-white rounded-full"></div>
              </div>

              <p className="text-emerald-50/90 text-sm md:text-base lg:text-xl leading-relaxed max-w-xl font-medium">
                {data.description}
              </p>

              {/* Dynamic Service List with Glassmorphism Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {data.services?.map((service, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-300 group/item cursor-default">
                    <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-white rounded-xl flex items-center justify-center text-[#08B36A] shadow-lg shadow-black/5 group-hover/item:scale-110 transition-transform">
                      <FaCheck className="text-xs md:text-sm" />
                    </div>
                    <span className="font-black text-[10px] md:text-xs uppercase tracking-widest leading-tight">
                      {service}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-8 flex flex-col sm:flex-row items-center gap-6">
                <button className="w-full sm:w-auto bg-white text-slate-900 font-black px-10 py-5 rounded-2xl text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-900 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3 group/btn">
                  Explore Details <FaArrowRight className="group-hover/btn:translate-x-2 transition-transform" />
                </button>
                <div className="hidden sm:block h-px w-12 bg-white/30"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100/60">
                    Trusted by 5k+ Families
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Custom Keyframe Animations for Image Zoom (Logic Intact) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes subtleZoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .animate-zoom {
          animation: subtleZoom 10s infinite alternate linear;
        }
      `}} />
    </section>
  );
}

export default OurNursingServices;