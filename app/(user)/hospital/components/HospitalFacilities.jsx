"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FaArrowLeft, 
  FaArrowRight, 
  FaPlusCircle, 
  FaHandHoldingHeart, 
  FaStethoscope, 
  FaShieldAlt 
} from "react-icons/fa";
import { useGlobalContext } from "@/app/context/GlobalContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

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
          const fetchedData = res.data;

          const processedImages = (fetchedData.carouselImages || []).map((img) =>
            img.startsWith("http") ? img : `${API_URL}${img}`
          );

          const processedPartners = (fetchedData.partners || []).map((partner) => ({
            ...partner,
            logo: partner.logo 
              ? (partner.logo.startsWith("http") ? partner.logo : `${API_URL}${partner.logo}`)
              : null
          }));

          setData({
            ...fetchedData,
            carouselImages: processedImages,
            partners: processedPartners
          });
        }
      } catch (err) {
        console.error("Backend error, using static fallback.");
      }
    };
    fetchContent();
  }, [getHospitalFacilityData]);

  // CAROUSEL LOGIC
  useEffect(() => {
    const imagesCount = data.carouselImages?.length || 0;
    if (imagesCount > 1) {
      const timer = setInterval(() => {
        setCurrentImg((prev) => (prev === imagesCount - 1 ? 0 : prev + 1));
      }, 2500);
      return () => clearInterval(timer);
    }
  }, [data.carouselImages]);

  return (
    <section className="py-16 md:py-24 bg-white font-sans overflow-hidden relative">
      {/* Background Decorative Cross */}
      <div className="absolute top-0 right-0 p-20 opacity-[0.03] pointer-events-none select-none">
          <FaPlusCircle className="text-[20rem] text-slate-900" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* CONTENT SIDE (Swapped for fresh feel) */}
          <div className="lg:col-span-6 space-y-8 order-2 lg:order-1">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                <FaStethoscope className="text-[#08B36A] text-xs" />
                <span className="text-[#08B36A] font-black uppercase tracking-[0.2em] text-[10px] md:text-xs">
                  {data.tagline}
                </span>
              </div>

              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1] tracking-tighter">
                {data.titlePart1} <br/>
                <span className="text-[#08B36A]">{data.titlePart2}</span>
              </h2>
            </div>

            <div className="relative">
              <p className="text-slate-500 text-base md:text-xl leading-relaxed border-l-4 border-slate-100 pl-6 py-2">
                {data.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
              <button
                onClick={() => router.push("/hospital/seeallhospitals")}
                className="group w-full sm:w-auto bg-slate-900 text-white font-black px-12 py-5 rounded-2xl hover:bg-[#08B36A] transition-all duration-500 shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-xs"
              >
                Book Now
                <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-[#08B36A]">
                  <FaShieldAlt />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Security</p>
                  <p className="text-xs font-bold text-slate-900 uppercase">Verified Admission</p>
                </div>
              </div>
            </div>

            {/* PARTNER LOGOS */}
            <div className="pt-10 border-t border-slate-50 space-y-5">
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                <span className="h-px w-8 bg-slate-200"></span> Supporting Partners
              </p>
              <div className="flex flex-wrap gap-8 items-center opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                {data.partners?.map((partner, index) => (
                  <img
                    key={index}
                    src={partner.logo}
                    alt={partner.name}
                    className="h-7 md:h-9 object-contain"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* CAROUSEL SIDE (Floating Frame Design) */}
          <div className="lg:col-span-6 relative order-1 lg:order-2">
            <div className="relative group">
              {/* Outer Decorative Frame */}
              <div className="absolute -inset-4 border-2 border-slate-100 rounded-[3rem] -z-10 group-hover:border-[#08B36A]/20 transition-colors duration-500"></div>
              
              <div className="relative h-[300px] sm:h-[450px] lg:h-[550px] w-full rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-[10px] border-white bg-slate-50">
                {data.carouselImages && data.carouselImages.length > 0 ? (
                  data.carouselImages.map((img, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                        index === currentImg ? "opacity-100 scale-100" : "opacity-0 scale-110"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Facility ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/800x600?text=Facility+Image"; }}
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-300 font-black uppercase text-xs">Unit View Unvailable</div>
                )}

                {/* Floating Status Badge */}
                <div className="absolute top-8 right-8 z-30 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white">
                  <div className="w-2 h-2 bg-[#08B36A] rounded-full animate-ping"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 leading-none">
                    {data.badgeText || "Qualified Staff"}
                  </span>
                </div>

                {/* Navigation Dots */}
                <div className="absolute bottom-8 left-10 z-30 flex gap-3">
                  {data.carouselImages?.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 transition-all duration-500 rounded-full ${
                        idx === currentImg ? "w-12 bg-white" : "w-3 bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Navigation Controllers */}
              <div className="absolute -bottom-6 -right-6 flex gap-2 z-40">
                  <button 
                    onClick={() => setCurrentImg(prev => prev === 0 ? data.carouselImages.length - 1 : prev - 1)}
                    className="w-12 h-12 bg-white rounded-xl shadow-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#08B36A] transition-colors"
                  >
                    <FaArrowLeft />
                  </button>
                  <button 
                    onClick={() => setCurrentImg(prev => prev === data.carouselImages.length - 1 ? 0 : prev + 1)}
                    className="w-12 h-12 bg-white rounded-xl shadow-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#08B36A] transition-colors"
                  >
                    <FaArrowRight />
                  </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default HospitalFacilities;