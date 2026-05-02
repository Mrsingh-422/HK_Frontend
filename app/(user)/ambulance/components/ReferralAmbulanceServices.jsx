"use client";
import React, { useState, useEffect } from "react";
import { FaQuoteLeft, FaChevronRight, FaAmbulance, FaClock, FaRoute, FaArrowRight } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/app/context/GlobalContext";

// Ensure this matches your .env file
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// --- FALLBACK STATIC DATA ---
const STATIC_DATA = {
  tagline: "Referral Ambulance Services",
  subHeader: "Take Care Also",
  description: "Our referral ambulance service ensures a seamless transfer between medical facilities with professional care. Rapid and reliable transport.",
  buttonText: "Book Now",
  badgeText: "Inter-City Transport",
  carouselImages: [
    "https://images.unsplash.com/photo-1516703094088-08208387bbb1?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1587748801476-6218d60ad48c?auto=format&fit=crop&w=1000&q=80"
  ]
};

function ReferralAmbulanceServices() {
  const router = useRouter();
  const { getReferralAmbulanceContent } = useGlobalContext();

  const [data, setData] = useState(STATIC_DATA);
  const [currentImg, setCurrentImg] = useState(0);

  // FETCH DYNAMIC CONTENT
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await getReferralAmbulanceContent();
        if (res?.success && res?.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Backend fetch failed, using static fallback.");
      }
    };
    fetchContent();
  }, [getReferralAmbulanceContent]);

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
    <section className="py-20 md:py-32 bg-white font-sans overflow-hidden relative">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none select-none overflow-hidden">
         <div className="text-[20rem] font-black absolute -top-20 -right-20">REFERRAL</div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">

          {/* LEFT: IMAGE CAROUSEL SECTION (The Frame Design) */}
          <div className="lg:col-span-6 relative order-1 group">
            
            {/* The Main Decorative "Unit" Frame */}
            <div className="relative h-[350px] sm:h-[450px] lg:h-[600px] w-full rounded-[4rem] p-4 bg-slate-50 border border-slate-100 shadow-inner">
                
                <div className="relative h-full w-full rounded-[3rem] overflow-hidden shadow-2xl bg-slate-900 border-4 border-white">
                    {data.carouselImages && data.carouselImages.length > 0 ? (
                        data.carouselImages.map((img, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentImg ? "opacity-100 scale-100" : "opacity-0 scale-110"
                            }`}
                        >
                            <img
                            src={img.startsWith("http") ? img : `${API_URL}${img}`}
                            alt={`Referral Unit ${index + 1}`}
                            className="w-full h-full object-cover brightness-90"
                            onError={(e) => { e.target.src = "https://via.placeholder.com/1000x800?text=Referral+Image+Not+Found"; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                        </div>
                        ))
                    ) : (
                        <div className="flex items-center justify-center h-full bg-slate-100 text-slate-400">No Images Available</div>
                    )}

                    {/* Navigation Progress Bar */}
                    <div className="absolute bottom-10 left-10 right-10 z-20 flex gap-2">
                        {data.carouselImages?.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 transition-all duration-700 rounded-full ${idx === currentImg ? "flex-[3] bg-[#08B36A]" : "flex-1 bg-white/30"
                            }`}
                        />
                        ))}
                    </div>
                </div>

                {/* Floating Service Badge */}
                <div className="absolute -top-6 -right-6 bg-white p-6 rounded-3xl shadow-2xl border border-slate-50 hidden md:block">
                   <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#08B36A]">
                            <FaRoute className="text-2xl" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Logistics</span>
                   </div>
                </div>
            </div>
          </div>

          {/* RIGHT: CONTENT SECTION (Modern Editorial Layout) */}
          <div className="lg:col-span-6 space-y-10 order-2">
            
            <div className="space-y-6">
              {/* Tagline Controller */}
              <div className="flex items-center gap-4">
                 <div className="px-4 py-1.5 bg-[#08B36A] text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                    {data.badgeText || "Inter-City Transport"}
                 </div>
                 <div className="h-px flex-1 bg-slate-100"></div>
              </div>

              {/* Unique Quote/Heading Combo */}
              <div className="relative">
                <FaQuoteLeft className="text-8xl text-slate-100 absolute -top-12 -left-8 -z-10" />
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1] tracking-tighter">
                  {data.tagline}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                 <span className="text-[#08B36A] font-black text-lg uppercase tracking-widest">{data.subHeader}</span>
                 <FaArrowRight className="text-slate-200" />
              </div>
            </div>

            {/* Content Box */}
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border-l-8 border-[#08B36A] relative">
              <p className="text-slate-600 text-base md:text-xl leading-relaxed italic">
                "{data.description}"
              </p>
            </div>

            {/* Action Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
              <button
                onClick={() => router.push('/ambulance/seeallambulances')}
                className="group w-full sm:w-auto bg-slate-900 text-white font-black px-12 py-5 rounded-2xl hover:bg-[#08B36A] transition-all duration-500 shadow-xl shadow-slate-900/10 active:scale-95 flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-xs"
              >
                {data.buttonText || "Book Now"}
                <FaChevronRight className="group-hover:translate-x-2 transition-transform" />
              </button>

              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center">
                    <FaClock className="text-[#08B36A] animate-pulse" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Availability</span>
                    <span className="text-sm font-bold text-slate-900 whitespace-nowrap">Rapid Referral Ready</span>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default ReferralAmbulanceServices;