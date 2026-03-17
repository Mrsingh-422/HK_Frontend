"use client";
import React, { useState, useEffect } from "react";
import { FaChevronRight, FaCheckCircle, FaClock } from "react-icons/fa";
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
    <section className="py-12 md:py-24 bg-white font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">

          {/* LEFT SECTION: CONTENT */}
          <div className="order-2 lg:order-1 space-y-6 md:space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 leading-tight tracking-tight whitespace-pre-line">
                {data.title}
              </h2>
              <div className="w-20 h-1.5 bg-[#08B36A] rounded-full opacity-30"></div>
            </div>

            <p className="text-slate-600 text-base md:text-xl leading-relaxed max-w-xl">
              {data.description}
            </p>

            <div className="flex items-center gap-3 text-[#08B36A] font-bold text-lg md:text-2xl pt-2">
              <FaCheckCircle className="flex-shrink-0 animate-pulse" />
              <span>{data.highlightText}</span>
            </div>

            <div className="pt-6">
              <button
                onClick={() => router.push('/ambulance/seeallambulances')}
                className="cursor-pointer group relative border-2 border-[#08B36A] text-[#08B36A] font-black px-10 py-4 rounded-xl hover:bg-[#08B36A] hover:text-white transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm shadow-lg shadow-[#08B36A]/10">
                {data.buttonText || "Book Now"}
                <FaChevronRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="flex gap-6 pt-4 border-t border-slate-50 md:hidden">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <FaClock className="text-[#08B36A]" /> 24/7 Response
              </div>
            </div>
          </div>

          {/* RIGHT SECTION: DYNAMIC IMAGE CAROUSEL */}
          <div className="relative order-1 lg:order-2 group">
            <div className="absolute -inset-4 bg-slate-50 rounded-[2.5rem] rotate-2 hidden lg:block"></div>

            <div className="relative h-[280px] sm:h-[400px] md:h-[500px] w-full rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-200">
              {data.carouselImages && data.carouselImages.length > 0 ? (
                data.carouselImages.map((img, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImg ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105"
                      }`}
                  >
                    <img
                      // DYNAMIC URL LOGIC: Prepend API_URL if path is relative (/uploads/...)
                      src={img.startsWith("http") ? img : `${API_URL}${img}`}
                      alt={`Emergency Facility ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-[3000ms]"
                      style={{ transform: index === currentImg ? 'scale(1)' : 'scale(1.1)' }}
                      // FALLBACK LOGIC: Shows placeholder if image fails to load
                      onError={(e) => { e.target.src = "https://via.placeholder.com/1000x800?text=Medical+Image+Not+Found"; }}
                    />
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full bg-slate-100 text-slate-400">No Images Available</div>
              )}

              <div className="absolute bottom-6 right-8 z-20 flex gap-2">
                {data.carouselImages?.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 transition-all duration-300 rounded-full ${idx === currentImg ? "w-8 bg-[#08B36A]" : "w-2 bg-white/60"
                      }`}
                  />
                ))}
              </div>

              <div className="absolute top-6 right-6 z-20 bg-red-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                Live Status
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default MedicalEmergency;