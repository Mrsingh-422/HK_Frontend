"use client";
import React, { useState, useEffect } from "react";
import { FaQuoteLeft, FaChevronRight, FaAmbulance, FaClock, FaShieldAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/app/context/GlobalContext";

// Ensure this matches your .env file logic from the reference
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const STATIC_DATA = {
  sectionTag: "Emergency Ambulance Service",
  mainTitle: "Accidental Emergency",
  description: "Our accidental emergency ambulance service provides rapid response and life-saving medical care. Connect with our dedicated 24/7 team.",
  buttonText: "Book Now",
  carouselImages: [
    "https://images.unsplash.com/photo-1587748801476-6218d60ad48c?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1599700403969-f77b3aa74837?auto=format&fit=crop&w=1000&q=80"
  ]
};

function AccidentalEmergency() {
  const router = useRouter();
  const { getAccidentalEmergencyData } = useGlobalContext();

  const [data, setData] = useState(STATIC_DATA);
  const [currentImg, setCurrentImg] = useState(0);

  // FETCH DYNAMIC CONTENT
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await getAccidentalEmergencyData();
        if (res?.success && res?.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Backend failed, using static fallback.");
      }
    };
    fetchContent();
  }, [getAccidentalEmergencyData]);

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
    <section className="py-20 md:py-32 bg-slate-50/50 font-sans overflow-hidden relative">
      {/* Decorative background cross icons */}
      <div className="absolute top-10 right-10 text-9xl text-slate-100 font-black select-none pointer-events-none">+</div>
      <div className="absolute bottom-10 left-10 text-9xl text-slate-100 font-black select-none pointer-events-none">+</div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Modern Section Header */}
        <div className="flex flex-col items-center lg:items-start mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#08B36A]/10 rounded-full border border-[#08B36A]/20">
            <span className="w-2 h-2 bg-[#08B36A] rounded-full animate-pulse"></span>
            <span className="text-[#08B36A] text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">
              {data.sectionTag}
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter text-center lg:text-left">
            {data.mainTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">

          {/* LEFT: IMAGE CAROUSEL SECTION */}
          <div className="lg:col-span-6 relative order-1 group">
            {/* Artistic Frame */}
            <div className="relative h-[300px] sm:h-[450px] md:h-[550px] w-full rounded-[3.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.1)] border-[12px] border-white bg-white">
              {data.carouselImages && data.carouselImages.length > 0 ? (
                data.carouselImages.map((img, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentImg ? "opacity-100 scale-100" : "opacity-0 scale-110"}`}
                  >
                    <img
                      src={img.startsWith("http") ? img : `${API_URL}${img}`}
                      alt={`Emergency View ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/1000x800?text=Image+Not+Found"; }}
                    />
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full bg-slate-100 text-slate-400">No Images Available</div>
              )}

              {/* Floating Emergency Badge */}
              <div className="absolute top-8 left-8 z-20 bg-red-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                    <FaAmbulance className="animate-bounce text-xl" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none opacity-80">Status</span>
                    <span className="text-sm font-black uppercase tracking-widest">Active SOS</span>
                </div>
              </div>

              {/* Carousel Indicators */}
              <div className="absolute bottom-10 left-10 z-20 flex gap-3">
                {data.carouselImages?.map((_, idx) => (
                  <button
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentImg ? "w-12 bg-[#08B36A]" : "w-4 bg-white/40"}`}
                  />
                ))}
              </div>
            </div>

            {/* Background decorative blob */}
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-[#08B36A]/10 rounded-full blur-3xl -z-10"></div>
          </div>

          {/* RIGHT: CONTENT SECTION */}
          <div className="lg:col-span-6 space-y-10 order-2">
            
            {/* Description Card */}
            <div className="relative bg-white p-8 md:p-12 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
              <FaQuoteLeft className="text-6xl text-[#08B36A]/10 absolute top-8 left-8" />
              
              <div className="relative z-10">
                <p className="text-slate-600 text-lg md:text-2xl leading-relaxed md:leading-relaxed font-medium italic mb-8">
                  "{data.description}"
                </p>

                {/* Service Features (Visual Improvement) */}
                <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#08B36A]">
                            <FaClock />
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Rapid Response</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#08B36A]">
                            <FaShieldAlt />
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Certified Care</span>
                    </div>
                </div>
              </div>
            </div>

            {/* Action Area */}
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <button
                onClick={() => router.push('/ambulance/seeallambulances')}
                className="group cursor-pointer w-full sm:w-auto bg-slate-900 text-white font-black px-12 py-6 rounded-[2rem] hover:bg-[#08B36A] transition-all duration-500 shadow-2xl shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-xs"
              >
                {data.buttonText || "Book Now"}
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-[#08B36A] transition-colors">
                    <FaChevronRight className="text-[10px]" />
                </div>
              </button>

              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-sm">
                        <img src={`https://i.pravatar.cc/150?u=${i + 20}`} alt="doctor" />
                    </div>
                ))}
                <div className="h-12 flex items-center pl-6 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    +120 Expert Staff
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

export default AccidentalEmergency;