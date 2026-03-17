"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaArrowRight, FaPlusCircle, FaHandHoldingHeart } from "react-icons/fa";
import { useGlobalContext } from "@/app/context/GlobalContext";

// --- FALLBACK STATIC DATA ---
const STATIC_DATA = {
  tagline: "Hospitals",
  titlePart1: "Hospital",
  titlePart2: "Facilities",
  description: "A health facility is, in general, any location where healthcare is provided. Our network ensures state-of-the-art medical equipment and professional care.",
  badgeText: "Qualified Staff",
  carouselImages: [
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1000&q=80"
  ],
  partners: [
    { id: 1, name: "MedTech", logo: "https://cdn-icons-png.flaticon.com/512/3063/3063176.png" },
    { id: 2, name: "BioLab", logo: "https://cdn-icons-png.flaticon.com/512/1047/1047293.png" }
  ]
};

function HospitalFacilities() {
  const router = useRouter();
  const { getHospitalFacilityData } = useGlobalContext();

  const [data, setData] = useState(STATIC_DATA);
  const [currentImg, setCurrentImg] = useState(0);

  // FETCH DYNAMIC DATA
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await getHospitalFacilityData();
        if (res?.success && res?.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Backend error, using static fallback.");
      }
    };
    fetchContent();
  }, [getHospitalFacilityData]);

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
    <section className="py-7 md:py-12 bg-[#f8fafc] font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">

          {/* LEFT: IMAGE CAROUSEL */}
          <div className="lg:col-span-6 relative order-1 group">
            <div className="absolute -inset-2 md:-inset-4 bg-slate-50 rounded-[2rem] md:rounded-[3rem] rotate-1 hidden sm:block"></div>

            <div className="relative h-[250px] sm:h-[400px] md:h-[450px] lg:h-[500px] w-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-200">
              {data.carouselImages?.map((img, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImg ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105"
                    }`}
                >
                  <img
                    src={img}
                    alt={`Facility View ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-[4000ms]"
                    style={{ transform: index === currentImg ? 'scale(1)' : 'scale(1.1)' }}
                  />
                  <div className="absolute inset-0 bg-black/10 z-20"></div>
                </div>
              ))}

              <div className="absolute top-6 right-6 z-30 bg-[#08B36A] text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                <FaPlusCircle className="animate-pulse text-sm" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                  {data.badgeText || "Qualified Staff"}
                </span>
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {data.carouselImages?.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 rounded-full transition-all duration-300 ${idx === currentImg ? "w-8 bg-[#08B36A]" : "w-2 bg-white/60"
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: CONTENT SECTION */}
          <div className="lg:col-span-6 space-y-6 md:space-y-8 order-2">

            <div className="space-y-4">
              <div className="flex items-center gap-4 group">
                <FaArrowLeft className="text-[#08B36A] cursor-pointer hover:-translate-x-1 transition-transform" />
                <span className="text-[#08B36A] font-black uppercase tracking-widest text-xs md:text-sm">
                  {data.tagline}
                </span>
                <FaArrowRight className="text-[#08B36A] cursor-pointer hover:translate-x-1 transition-transform" />
              </div>

              <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
                {data.titlePart1} <span className="text-[#08B36A]">{data.titlePart2}</span>
              </h2>
            </div>

            <div className="relative">
              <div className="absolute -left-5 top-0 bottom-0 w-1 bg-[#08B36A] opacity-20 hidden md:block rounded-full"></div>
              <p className="text-slate-500 text-sm sm:text-base md:text-lg leading-relaxed md:leading-loose max-w-xl">
                {data.description}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => router.push("/hospital/seeallhospitals")}
                className="bg-[#08B36A] hover:bg-slate-900 text-white font-black px-10 py-4 rounded-xl shadow-lg shadow-[#08B36A]/20 transition-all active:scale-95 uppercase tracking-widest text-xs md:text-sm">
                Book Now
              </button>
            </div>

            {/* PARTNER LISTING */}
            <div className="pt-5 md:pt-8 border-t border-slate-100 space-y-4">
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                <FaHandHoldingHeart className="text-[#08B36A]" /> Our Trusted Medical Partners
              </p>
              <div className="flex flex-wrap gap-6 md:gap-10 opacity-40 grayscale group">
                {data.partners?.map((partner, index) => (
                  <img
                    key={index}
                    src={partner.logo}
                    alt={partner.name}
                    title={partner.name}
                    className="h-8 md:h-10 object-contain hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer"
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

export default HospitalFacilities;