"use client";
import React, { useState, useEffect } from "react";
import { FaChevronRight, FaCheckCircle, FaClock, FaHeartbeat, FaStethoscope } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/app/context/GlobalContext";

// Ensure this matches your .env file
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// --- FALLBACK STATIC DATA ---
const STATIC_DATA = {
  title: "Medical Emergency",
  description: "Our dedicated emergency team is ready 24/7 to provide immediate medical assistance and rapid response care.",
  highlightText: "Available Booking Online",
  buttonText: "Book Now",
  carouselImages: [
    "https://images.unsplash.com/photo-1587748801476-6218d60ad48c?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1599700403969-f77b3aa74837?auto=format&fit=crop&w=1000&q=80"
  ]
};

function MedicalEmergency() {
  const router = useRouter();
  const { getMedicalEmergencyData } = useGlobalContext();

  const [data, setData] = useState(STATIC_DATA);
  const [currentImg, setCurrentImg] = useState(0);

  // FETCH DYNAMIC CONTENT
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await getMedicalEmergencyData();
        if (res?.success && res?.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Backend error, using static fallback.");
      }
    };
    fetchContent();
  }, [getMedicalEmergencyData]);

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
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/50 -skew-x-6 translate-x-20 pointer-events-none"></div>
      <FaHeartbeat className="absolute bottom-10 right-10 text-[15rem] text-slate-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">

          {/* LEFT SECTION: CONTENT */}
          <div className="lg:col-span-6 order-2 lg:order-1 space-y-8">
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-px w-8 bg-[#08B36A]"></div>
                <span className="text-[#08B36A] font-black text-xs uppercase tracking-[0.3em]">Critical Care</span>
              </div>
              <h2 className="text-5xl md:text-6xl lg:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter whitespace-pre-line">
                {data.title}
              </h2>
            </div>

            <div className="relative">
                <p className="text-slate-600 text-lg md:text-xl leading-relaxed max-w-xl border-l-4 border-[#08B36A] pl-6 py-2">
                {data.description}
                </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                    <FaCheckCircle className="text-[#08B36A] text-xl animate-pulse flex-shrink-0" />
                    <span className="font-bold text-slate-700 text-sm">{data.highlightText}</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <FaClock className="text-slate-400 text-xl flex-shrink-0" />
                    <span className="font-bold text-slate-700 text-sm">24/7 Rapid Response</span>
                </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => router.push('/ambulance/seeallambulances')}
                className="group w-full sm:w-auto bg-slate-900 text-white font-black px-12 py-5 rounded-[2rem] hover:bg-[#08B36A] transition-all duration-500 active:scale-95 flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-xs shadow-2xl shadow-slate-900/20"
              >
                {data.buttonText || "Book Now"}
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-[#08B36A] transition-colors">
                    <FaChevronRight className="text-[10px]" />
                </div>
              </button>
            </div>
          </div>

          {/* RIGHT SECTION: DYNAMIC IMAGE CAROUSEL */}
          <div className="lg:col-span-6 relative order-1 lg:order-2 group">
            
            {/* Background Geometric Shapes */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-50 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-50 rounded-full blur-3xl"></div>

            <div className="relative h-[350px] sm:h-[450px] md:h-[600px] w-full rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-[10px] border-white bg-slate-100">
              {data.carouselImages && data.carouselImages.length > 0 ? (
                data.carouselImages.map((img, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentImg ? "opacity-100 scale-100" : "opacity-0 scale-110"}`}
                  >
                    <img
                      src={img.startsWith("http") ? img : `${API_URL}${img}`}
                      alt={`Emergency Facility ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/1000x800?text=Medical+Image+Not+Found"; }}
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/40 via-transparent to-transparent"></div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full bg-slate-100 text-slate-400">No Images Available</div>
              )}

              {/* Custom Navigation Indicators */}
              <div className="absolute bottom-10 left-10 z-20 flex gap-3">
                {data.carouselImages?.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 transition-all duration-500 rounded-full ${idx === currentImg ? "w-12 bg-[#08B36A]" : "w-4 bg-white/40"}`}
                  />
                ))}
              </div>

              {/* Status Floating Badge */}
              <div className="absolute top-10 right-10 z-20 bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-xl flex items-center gap-4 border border-white">
                 <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-200">
                    <FaStethoscope className="text-xl" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
                    <p className="text-sm font-black text-slate-900 uppercase">Emergency Ready</p>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default MedicalEmergency;