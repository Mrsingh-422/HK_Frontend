"use client";
import React, { useState, useEffect } from "react";
import { FaCheck } from "react-icons/fa";
import { useGlobalContext } from "@/app/context/GlobalContext";

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
    if (data.carouselImages?.length > 1) {
        const timer = setInterval(() => {
            setCurrentImg((prev) => (prev === data.carouselImages.length - 1 ? 0 : prev + 1));
        }, 2500);
        return () => clearInterval(timer);
    }
  }, [data.carouselImages]);

  return (
    <section className="py-8 md:py-16 bg-[#f8fafc] font-sans overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 items-stretch gap-4 md:gap-0">
          
          {/* LEFT: IMAGE CAROUSEL */}
          <div className="relative h-[220px] sm:h-[300px] md:h-auto min-h-[300px] md:min-h-[450px] overflow-hidden rounded-t-[2rem] md:rounded-t-none md:rounded-l-[2.5rem] shadow-xl md:shadow-none z-10">
            {data.carouselImages?.map((img, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentImg ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <img src={img} alt="Nursing" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
            ))}

            <div className="absolute bottom-4 right-6 z-20 flex gap-1.5">
               {data.carouselImages?.map((_, i) => (
                 <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === currentImg ? 'w-5 bg-[#08B36A]' : 'w-1.5 bg-white/50'}`}></div>
               ))}
            </div>
          </div>

          {/* RIGHT: CONTENT BOX */}
          <div className="bg-[#08B36A] p-6 sm:p-10 md:p-12 lg:p-16 rounded-b-[2rem] md:rounded-b-none md:rounded-r-[2.5rem] text-white flex flex-col justify-center relative overflow-hidden group">
            
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>

            <div className="relative z-10 space-y-4 md:space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                  {data.title}
                </h2>
                <div className="w-10 h-1 bg-white/40 rounded-full"></div>
              </div>

              <p className="text-white/90 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed max-w-md">
                {data.description}
              </p>

              {/* Dynamic Service List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 sm:gap-y-4 gap-x-4 pt-4">
                {data.services?.map((service, index) => (
                  <div key={index} className="flex items-center gap-2 group/item cursor-default">
                    <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover/item:bg-white group-hover/item:text-[#08B36A] transition-all">
                      <FaCheck className="text-[10px] md:text-xs" />
                    </div>
                    <span className="font-bold text-[10px] md:text-xs lg:text-sm uppercase tracking-wider">
                      {service}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-6 md:pt-8">
                <button className="bg-white text-[#08B36A] font-black px-6 py-2.5 md:px-8 md:py-3 rounded-lg text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-slate-900 hover:text-white transition-all active:scale-95">
                  Learn More
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default OurNursingServices;