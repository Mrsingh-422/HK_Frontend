import React, { useState, useEffect } from "react";
import { FaUserMd, FaHeartbeat, FaStethoscope, FaCheckCircle } from "react-icons/fa";

function OnlyTheBestCare() {
  const [currentImg, setCurrentImg] = useState(0);

  // 1. CONTENT DATA OBJECT (For easy backend handling later)
  const contentData = {
    title: "Only the best care for you and your loved ones",
    subheading: "Get a personalised care plan. Here's what we can help with.",
    description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. In alias odit temporibus odio quis, perspiciatis modi aliquam accusantium, dignissimos eos, dolore deleniti nesciunt animi aperiam quam asperiores a doloribus? Nobi.",
    brandColor: "#08B36A",
    points: [
      { id: 1, text: "Medical Conditions", icon: <FaStethoscope /> },
      { id: 2, text: "Reasons Of Engagement", icon: <FaHeartbeat /> },
      { id: 3, text: "Care By Professionals", icon: <FaUserMd /> },
    ],
    carouselImages: [
      "https://images.unsplash.com/photo-1576765608598-0735df749e43?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1584820923423-9983e9a8c982?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1516703094088-08208387bbb1?auto=format&fit=crop&w=1000&q=80"
    ]
  };

  // 2. CAROUSEL LOGIC (2.5 Seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev === contentData.carouselImages.length - 1 ? 0 : prev + 1));
    }, 2500);
    return () => clearInterval(timer);
  }, [contentData.carouselImages.length]);

  return (
    <section className="py-10 md:py-20 bg-[#f8fafc] font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid: Mobile (1 Col) | Desktop (2 Col) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          
          {/* LEFT: IMAGE CAROUSEL SECTION */}
          <div className="lg:col-span-6 relative order-1 lg:order-1 group">
            {/* Background Decorative Frame */}
            <div className="absolute -inset-2 md:-inset-4 bg-slate-50 rounded-[2rem] md:rounded-[3rem] rotate-1 hidden sm:block"></div>
            
            <div className="relative h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px] w-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-200">
              {contentData.carouselImages.map((img, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === currentImg ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Care Service ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-[3000ms]"
                    style={{ transform: index === currentImg ? 'scale(1)' : 'scale(1.1)' }}
                  />
                </div>
              ))}
              
              {/* Carousel Indicators (Bars) */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {contentData.carouselImages.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      idx === currentImg ? "w-8 bg-[#08B36A]" : "w-2 bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: CONTENT SECTION */}
          <div className="lg:col-span-6 space-y-6 md:space-y-8 order-2 lg:order-2">
            
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#08B36A] leading-[1.2] tracking-tight">
                {contentData.title}
              </h2>
              <h4 className="text-slate-800 font-bold text-sm sm:text-base md:text-lg">
                {contentData.subheading}
              </h4>
            </div>

            <div className="relative">
                {/* Visual Accent Bar from your screenshot */}
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-slate-100 hidden lg:block rounded-full"></div>
                <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                  {contentData.description}
                </p>
            </div>

            {/* Feature Points List */}
            <div className="space-y-4 pt-2">
              {contentData.points.map((point) => (
                <div key={point.id} className="flex items-center gap-4 group cursor-default">
                  <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-emerald-50 text-[#08B36A] rounded-xl flex items-center justify-center text-xl transition-all duration-300 group-hover:bg-[#08B36A] group-hover:text-white group-hover:scale-110 shadow-sm">
                    {point.icon}
                  </div>
                  <span className="font-bold text-slate-700 text-sm md:text-lg group-hover:text-[#08B36A] transition-colors">
                    {point.text}
                  </span>
                  <FaCheckCircle className="ml-auto text-slate-100 group-hover:text-[#08B36A] transition-colors hidden sm:block" />
                </div>
              ))}
            </div>

            {/* Mobile-Friendly Action Button (Added for better UX) */}
            <div className="pt-4 md:pt-6">
                <button className="w-full sm:w-auto bg-[#08B36A] hover:bg-slate-900 text-white font-black px-10 py-4 rounded-xl shadow-lg shadow-[#08B36A]/20 transition-all active:scale-95 uppercase tracking-widest text-xs">
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