import React, { useState, useEffect } from "react";
import { FaQuoteLeft, FaChevronRight, FaAmbulance } from "react-icons/fa";

function AccidentalEmergency() {
  const [currentImg, setCurrentImg] = useState(0);

  // 1. DATA OBJECT (Easy for backend integration)
  const accidentalEmergencyData = {
    sectionTag: "Emergency Ambulance Service",
    mainTitle: "Accidental Emergency",
    description: "Our accidental emergency ambulance service provides rapid response and life-saving medical care. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Suscipit voluptate nam accusamus aliquid unde aut itaque totam blanditi.",
    brandColor: "#08B36A",
    carouselImages: [
      "https://images.unsplash.com/photo-1587748801476-6218d60ad48c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1599700403969-f77b3aa74837?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1612994370726-5d4d609fca1b?auto=format&fit=crop&w=1000&q=80",
    ]
  };

  // 2. CAROUSEL LOGIC (2.5 Seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev === accidentalEmergencyData.carouselImages.length - 1 ? 0 : prev + 1));
    }, 2500);
    return () => clearInterval(timer);
  }, [accidentalEmergencyData.carouselImages.length]);

  return (
    <section className="py-12 md:py-24 bg-white font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Label (Always visible at top) */}
        <div className="mb-8">
            <h4 className="text-xl md:text-3xl font-black text-slate-800 flex items-center gap-3">
               {accidentalEmergencyData.sectionTag}
               <div className="h-1 w-12 bg-[#08B36A] rounded-full hidden sm:block"></div>
            </h4>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          
          {/* LEFT: IMAGE CAROUSEL SECTION */}
          <div className="relative order-1 lg:order-1 group">
            {/* Background Decorative Frame */}
            <div className="absolute -inset-4 bg-slate-50 rounded-[2.5rem] -rotate-1 hidden lg:block"></div>
            
            <div className="relative h-[250px] sm:h-[400px] md:h-[500px] w-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
              {accidentalEmergencyData.carouselImages.map((img, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === currentImg ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Emergency View ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-[3000ms]"
                    style={{ transform: index === currentImg ? 'scale(1)' : 'scale(1.1)' }}
                  />
                </div>
              ))}
              
              {/* Trust Badge / Indicator Overlay */}
              <div className="absolute top-6 left-6 z-20 bg-red-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                <FaAmbulance className="animate-bounce" />
                <span className="text-xs font-black uppercase tracking-widest leading-none">Emergency</span>
              </div>

              {/* Progress Bars (Bottom) */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {accidentalEmergencyData.carouselImages.map((_, idx) => (
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
          <div className="space-y-6 md:space-y-8 order-2 lg:order-2">
            
            {/* Quote and Title */}
            <div className="relative space-y-4">
              <FaQuoteLeft className="text-5xl md:text-7xl text-[#08B36A]/10 absolute -top-8 -left-6 -z-10" />
              <div className="inline-block p-2 bg-emerald-50 rounded-xl mb-2">
                  <FaQuoteLeft className="text-[#08B36A] text-xl" />
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
                Accidental <span className="text-[#08B36A]">Emergency</span>
              </h2>
            </div>

            {/* Description with Vertical Accent */}
            <div className="relative">
                <div className="absolute -left-5 top-0 bottom-0 w-1 bg-slate-100 hidden md:block rounded-full"></div>
                <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed md:leading-loose max-w-xl italic">
                  "{accidentalEmergencyData.description}"
                </p>
            </div>

            {/* CTA and Subtext */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-4 group">
                 <p className="text-[#08B36A] font-black tracking-widest uppercase text-[10px] sm:text-xs">
                    Take Care Also 
                 </p>
                 <div className="h-px flex-1 max-w-[100px] bg-[#08B36A]/30 transition-all group-hover:max-w-[150px]"></div>
              </div>

              <button className="w-full sm:w-auto bg-white border-2 border-[#08B36A] text-[#08B36A] font-black px-12 py-4 rounded-xl hover:bg-[#08B36A] hover:text-white transition-all duration-300 shadow-lg shadow-[#08B36A]/10 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm">
                Book Now
                <FaChevronRight className="text-xs" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default AccidentalEmergency;