"use client";
import React, { useState, useEffect } from "react";
import { FaUserMd, FaHeartbeat, FaStethoscope, FaCheckCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/app/context/GlobalContext";

// Ensure this matches your .env file
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Fallback Icons Mapping
const icons = [<FaStethoscope />, <FaHeartbeat />, <FaUserMd />];

const STATIC_DATA = {
  title: "Only the best care for you and your loved ones",
  subheading: "Get a personalised care plan. Here's what we can help with.",
  description: "Our dedicated professionals ensure the highest quality of healthcare services tailored to your specific needs.",
  points: ["Medical Conditions", "Reasons Of Engagement", "Care By Professionals"],
  carouselImages: [
    "https://images.unsplash.com/photo-1576765608598-0735df749e43?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1584820923423-9983e9a8c982?auto=format&fit=crop&w=1000&q=80"
  ]
};

function OnlyTheBestCare() {
  const router = useRouter();
  const { getOnlyTheBestCareData } = useGlobalContext();

  const [data, setData] = useState(STATIC_DATA);
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await getOnlyTheBestCareData();
        if (res?.success && res?.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Backend fetch failed, using static fallback.");
      }
    };
    fetchContent();
  }, [getOnlyTheBestCareData]);

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
    <section className="py-10 md:py-20 bg-[#f8fafc] font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">

          {/* LEFT: IMAGE CAROUSEL SECTION */}
          <div className="lg:col-span-6 relative order-1 lg:order-1 group">
            <div className="absolute -inset-2 md:-inset-4 bg-slate-50 rounded-[2rem] md:rounded-[3rem] rotate-1 hidden sm:block"></div>

            <div className="relative h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px] w-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-200">
              {data.carouselImages && data.carouselImages.length > 0 ? (
                data.carouselImages.map((img, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImg ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105"}`}
                  >
                    <img
                      // LOGIC: Prepend API_URL if the path is relative (/uploads/...)
                      src={img.startsWith('http') ? img : `${API_URL}${img}`}
                      alt="Care Service"
                      className="w-full h-full object-cover transition-transform duration-[3000ms]"
                      style={{ transform: index === currentImg ? 'scale(1)' : 'scale(1.1)' }}
                      onError={(e) => { e.target.src = "https://via.placeholder.com/800x600?text=Care+Service+Image"; }}
                    />
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full bg-slate-100 text-slate-400">No Images Available</div>
              )}

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {data.carouselImages?.map((_, idx) => (
                  <div key={idx} className={`h-1 rounded-full transition-all duration-300 ${idx === currentImg ? "w-8 bg-[#08B36A]" : "w-2 bg-white/60"}`} />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: CONTENT SECTION */}
          <div className="lg:col-span-6 space-y-6 md:space-y-8 order-2 lg:order-2">

            <div className="space-y-4">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#08B36A] leading-[1.2] tracking-tight whitespace-pre-line">
                {data.title}
              </h2>
              <h4 className="text-slate-800 font-bold text-sm sm:text-base md:text-lg">
                {data.subheading}
              </h4>
            </div>

            <div className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-slate-100 hidden lg:block rounded-full"></div>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                {data.description}
              </p>
            </div>

            {/* Feature Points List */}
            <div className="space-y-4 pt-2">
              {data.points?.map((text, idx) => (
                <div key={idx} className="flex items-center gap-4 group cursor-default">
                  <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-emerald-50 text-[#08B36A] rounded-xl flex items-center justify-center text-xl transition-all duration-300 group-hover:bg-[#08B36A] group-hover:text-white group-hover:scale-110 shadow-sm">
                    {icons[idx] || <FaCheckCircle />}
                  </div>
                  <span className="font-bold text-slate-700 text-sm md:text-lg group-hover:text-[#08B36A] transition-colors">
                    {text}
                  </span>
                  <FaCheckCircle className="ml-auto text-slate-100 group-hover:text-[#08B36A] transition-colors hidden sm:block" />
                </div>
              ))}
            </div>

            <div className="pt-4 md:pt-6">
              <button
                onClick={() => router.push('/nursingservice/seeallnurses')}
                className="cursor-pointer w-full sm:w-auto bg-[#08B36A] hover:bg-slate-900 text-white font-black px-10 py-4 rounded-xl shadow-lg shadow-[#08B36A]/20 transition-all active:scale-95 uppercase tracking-widest text-xs">
                Get Started Now
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

export default OnlyTheBestCare;