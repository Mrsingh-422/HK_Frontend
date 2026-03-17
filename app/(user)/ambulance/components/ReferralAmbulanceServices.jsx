"use client";
import React, { useState, useEffect } from "react";
import { FaQuoteLeft, FaChevronRight, FaAmbulance, FaClock } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/app/context/GlobalContext";

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
    if (data.carouselImages?.length > 1) {
      const timer = setInterval(() => {
        setCurrentImg((prev) => (prev === data.carouselImages.length - 1 ? 0 : prev + 1));
      }, 2500);
      return () => clearInterval(timer);
    }
  }, [data.carouselImages]);

  return (
    <section className="py-12 md:py-10 bg-white font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* LEFT: IMAGE CAROUSEL SECTION */}
          <div className="relative order-1 lg:order-1 group">
            <div className="absolute -inset-4 bg-slate-50 rounded-[2.5rem] -rotate-1 hidden lg:block"></div>

            <div className="relative h-[250px] sm:h-[400px] md:h-[450px] lg:h-[500px] w-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-200">
              {data.carouselImages?.map((img, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImg ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105"
                    }`}
                >
                  <img
                    src={img}
                    alt={`Referral Unit ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-[3000ms]"
                    style={{ transform: index === currentImg ? 'scale(1)' : 'scale(1.1)' }}
                  />
                </div>
              ))}

              <div className="absolute top-6 left-6 z-20 bg-[#08B36A] text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                <FaAmbulance className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                  {data.badgeText || "Inter-City Transport"}
                </span>
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {data.carouselImages?.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 transition-all duration-300 rounded-full ${idx === currentImg ? "w-8 bg-[#08B36A]" : "w-2 bg-white/60"
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: CONTENT SECTION */}
          <div className="space-y-6 md:space-y-8 order-2 lg:order-2 px-2">

            <div className="relative space-y-4">
              <div className="inline-block">
                <FaQuoteLeft className="text-4xl md:text-5xl text-[#08B36A] opacity-80" />
              </div>

              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight whitespace-pre-line">
                {data.tagline}
              </h2>

              <div className="text-slate-900 text-2xl font-bold opacity-30 mt-[-10px]">”</div>
            </div>

            <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl">
              {data.description}
            </p>

            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-4 group">
                <p className="text-[#08B36A] font-black tracking-widest uppercase text-[10px] sm:text-xs">
                  {data.subHeader}
                </p>
                <div className="h-px w-24 bg-[#08B36A] opacity-40"></div>
              </div>

              <button
                onClick={() => router.push('/ambulance/seeallambulances')}
                className="cursor-pointer w-full sm:w-auto border-2 border-[#08B36A] text-[#08B36A] font-black px-10 py-4 rounded-xl hover:bg-[#08B36A] hover:text-white transition-all duration-300 shadow-lg shadow-[#08B36A]/10 active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-3">
                {data.buttonText || "Book Now"}
                <FaChevronRight className="text-xs" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest pt-4">
              <FaClock className="text-[#08B36A]" /> Rapid Response Facility
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default ReferralAmbulanceServices;